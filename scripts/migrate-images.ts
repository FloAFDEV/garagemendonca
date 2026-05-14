/**
 * migrate-images.ts
 *
 * Migre et normalise toutes les images véhicules vers Supabase Storage.
 * Version production-ready : déduplication SHA1, normalisation, concurrence contrôlée.
 *
 * Pipeline par image : download → SHA1 → resize → WebP → storage check → upload → syncDB
 *
 * Usage :
 *   npx tsx scripts/migrate-images.ts
 *   DRY_RUN=true   npx tsx scripts/migrate-images.ts   # simulation, aucune écriture
 *   VEHICLE_ID=uuid npx tsx scripts/migrate-images.ts  # cibler un seul véhicule
 *
 * Variables (.env.local) :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_GARAGE_ID
 */

import * as fs     from "fs";
import * as path   from "path";
import * as https  from "https";
import * as http   from "http";
import * as crypto from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";

// ─────────────────────────────────────────────────────────────────
//  Chargement .env.local
// ─────────────────────────────────────────────────────────────────

const envFile = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

// ─────────────────────────────────────────────────────────────────
//  Configuration
// ─────────────────────────────────────────────────────────────────

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const GARAGE_ID         = process.env.NEXT_PUBLIC_GARAGE_ID ?? "";
const DRY_RUN           = process.env.DRY_RUN === "true";
const TARGET_VEHICLE_ID = process.env.VEHICLE_ID ?? null;

const BUCKET           = "vehicle-images";
const STORAGE_PATH     = "cars";
const WEBP_QUALITY     = 80;
const MAX_WIDTH        = 1600;  // px — resize si plus large
const MIN_WIDTH        = 300;   // px — rejeter les images trop petites
const BATCH_SIZE       = 10;
const BATCH_PAUSE      = 1000;  // ms entre batches
const MAX_RETRIES      = 3;
const RETRY_DELAY      = 1500;  // ms base (multiplié par tentative)
const MAX_IMAGES       = 15;
const MAX_CONCURRENCY  = 3;     // images en parallèle par véhicule

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !GARAGE_ID) {
  console.error("❌ Variables manquantes : NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_GARAGE_ID");
  process.exit(1);
}

const db: SupabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ─────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────

interface DbVehicle {
  id: string;
  garage_id: string;
  brand: string;
  model: string;
  year: number;
  images: string[];
  thumbnail_url: string | null;
  slug: string | null;
  status: string;
}

interface DbVehicleImage {
  id: string;
  vehicle_id: string;
  garage_id: string;
  url: string;
  storage_path: string | null;
  sort_order: number;
  is_primary: boolean;
  alt: string | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  hash: string | null;
}

interface ImageSource {
  rowId: string | null;
  url: string;
  index: number;      // position séquentielle (0,1,2…) — sert au nommage Storage
  sortOrder: number;  // valeur originale DB sort_order — sert à l'écriture en DB
  isPrimary: boolean;
  alt: string;
}

interface ProcessedImage {
  buffer: Buffer;
  hash: string;
  width: number;
  height: number;
  fileSize: number;
  storagePath: string;
  publicUrl: string;
}

interface SyncImagePayload {
  rowId: string | null;
  vehicleId: string;
  garageId: string;
  storagePath: string;
  publicUrl: string;
  sortOrder: number;  // valeur originale DB — écrite dans sort_order
  isPrimary: boolean;
  alt: string;
  width: number;
  height: number;
  fileSize: number;
  hash: string;
}

// Résultat par image pour le log structuré
type ImageOutcome =
  | { url: string; index: number; status: "migrated"; storagePath: string; hash: string; kb: number }
  | { url: string; index: number; status: "skipped";  reason: string }
  | { url: string; index: number; status: "error";    message: string };

// Résultat par véhicule
type VehicleResult =
  | { vehicleId: string; label: string; status: "success"; migrated: number; skipped: number; errors: number; images: ImageOutcome[] }
  | { vehicleId: string; label: string; status: "error";   message: string }
  | { vehicleId: string; label: string; status: "skipped"; reason: string };

// Erreur personnalisée pour images trop petites
class ImageTooSmallError extends Error {
  constructor(width: number) {
    super(`Image trop petite : ${width}px < ${MIN_WIDTH}px minimum`);
    this.name = "ImageTooSmallError";
  }
}

// ─────────────────────────────────────────────────────────────────
//  Sémaphore — concurrence contrôlée sans dépendance externe
// ─────────────────────────────────────────────────────────────────

class Semaphore {
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(private readonly limit: number) {}

  async acquire(): Promise<void> {
    if (this.running < this.limit) {
      this.running++;
      return;
    }
    return new Promise((resolve) => {
      this.queue.push(() => { this.running++; resolve(); });
    });
  }

  release(): void {
    this.running--;
    const next = this.queue.shift();
    if (next) next();
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

// ─────────────────────────────────────────────────────────────────
//  Utilitaires
// ─────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function sha1(buf: Buffer): string {
  return crypto.createHash("sha1").update(buf).digest("hex");
}

function isSupabaseUrl(url: string): boolean {
  return url.includes("supabase.co/storage") || url.includes("/storage/v1/object/");
}

function isExternalUrl(url: string): boolean {
  return (url.startsWith("http://") || url.startsWith("https://")) && !isSupabaseUrl(url);
}

/**
 * Extrait la meilleure URL depuis un attribut srcset.
 * Ex: "img-400.jpg 400w, img-800.jpg 800w" → "img-800.jpg"
 */
function extractBestFromSrcset(srcset: string): string | null {
  const entries = srcset
    .split(",")
    .map((s) => s.trim().split(/\s+/))
    .filter((parts) => parts.length >= 1 && parts[0]);

  if (entries.length === 0) return null;

  const withWidth = entries
    .map(([url, descriptor]) => {
      const match = descriptor?.match(/^(\d+(?:\.\d+)?)[wx]$/);
      return { url, value: match ? parseFloat(match[1]) : 1 };
    })
    .sort((a, b) => b.value - a.value);

  return withWidth[0]?.url ?? null;
}

/**
 * Normalise une URL image depuis n'importe quel attribut HTML
 * (src, data-src, data-original, data-lazy-src, srcset, data-srcset).
 */
function normalizeImageUrl(raw: string, base?: string): string | null {
  if (!raw?.trim()) return null;
  const trimmed = raw.trim();

  // Cas srcset : contient une virgule ET un descripteur de largeur/densité
  if (/,\s*\S+\s+\d+[wx]/.test(trimmed)) {
    const best = extractBestFromSrcset(trimmed);
    if (best) return normalizeImageUrl(best, base);
  }

  // Gérer les URLs relatives ou absolues
  try {
    const url = new URL(trimmed, base);
    return url.href;
  } catch {
    return null;
  }
}

/**
 * Extrait toutes les URLs candidates depuis une chaîne brute.
 * Gère : src, data-src, data-original, data-lazy-src, data-srcset.
 */
function extractUrlsFromRawValue(raw: string, base?: string): string[] {
  const candidates: string[] = [];

  // Si ça ressemble à un srcset
  if (/\d+[wx]/.test(raw) && raw.includes(",")) {
    const best = extractBestFromSrcset(raw);
    if (best) {
      const normalized = normalizeImageUrl(best, base);
      if (normalized) candidates.push(normalized);
    }
    return candidates;
  }

  // Sinon, URL directe
  const normalized = normalizeImageUrl(raw, base);
  if (normalized) candidates.push(normalized);

  return candidates;
}

// ─────────────────────────────────────────────────────────────────
//  1. fetchVehicles()
// ─────────────────────────────────────────────────────────────────

async function fetchVehicles(): Promise<{
  vehicles: DbVehicle[];
  imagesByVehicle: Map<string, DbVehicleImage[]>;
}> {
  log("info", "fetchVehicles", "Chargement des véhicules…");

  let query = db
    .from("vehicles")
    .select("id, garage_id, brand, model, year, images, thumbnail_url, slug, status")
    .eq("garage_id", GARAGE_ID)
    .order("created_at", { ascending: true });

  if (TARGET_VEHICLE_ID) {
    query = query.eq("id", TARGET_VEHICLE_ID);
  }

  const { data: vehicles, error: vErr } = await query;
  if (vErr) throw new Error(`fetchVehicles: ${vErr.message}`);

  const list = (vehicles ?? []) as DbVehicle[];
  log("info", "fetchVehicles", `${list.length} véhicule(s) chargé(s)`);

  const imagesByVehicle = new Map<string, DbVehicleImage[]>();
  const ID_BATCH = 100;
  const allIds = list.map((v) => v.id);

  for (let i = 0; i < allIds.length; i += ID_BATCH) {
    const ids = allIds.slice(i, i + ID_BATCH);
    const { data: imgs, error: iErr } = await db
      .from("vehicle_images")
      .select("id, vehicle_id, garage_id, url, storage_path, sort_order, is_primary, alt, mime_type, width, height, file_size, hash")
      .in("vehicle_id", ids)
      .order("sort_order", { ascending: true });

    if (iErr) throw new Error(`fetchVehicleImages: ${iErr.message}`);

    for (const img of (imgs ?? []) as DbVehicleImage[]) {
      const arr = imagesByVehicle.get(img.vehicle_id) ?? [];
      arr.push(img);
      imagesByVehicle.set(img.vehicle_id, arr);
    }
  }

  return { vehicles: list, imagesByVehicle };
}

// ─────────────────────────────────────────────────────────────────
//  2. extractImages() — sources dédupliquées avec support lazy-load
// ─────────────────────────────────────────────────────────────────

function extractImages(
  vehicle: DbVehicle,
  existingImages: DbVehicleImage[],
): { sources: ImageSource[]; duplicates: string[] } {
  const seen  = new Set<string>();
  const dupes: string[] = [];
  const sources: ImageSource[] = [];
  const vehicleLabel = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;

  // seqIdx : compteur séquentiel indépendant du sort_order DB.
  // Garantit des storage paths uniques même si plusieurs rows ont le même sort_order.
  let seqIdx = 0;

  const addUrl = (raw: string, rowId: string | null, dbSortOrder: number, isPrimary: boolean) => {
    const candidates = extractUrlsFromRawValue(raw);

    // Chercher aussi des patterns lazy-load éventuellement embarqués dans la valeur brute
    const dataPatterns = [
      /data-src=["']([^"']+)["']/,
      /data-original=["']([^"']+)["']/,
      /data-lazy-src=["']([^"']+)["']/,
      /data-srcset=["']([^"']+)["']/,
    ];

    for (const pattern of dataPatterns) {
      const m = raw.match(pattern);
      if (m?.[1]) {
        const extra = extractUrlsFromRawValue(m[1]);
        candidates.push(...extra);
      }
    }

    // Prendre la première URL valide non-dupliquée
    for (const url of candidates) {
      if (!url) continue;
      if (seen.has(url)) { dupes.push(url); continue; }
      seen.add(url);
      const idx = seqIdx++;
      sources.push({
        rowId,
        url,
        index:     idx,           // position séquentielle → nommage Storage (-00, -01…)
        sortOrder: dbSortOrder,   // valeur DB d'origine → écrite dans vehicle_images.sort_order
        isPrimary,
        alt: `${vehicleLabel}${idx > 0 ? ` — photo ${idx + 1}` : ""}`,
      });
      return;
    }
  };

  if (existingImages.length > 0) {
    existingImages.slice(0, MAX_IMAGES).forEach((img, i) =>
      addUrl(img.url, img.id, img.sort_order ?? i, img.is_primary)
    );
  } else if (vehicle.images?.length > 0) {
    vehicle.images.slice(0, MAX_IMAGES).forEach((url, i) =>
      addUrl(url, null, i, i === 0)
    );
  }

  return { sources, duplicates: dupes };
}

// ─────────────────────────────────────────────────────────────────
//  3. processImage() — download + SHA1 + resize + WebP
// ─────────────────────────────────────────────────────────────────

async function downloadWithRetry(url: string, redirectCount = 0): Promise<Buffer> {
  if (redirectCount > 5) throw new Error(`Trop de redirections pour ${url}`);

  return new Promise((resolve, reject) => {
    const client = url.startsWith("https://") ? https : http;
    const req = client.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GarageMigration/1.0)",
        "Accept": "image/webp,image/avif,image/*,*/*",
      },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const next = new URL(res.headers.location, url).href;
        res.resume();
        resolve(downloadWithRetry(next, redirectCount + 1));
        return;
      }

      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode} pour ${url}`));
        return;
      }

      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    });

    req.on("timeout", () => { req.destroy(); reject(new Error(`Timeout ${url}`)); });
    req.on("error", reject);
  });
}

async function retryOperation<T>(fn: () => Promise<T>, label: string, attempts = MAX_RETRIES): Promise<T> {
  let lastErr: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts) {
        log("warn", label, `Tentative ${i}/${attempts} échouée, retry dans ${RETRY_DELAY * i}ms…`);
        await sleep(RETRY_DELAY * i);
      }
    }
  }
  throw lastErr;
}

async function processImage(source: ImageSource, vehicle: DbVehicle): Promise<ProcessedImage> {
  // 1. Téléchargement avec retry
  const rawBuffer = await retryOperation(
    () => downloadWithRetry(source.url),
    `download:${vehicle.id}:${source.index}`,
  );

  // 2. SHA1 du buffer brut (avant conversion) — permet déduplication contenu identique
  const rawHash = sha1(rawBuffer);

  // 3. Normalisation et conversion WebP
  const sharpInstance = sharp(rawBuffer);
  const meta = await sharpInstance.metadata();

  if (meta.width && meta.width < MIN_WIDTH) {
    throw new ImageTooSmallError(meta.width);
  }

  const resized = meta.width && meta.width > MAX_WIDTH
    ? sharpInstance.resize(MAX_WIDTH, undefined, { fit: "inside", withoutEnlargement: true })
    : sharpInstance;

  const { data: webpBuffer, info } = await resized
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  // 4. Calcul du storage path déterministe
  const slug       = vehicle.slug ?? slugify(`${vehicle.brand}-${vehicle.model}-${vehicle.year}`);
  const fileName   = `${vehicle.id}-${slug}-${String(source.index).padStart(2, "0")}.webp`;
  const storagePath = `${STORAGE_PATH}/${fileName}`;
  const publicUrl  = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;

  return {
    buffer:      webpBuffer,
    hash:        rawHash,
    width:       info.width,
    height:      info.height,
    fileSize:    info.size,
    storagePath,
    publicUrl,
  };
}

// ─────────────────────────────────────────────────────────────────
//  4. uploadToSupabase()
// ─────────────────────────────────────────────────────────────────

async function uploadToSupabase(processed: ProcessedImage): Promise<string> {
  return retryOperation(async () => {
    const { error } = await db.storage
      .from(BUCKET)
      .upload(processed.storagePath, processed.buffer, {
        contentType:  "image/webp",
        upsert:       true,
        cacheControl: "31536000",  // 1 an — images immuables
      });

    if (error) throw new Error(`Upload Storage: ${error.message}`);
    return processed.publicUrl;
  }, `upload:${processed.storagePath}`);
}

// ─────────────────────────────────────────────────────────────────
//  5. checkFileExistsInStorage() — vérification avant upload
// ─────────────────────────────────────────────────────────────────

async function checkFileExistsInStorage(storagePath: string): Promise<boolean> {
  const parts    = storagePath.split("/");
  const filename = parts.pop()!;
  const dir      = parts.join("/");

  const { data } = await db.storage
    .from(BUCKET)
    .list(dir, { search: filename, limit: 1 });

  return (data ?? []).some((f) => f.name === filename);
}

// ─────────────────────────────────────────────────────────────────
//  6. syncDB()
// ─────────────────────────────────────────────────────────────────

async function syncDB(payload: SyncImagePayload): Promise<void> {
  const row = {
    vehicle_id:   payload.vehicleId,
    garage_id:    payload.garageId,
    url:          payload.publicUrl,
    storage_path: payload.storagePath,
    sort_order:   payload.sortOrder,
    is_primary:   payload.isPrimary,
    alt:          payload.alt,
    mime_type:    "image/webp",
    width:        payload.width,
    height:       payload.height,
    file_size:    payload.fileSize,
    hash:         payload.hash,
  };

  if (payload.rowId) {
    const { error } = await db.from("vehicle_images").update(row).eq("id", payload.rowId);
    if (error) throw new Error(`syncDB update: ${error.message}`);
  } else {
    const { error } = await db.from("vehicle_images").insert({ ...row, id: undefined });
    if (error) throw new Error(`syncDB insert: ${error.message}`);
  }
}

async function updateVehicleThumbnail(vehicleId: string, allStorageUrls: string[]): Promise<void> {
  const { error } = await db
    .from("vehicles")
    .update({ thumbnail_url: allStorageUrls[0] ?? null, images: allStorageUrls })
    .eq("id", vehicleId);

  if (error) throw new Error(`updateVehicleThumbnail: ${error.message}`);
}

// ─────────────────────────────────────────────────────────────────
//  Orchestration par véhicule — avec sémaphore
// ─────────────────────────────────────────────────────────────────

async function processVehicle(
  vehicle: DbVehicle,
  existingImages: DbVehicleImage[],
): Promise<VehicleResult> {
  const label = `${vehicle.brand} ${vehicle.model} ${vehicle.year} (${vehicle.id.slice(0, 8)}…)`;
  log("info", label, `▶  Début — ${existingImages.length} image(s) en DB, ${vehicle.images?.length ?? 0} legacy`);

  const { sources, duplicates } = extractImages(vehicle, existingImages);

  if (duplicates.length > 0) {
    log("warn", label, `${duplicates.length} doublon(s) ignoré(s)`);
  }

  if (sources.length === 0) {
    log("warn", label, "Aucune image source — véhicule ignoré");
    return { vehicleId: vehicle.id, label, status: "skipped", reason: "no images" };
  }

  log("info", label, `${sources.length} image(s) source trouvée(s)`);

  // Construire un Set des hashs déjà en DB pour ce véhicule (déduplication)
  const existingHashes = new Set(existingImages.map((i) => i.hash).filter(Boolean) as string[]);

  const semaphore = new Semaphore(MAX_CONCURRENCY);
  const outcomes: ImageOutcome[] = new Array(sources.length);
  const finalUrls: (string | undefined)[] = new Array(sources.length);

  await Promise.all(
    sources.map((source) =>
      semaphore.run(async () => {
        const srcLabel = `${label} [img ${source.index}]`;

        try {
          // Cas 1 : déjà une URL Supabase Storage → skip
          if (isSupabaseUrl(source.url)) {
            log("info", srcLabel, `✓ Déjà migrée → ${source.url.slice(-40)}`);
            finalUrls[source.index] = source.url;
            outcomes[source.index] = { url: source.url, index: source.index, status: "skipped", reason: "already in storage" };
            return;
          }

          // Cas 2 : URL non supportée
          if (!isExternalUrl(source.url)) {
            log("warn", srcLabel, `URL non supportée : ${source.url.slice(0, 60)}`);
            outcomes[source.index] = { url: source.url, index: source.index, status: "skipped", reason: "unsupported url" };
            return;
          }

          // Cas 3 : storage_path déjà en DB → idempotence par chemin
          const slug        = vehicle.slug ?? slugify(`${vehicle.brand}-${vehicle.model}-${vehicle.year}`);
          const storagePath = `${STORAGE_PATH}/${vehicle.id}-${slug}-${String(source.index).padStart(2, "0")}.webp`;
          const existingRow = existingImages.find((i) => i.storage_path === storagePath);

          if (existingRow?.storage_path) {
            log("info", srcLabel, `✓ storage_path déjà en DB → skip`);
            finalUrls[source.index] = existingRow.url;
            outcomes[source.index] = { url: source.url, index: source.index, status: "skipped", reason: "storage_path in DB" };
            return;
          }

          // DRY_RUN — simuler sans écrire
          if (DRY_RUN) {
            log("info", srcLabel, `[DRY_RUN] → simulé pour ${source.url.slice(0, 70)}`);
            finalUrls[source.index] = source.url;
            outcomes[source.index] = { url: source.url, index: source.index, status: "skipped", reason: "dry run" };
            return;
          }

          // ── Pipeline réel ──────────────────────────────────────
          log("info", srcLabel, `⬇  Téléchargement : ${source.url.slice(0, 70)}…`);

          const processed = await retryOperation(
            () => processImage(source, vehicle),
            srcLabel,
          );

          // Cas 4 : hash déjà présent pour ce véhicule → déduplication contenu
          if (existingHashes.has(processed.hash)) {
            log("info", srcLabel, `✓ Hash déjà connu pour ce véhicule → skip (${processed.hash.slice(0, 8)})`);
            outcomes[source.index] = { url: source.url, index: source.index, status: "skipped", reason: `duplicate hash ${processed.hash.slice(0, 8)}` };
            return;
          }

          // Cas 5 : fichier déjà présent dans Storage (protection upload double)
          const existsInStorage = await checkFileExistsInStorage(processed.storagePath);
          if (existsInStorage && existingRow) {
            log("info", srcLabel, `✓ Déjà dans Storage (fichier existant) → skip`);
            finalUrls[source.index] = existingRow.url;
            outcomes[source.index] = { url: source.url, index: source.index, status: "skipped", reason: "file exists in storage" };
            return;
          }

          log("info", srcLabel, `✓ WebP ${processed.width}×${processed.height} — ${Math.round(processed.fileSize / 1024)} Ko — hash ${processed.hash.slice(0, 8)}`);

          // Upload
          const publicUrl = await uploadToSupabase(processed);
          log("info", srcLabel, `✓ Uploadé → ${processed.storagePath}`);

          // DB sync
          await syncDB({
            rowId:       source.rowId,
            vehicleId:   vehicle.id,
            garageId:    vehicle.garage_id,
            storagePath: processed.storagePath,
            publicUrl,
            sortOrder:   source.sortOrder,
            isPrimary:   source.isPrimary,
            alt:         source.alt,
            width:       processed.width,
            height:      processed.height,
            fileSize:    processed.fileSize,
            hash:        processed.hash,
          });

          existingHashes.add(processed.hash);
          finalUrls[source.index] = publicUrl;
          outcomes[source.index] = {
            url:         source.url,
            index:       source.index,
            status:      "migrated",
            storagePath: processed.storagePath,
            hash:        processed.hash,
            kb:          Math.round(processed.fileSize / 1024),
          };

        } catch (err) {
          const msg = String(err).slice(0, 150);
          const isSmall = err instanceof ImageTooSmallError;
          log(isSmall ? "warn" : "error", srcLabel, `⚠  ${msg}`);

          // Conserver l'URL originale si disponible
          const existing = existingImages.find((i) => i.id === source.rowId);
          if (existing) finalUrls[source.index] = existing.url;

          outcomes[source.index] = { url: source.url, index: source.index, status: "error", message: msg };
        }
      })
    )
  );

  // Mettre à jour vehicles.images[] + thumbnail_url
  const cleanUrls = finalUrls.filter((u): u is string => !!u);
  if (!DRY_RUN && cleanUrls.length > 0) {
    try {
      await updateVehicleThumbnail(vehicle.id, cleanUrls);
    } catch (err) {
      log("error", label, `⚠  updateVehicleThumbnail: ${String(err).slice(0, 80)}`);
    }
  }

  const migrated = outcomes.filter((o) => o?.status === "migrated").length;
  const skipped  = outcomes.filter((o) => o?.status === "skipped").length;
  const errors   = outcomes.filter((o) => o?.status === "error").length;

  log("info", label, `✅ Terminé — ${migrated} migrée(s), ${skipped} ignorée(s), ${errors} erreur(s)`);

  return {
    vehicleId: vehicle.id,
    label,
    status: "success",
    migrated,
    skipped,
    errors,
    images: outcomes.filter(Boolean),
  };
}

// ─────────────────────────────────────────────────────────────────
//  Analyse initiale
// ─────────────────────────────────────────────────────────────────

function analyseVehicles(vehicles: DbVehicle[], imagesByVehicle: Map<string, DbVehicleImage[]>) {
  const stats = {
    total: vehicles.length,
    noImages: 0,
    legacyOnly: 0,
    alreadyMigrated: 0,
    needsMigration: 0,
    totalImages: 0,
    externalImages: 0,
    supabaseImages: 0,
  };

  for (const v of vehicles) {
    const imgs = imagesByVehicle.get(v.id) ?? [];
    const { sources } = extractImages(v, imgs);
    stats.totalImages    += sources.length;
    stats.externalImages += sources.filter((s) => isExternalUrl(s.url)).length;
    stats.supabaseImages += sources.filter((s) => isSupabaseUrl(s.url)).length;

    if (sources.length === 0)                             stats.noImages++;
    else if (imgs.length === 0)                           stats.legacyOnly++;
    else if (sources.every((s) => isSupabaseUrl(s.url))) stats.alreadyMigrated++;
    else                                                  stats.needsMigration++;
  }

  return stats;
}

// ─────────────────────────────────────────────────────────────────
//  Logging structuré
// ─────────────────────────────────────────────────────────────────

type LogLevel = "info" | "warn" | "error";

interface LogEntry { level: LogLevel; context: string; msg: string; ts: string }

const logEntries: LogEntry[] = [];

function log(level: LogLevel, context: string, msg: string) {
  const ts = new Date().toISOString();
  const icon = level === "error" ? "❌" : level === "warn" ? "⚠️ " : "  ";
  console.log(`${icon} [${ts.slice(11, 19)}] ${context} — ${msg}`);
  logEntries.push({ level, context, msg, ts });
}

function writeLogs(results: VehicleResult[], totalMigrated: number, totalSkipped: number, totalErrors: number) {
  const base = path.join(process.cwd(), "scripts");

  // Log détaillé
  const logPath = path.join(base, "migrate-images-log.json");
  fs.writeFileSync(logPath, JSON.stringify(logEntries, null, 2), "utf8");

  // Résumé structuré par véhicule
  const summary = {
    generatedAt:    new Date().toISOString(),
    mode:           DRY_RUN ? "dry-run" : TARGET_VEHICLE_ID ? "single" : "full",
    targetVehicle:  TARGET_VEHICLE_ID ?? null,
    totals: {
      vehicles: results.length,
      migrated: totalMigrated,
      skipped:  totalSkipped,
      errors:   totalErrors,
    },
    vehicles: results.map((r) => {
      if (r.status === "success") {
        return {
          vehicleId: r.vehicleId,
          label:     r.label,
          status:    r.status,
          migrated:  r.migrated,
          skipped:   r.skipped,
          errors:    r.errors,
          images:    r.images,
        };
      }
      return r;
    }),
  };

  const summaryPath = path.join(base, "migrate-images-summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");

  console.log(`\n📄  Log détaillé  → ${logPath}`);
  console.log(`📊  Résumé JSON   → ${summaryPath}`);
}

// ─────────────────────────────────────────────────────────────────
//  main()
// ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🚗  Migration images véhicules → Supabase Storage");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  GARAGE_ID   : ${GARAGE_ID}`);
  console.log(`  BUCKET      : ${BUCKET}/${STORAGE_PATH}/`);
  console.log(`  MODE        : ${DRY_RUN ? "DRY_RUN" : TARGET_VEHICLE_ID ? `SINGLE (${TARGET_VEHICLE_ID})` : "FULL BATCH"}`);
  console.log(`  CONCURRENCY : ${MAX_CONCURRENCY} images/véhicule`);
  console.log(`  RESIZE      : max ${MAX_WIDTH}px, min ${MIN_WIDTH}px`);
  console.log("");

  let vehicles: DbVehicle[];
  let imagesByVehicle: Map<string, DbVehicleImage[]>;

  try {
    ({ vehicles, imagesByVehicle } = await fetchVehicles());
  } catch (err) {
    console.error("❌ Connexion Supabase échouée :", err);
    process.exit(1);
  }

  if (vehicles.length === 0) {
    console.log("⚠️  Aucun véhicule trouvé.");
    return;
  }

  const stats = analyseVehicles(vehicles, imagesByVehicle);
  console.log("📊  Analyse initiale :");
  console.log(`    Véhicules         : ${stats.total}`);
  console.log(`    Sans images       : ${stats.noImages}`);
  console.log(`    Legacy seulement  : ${stats.legacyOnly}`);
  console.log(`    Déjà migrés       : ${stats.alreadyMigrated}`);
  console.log(`    À migrer          : ${stats.needsMigration}`);
  console.log(`    Total images      : ${stats.totalImages} (${stats.externalImages} ext / ${stats.supabaseImages} Supabase)`);
  console.log("");

  if (stats.externalImages === 0 && stats.needsMigration === 0) {
    console.log("✅  Toutes les images sont déjà dans Supabase Storage. Rien à faire.");
    writeLogs([], 0, 0, 0);
    return;
  }

  if (DRY_RUN) {
    console.log("ℹ️   Mode DRY_RUN : aucune écriture ne sera effectuée.\n");
  }

  console.log(`🔄  Traitement (batch de ${BATCH_SIZE}, pause ${BATCH_PAUSE}ms, ${MAX_CONCURRENCY} img/véhicule)…\n`);

  const results: VehicleResult[] = [];
  let totalMigrated = 0;
  let totalSkipped  = 0;
  let totalErrors   = 0;

  for (let i = 0; i < vehicles.length; i += BATCH_SIZE) {
    const batch = vehicles.slice(i, i + BATCH_SIZE);

    for (const vehicle of batch) {
      const existingImages = imagesByVehicle.get(vehicle.id) ?? [];
      let result: VehicleResult;

      try {
        result = await processVehicle(vehicle, existingImages);
      } catch (err) {
        log("error", vehicle.id, `Erreur critique : ${String(err)}`);
        result = {
          vehicleId: vehicle.id,
          label: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
          status: "error",
          message: String(err),
        };
      }

      results.push(result);

      if (result.status === "success") {
        totalMigrated += result.migrated;
        totalSkipped  += result.skipped;
        totalErrors   += result.errors;
      } else if (result.status === "error") {
        totalErrors++;
      }
    }

    if (i + BATCH_SIZE < vehicles.length) {
      log("info", "batch", `Pause ${BATCH_PAUSE}ms…`);
      await sleep(BATCH_PAUSE);
    }

    const done = Math.min(i + BATCH_SIZE, vehicles.length);
    console.log(`\n  ↳ Progression : ${done}/${vehicles.length} véhicules traités\n`);
  }

  // ── Résumé final ──────────────────────────────────────────────
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  ✅  Migration terminée");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Images migrées  : ${totalMigrated}`);
  console.log(`  Images ignorées : ${totalSkipped}`);
  console.log(`  Erreurs images  : ${totalErrors}`);
  console.log(`  Véhicules KO    : ${results.filter((r) => r.status === "error").length}`);
  console.log("");

  const errorVehicles = results.filter((r): r is Extract<VehicleResult, { status: "error" }> => r.status === "error");
  if (errorVehicles.length > 0) {
    console.log("  ❌ Véhicules en erreur critique :");
    errorVehicles.forEach((r) => console.error(`     ${r.vehicleId} — ${r.message}`));
    console.log("");
  }

  writeLogs(results, totalMigrated, totalSkipped, totalErrors);

  if (errorVehicles.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error("❌ Erreur fatale :", err);
  process.exit(1);
});
