/**
 * Optimise l'illustration 404 : PNG → WebP 760px large, qualité 85.
 * Usage : node scripts/optimize-404-illustration.mjs <chemin/vers/source.png>
 *
 * Sortie : public/images/404-illustration.webp
 */
import sharp from "sharp";
import { resolve, basename } from "path";
import { existsSync } from "fs";

const src = process.argv[2];
if (!src) {
  console.error("Usage: node scripts/optimize-404-illustration.mjs <source.png>");
  process.exit(1);
}

const input = resolve(src);
if (!existsSync(input)) {
  console.error(`Fichier introuvable : ${input}`);
  process.exit(1);
}

const output = resolve("public/images/404-illustration.webp");

const { width, height } = await sharp(input).metadata();
console.log(`Source : ${basename(input)} — ${width}×${height}px`);

await sharp(input)
  .resize({
    width: 760,           // 2× la taille max affichée (380px × retina)
    withoutEnlargement: true,
  })
  .webp({ quality: 85, effort: 6 })
  .toFile(output);

const { size } = await import("fs").then(m => m.promises.stat(output));
console.log(`✓ Exporté → ${output}`);
console.log(`  Taille : ${(size / 1024).toFixed(1)} Ko`);
