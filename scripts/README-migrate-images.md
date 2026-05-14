# Migration images véhicules → Supabase Storage

Ce script télécharge toutes les images véhicules externes, les convertit en WebP (qualité 80)
et les upload dans Supabase Storage, puis met à jour la base de données.

## Pré-requis

```bash
# sharp est déjà installé dans le projet
npm install   # si pas encore fait
```

## Variables d'environnement

Copier depuis `.env.local` (déjà présentes dans le projet) :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_GARAGE_ID=uuid-du-garage
```

## Commandes

### Lancer la migration complète

```bash
npx tsx scripts/migrate-images.ts
```

### Mode simulation (aucune écriture)

```bash
DRY_RUN=true npx tsx scripts/migrate-images.ts
```

### Migrer un seul véhicule (debug / test)

```bash
VEHICLE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx npx tsx scripts/migrate-images.ts
```

### Ajouter comme script npm

Dans `package.json` :

```json
{
  "scripts": {
    "migrate-images": "npx tsx scripts/migrate-images.ts",
    "migrate-images:dry": "DRY_RUN=true npx tsx scripts/migrate-images.ts"
  }
}
```

Puis :

```bash
npm run migrate-images
npm run migrate-images:dry
```

## Ce que fait le script

```
Pour chaque véhicule (batch de 10, pause 1s entre batches) :

  1. Analyse
     ├─ Lecture vehicle_images (DB)
     ├─ Fallback sur vehicles.images[] (legacy)
     └─ Détection des doublons

  2. Par image externe :
     ├─ Check idempotence (storage_path déjà en DB → skip)
     ├─ Téléchargement (retry ×3, support srcset/data-src)
     ├─ Conversion WebP qualité 80 via sharp
     ├─ Upload Supabase Storage (bucket: vehicle-images, path: cars/)
     ├─ Mise à jour vehicle_images (url + storage_path + dimensions)
     └─ Mise à jour vehicles (images[], thumbnail_url)
```

## Naming des fichiers Storage

```
cars/{vehicle_id}-{slug-marque-modele-annee}-{index:02d}.webp

Exemple :
  cars/abc12345-toyota-corolla-2020-00.webp   ← image principale
  cars/abc12345-toyota-corolla-2020-01.webp   ← image 2
  cars/abc12345-toyota-corolla-2020-02.webp   ← image 3
```

Le path est **déterministe** → re-lancer le script est safe (idempotent).

## Idempotence

Le script est conçu pour être relancé sans risque :

| Condition | Action |
|-----------|--------|
| `vehicle_images.storage_path` déjà renseigné | Skip (image déjà migrée) |
| URL source déjà dans Supabase Storage | Skip |
| Upload déjà fait (`upsert: true`) | Écrasement sans duplication |

## Logs

Le script génère un fichier de log détaillé :

```
scripts/migrate-images-log.json
```

Contient : timestamp, niveau (info/warn/error), contexte, message.

## En cas d'erreur

- Une erreur sur une image **n'arrête pas le véhicule**
- Une erreur critique sur un véhicule **n'arrête pas le batch**
- Le script se termine avec `exit(1)` si au moins un véhicule est en erreur
- Relancer le script reprend où il s'était arrêté (idempotence)

## Après la migration

Vérifier dans Supabase Dashboard :
- **Storage** → bucket `vehicle-images` → dossier `cars/`
- **Table Editor** → `vehicle_images` : colonne `storage_path` renseignée, `url` pointe vers `supabase.co/storage`
- **Table Editor** → `vehicles` : `thumbnail_url` et `images[]` mis à jour
