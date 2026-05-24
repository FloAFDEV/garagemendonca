# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # démarrage serveur de développement
npm run build    # build production
npm run start    # démarrer le build de production
npm run lint     # ESLint (next lint)
```

Pas de suite de tests configurée pour l'instant.

## Variables d'environnement requises

```
NEXT_PUBLIC_GARAGE_ID=          # identifiant du garage actif
NEXT_PUBLIC_SUPABASE_URL=       # si Supabase activé
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # si Supabase activé
SUPABASE_SERVICE_ROLE_KEY=      # pour les écritures admin
NEXT_PUBLIC_DEMO_MODE=true      # forcer le mode démo sans Supabase
```

Sans Supabase configuré, l'app bascule automatiquement en mode démo (données statiques).

## Architecture des données — deux couches parallèles

Le projet est en cours de migration vers Supabase. Il existe **deux systèmes de repository qui coexistent** :

### 1. Ancienne couche (`lib/repositories/` + `lib/vehicles.ts`)

- `lib/vehicles.ts` — store in-memory (`_store`) alimenté par `lib/data.ts`
- `lib/repositories/*.ts` — façade qui switche entre mock et Supabase via `DEMO_MODE` / `SUPABASE_ENABLED` (depuis `lib/supabase/readClient.ts`)
- Utilisée par les Server Actions dans `app/admin/vehicules/actions.ts`

### 2. Nouvelle couche (`lib/db/` + `lib/safe-actions/`)

- `lib/db/vehicle.repository.ts` — repository direct Supabase typé, sans fallback mock
- `lib/safe-actions/*.ts` — Server Actions "use server" qui appellent `lib/db/`
- `lib/mappers/vehicle.mapper.ts` — conversion `VehicleRow` (DB) → `Vehicle` (domaine)
- Utilisée par les hooks TanStack Query (`lib/queries/`, `lib/mutations/`)

**Règle actuelle** : les pages publiques et admin récentes utilisent la nouvelle couche (`lib/db/` + `lib/safe-actions/`). L'ancienne couche (`lib/repositories/` + `lib/vehicles.ts`) est maintenue pour le `DemoStoreProvider` et les Server Actions legacy.

## Types — trois niveaux

- `types/index.ts` — types domaine (`Vehicle`, `VehicleStatus`, `Garage`, `Service`, `Banner`…)
- `types/ui.ts` — types présentation (`UIVehicle`, `UIGarage`, `UIMessage`) avec champs computés (`label`, `formattedPrice`…). Les composants n'importent jamais depuis `database.types.ts`.
- `lib/supabase/database.types.ts` — types DB auto-générés Supabase. Jamais importés dans les composants.

La conversion se fait avec les presenters dans `types/ui.ts` (`toUIVehicle`, `toUIGarage`, `toUIMessage`). Les formes intermédiaires existent dans `lib/mappers/` (`vehicleFromDb`).

## Mode démo (admin sans Supabase)

Le `DemoStoreProvider` (`lib/demoStore.tsx`) est un Context React wrappant toutes les pages `/admin` (via `app/admin/layout.tsx`). Il maintient un state local des véhicules et applique une stratégie **write-through** : mise à jour UI immédiate + appel Server Action fire-and-forget pour synchroniser le `_store` serveur et invalider le cache Next.js (`revalidatePath`).

Les images `blob://` (upload local) sont filtrées avant le write-through serveur — seules les URLs `http` sont envoyées.

## Authentification

- `lib/auth/getSession.ts` — utilitaires serveur : `getSession()`, `getUser()`, `getUserRole()`, `requireAdminForGarage()`, `requireSuperAdmin()`
- Utilise `@supabase/ssr` avec cookies (Server Components et Server Actions uniquement)
- Table `garage_users` avec rôles : `superadmin | admin | staff`
- Chaque garage filtre via `garage_id` (colonne sur toutes les tables) + RLS Supabase

## Schéma multi-garage

`NEXT_PUBLIC_GARAGE_ID` (via `lib/config/garage.ts`) identifie le garage actif. Chaque déploiement Vercel pointe vers le même projet Supabase mais filtre sur son `garage_id`. Les tables portent toutes une colonne `garage_id UUID NOT NULL`.

## Options véhicule

- `types/index.ts` — interface `VehicleOptions` (~70 clés boolean + `taille_jantes` + `autres_options`)
- `lib/vehicleOptions.ts` — `OPTION_CATEGORIES` (6 catégories ordonnées), helpers `countActiveOptions`, `getEquipmentLabel`
- Stockées en JSONB dans Supabase (champ `options`), jamais filtrées dans le catalogue public
- Formulaire admin : `components/admin/VehicleOptionsForm.tsx`
- Affichage public : `components/vehicles/VehicleOptionsDisplay.tsx`

## Validation des formulaires

Schémas Zod dans `lib/validation/` (`vehicle.schema.ts`, `garage.schema.ts`, etc.). Formulaires gérés avec `react-hook-form`. Erreurs normalisées via `lib/ui/formErrorMapper.ts`.

## Statuts véhicule

`draft` → non visible | `published` → visible | `scheduled` → visible si `published_at` passé | `sold` → visible avec badge "Vendu". La logique de visibilité publique est dans `lib/vehicles.ts:isPubliclyVisible()`.

## Architecture images véhicule — règles figées (Phase 1-3 terminées)

> **⚠️ Cette architecture est stabilisée. Ne pas modifier sans validation globale.**

### Règle unique d'accès aux URLs image

**`resolveVehicleUrl(source, variant?)` est le seul point d'entrée pour résoudre une URL image.**

```typescript
import { resolveVehicleUrl } from "@/lib/utils/vehicle-images";

resolveVehicleUrl(storagePath, "thumb")   // → VehicleCard, grilles admin
resolveVehicleUrl(storagePath, "medium")  // → galerie slider (défaut)
resolveVehicleUrl(storagePath, "large")   // → lightbox uniquement
```

Cette fonction gère **tous les formats de manière transparente** — le code appelant ne doit jamais connaître le format :
- basePath (no extension) → `{base}-{variant}.webp`
- variant path (`-medium.webp`) → extrait basePath, applique le variant demandé
- legacy single-file (`.webp`, `.jpg`) → retourne l'URL directe, variant ignoré gracieusement
- URL Supabase complète → extrait le path, récurse
- path local (`/images/…`) → retourné tel quel

### Interdictions strictes

- ❌ Ne jamais importer depuis `@/lib/utils/storage` dans les composants UI
- ❌ Ne jamais créer un helper image parallèle (même "temporaire")
- ❌ Ne jamais introduire de logique `isLegacyPath()` / `VARIANT_SUFFIX_RE` dans les composants
- ❌ Ne jamais bypass `resolveVehicleUrl` avec une construction d'URL manuelle

### Format DB

- `vehicle_images.storage_path` = **basePath uniquement** (pas d'extension, pas de suffixe variant)
  - Exemple : `garageId/vehicles/vehicleId/uuid`
  - Migration 027 a normalisé les éventuels écarts
- `vehicle_images.url` = URL medium complète Supabase (fallback display, source canonique historique)
- `vehicles.images[]` JSONB = **legacy fallback uniquement**, conservé temporairement

### Pipeline upload véhicule

```
[client] HEIC→JPEG (heic2any) → POST /api/images/upload-url → signed URL + basePath
→ PUT direct Supabase (bypass Vercel 4.5MB)
→ POST /api/images/process → Sharp génère 3 variants (thumb/medium/large), upsert, retry 3×
→ onUploaded(mediumUrl, basePath)
→ syncVehicleImages() → vehicle_images rows avec storage_path = basePath
```

### Variants

| Variant | Dimensions | Qualité | Usage |
|---------|-----------|---------|-------|
| `thumb` | 480×360 | 75% | VehicleCard (`thumbnailUrl`), grilles admin |
| `medium` | 900×675 | 82% | Galerie slider, URL stockée en DB |
| `large` | 1600×1200 | 85% | Lightbox uniquement |

### Outillage admin

- `GET /api/admin/storage` — audit DB storage : orphelins, null paths, chemins non normalisés
  - **Read-only**, requiert auth admin, ne jamais appeler en prod automatiquement
  - Retourne JSON exploitable pour cleanup batch manuel

### Buckets Supabase

- `vehicle-images` — **public** (CDN permanent, no signed URLs)
- `service-images` — privé (signed URLs via `useVehicleImage` dans l'admin services)
- `banner-images` — privé (pipeline legacy `/api/upload-image`)



- Pages publiques = Server Components (metadata, JSON-LD SEO)
- Pages admin = `"use client"` (pas de metadata)
- Filtres et interactivité → extraits en composants client séparés
- Toujours utiliser `next/image` pour les images publiques
- Toasts : bibliothèque `sonner`

## Supabase — clients

- **Anon** (`lib/supabase/readClient.ts`) — lectures publiques via RLS
- **Service role** (`lib/supabase/supabaseAdminClient.ts`) — écritures admin (auth vérifiée en amont)
- **SSR** (`lib/auth/getSession.ts`) — auth côté serveur, lit les cookies de session
- Le générique `Database` n'est pas utilisé sur le query builder (incompatibilité postgrest-js v12) — la sécurité de type passe par les mappers et les schémas Zod.

## Supabase — Migrations SQL : règle GRANT obligatoire

> **Changement critique en vigueur à partir d'octobre 2026.**
> Supabase arrête l'exposition automatique des nouvelles tables `public` à la Data API.
> Créer une table sans GRANT → `{ "code": "42501", "message": "permission denied for table ..." }`

**Toute nouvelle migration créant une table DOIT inclure les trois blocs suivants**, sans exception :

```sql
-- 1. TABLE
CREATE TABLE IF NOT EXISTS public.example (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id uuid NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  -- colonnes métier…
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. RLS (toujours activer)
ALTER TABLE public.example ENABLE ROW LEVEL SECURITY;

-- 3. GRANTS (obligatoires — adapter anon selon exposition publique ou non)
GRANT SELECT                         ON public.example TO anon;          -- supprimer si données non publiques
GRANT SELECT, INSERT, UPDATE, DELETE ON public.example TO authenticated; -- limité par RLS
GRANT ALL                            ON public.example TO service_role;  -- Edge Functions / scripts admin
```

**Règles :**
- `service_role` doit **toujours** recevoir `GRANT ALL` — sans ça les Edge Functions et `supabaseAdminClient` cassent.
- `anon` reçoit `GRANT SELECT` uniquement pour les données publiques (catalogue, témoignages, galerie…). Pour les données internes (messages, leads, replies), **ne pas granter `anon`**.
- Les tables existantes (créées avant octobre 2026) ne sont pas impactées immédiatement — mais `017_grant_service_role_and_missing_tables.sql` les a toutes patchées préventivement.
- Le template complet est dans `supabase/MIGRATION_TEMPLATE.sql`.

## 🧠 Domaine métier — Garage Mendonça

Ce projet est une plateforme web pour un garage automobile spécialisé dans :

- véhicules japonais (Toyota, Honda, Nissan, Mazda)
- véhicules coréens (Hyundai, Kia)
- véhicules à boîte automatique
- clients ciblés : jeunes permis + personnes âgées

## Objectif business

- générer des leads (appels, formulaires, demandes de devis)
- publier et gérer des annonces véhicules depuis une interface admin mobile-first
- maximiser le SEO local (recherche "garage boîte auto", "voiture japonaise occasion", etc.)
- conversion rapide vers contact téléphonique

## Fonctionnalités critiques

### Annonces véhicules

- création/modification/suppression depuis admin
- galerie images optimisée mobile (Next/Image + lazy loading)
- filtres : marque, boîte auto, prix, kilométrage
- statut : draft / published / sold
- affichage public SEO optimisé

### Leads visiteurs

- formulaire visiteur public (contact / véhicule / demande info)
- enregistrement dans Supabase (table leads)
- envoi automatique d’un email au propriétaire du garage
- affichage dans dashboard admin

### Admin panel

- accès sécurisé par auth Supabase
- création d’annonces depuis mobile ou desktop
- gestion des leads entrants
- gestion des images véhicules

## Contraintes UX/UI

- mobile-first (priorité absolue)
- interface simple pour gérant non technique
- actions rapides (publier une annonce en < 2 min)
- UX type marketplace automobile

## SEO local

- pages optimisées pour requêtes locales :
    - garage boîte automatique
    - voiture japonaise occasion
    - Hyundai Kia occasion
    - garage jeunes permis
- JSON-LD pour annonces véhicules
- metadata dynamiques par véhicule
