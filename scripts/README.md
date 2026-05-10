# Scripts de migration — Garage Mendonça

## Prérequis

```bash
npm install   # installe cheerio, tsx, dotenv (déjà dans devDependencies)
```

Variables d'environnement dans `.env.local` :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_GARAGE_ID=<uuid-du-garage>
```

---

## Étape 1 — Scraping

```bash
# Scraping complet (12 pages × ~12 véhicules)
npx tsx scripts/scrape-vehicles.ts

# Mode débogage verbeux
DEBUG=true npx tsx scripts/scrape-vehicles.ts

# Limiter à N pages pour test
MAX_PAGES=2 DEBUG=true npx tsx scripts/scrape-vehicles.ts

# Vérifier seulement les liens (pas les fiches détail)
DRY_RUN=true npx tsx scripts/scrape-vehicles.ts
```

Produit : `scripts/scraped-vehicles.json`

### Structure du JSON

```json
{
  "scrapedAt": "2026-05-10T...",
  "totalPages": 12,
  "totalVehicles": 144,
  "vehicles": [
    {
      "externalId": "589",
      "sourceUrl": "https://www.garagemendonca.com/details-honda+jazz...",
      "title": "Honda Jazz 1.4i 83 ch ES / Boite Automatique & 1°Main !",
      "brand": "Honda",
      "model": "Jazz",
      "year": 2008,
      "mileage": 80900,
      "fuel": "Essence",
      "transmission": "Automatique",
      "power": 83,
      "price": 8990,
      "description": "...",
      "images": ["https://www.garagemendonca.com/public/img/big/..."],
      "slug": "honda-jazz-2008-589"
    }
  ]
}
```

---

## Étape 2 — Validation

```bash
# Valider sans importer
VALIDATE_ONLY=true npx tsx scripts/import-vehicles.ts
```

Affiche les champs suspects (mileage=0, prix=0, description courte, etc.).

---

## Étape 3 — Import Supabase

```bash
# Import réel
npx tsx scripts/import-vehicles.ts

# Simulation (aucune écriture DB)
DRY_RUN=true npx tsx scripts/import-vehicles.ts
```

### Idempotence

L'import est **safe à relancer** : chaque véhicule est identifié par `(garage_id, external_id)`.
Si un véhicule existe déjà, il est ignoré (`⏭️ déjà en base`).

### Qu'est-ce qui est inséré ?

Pour chaque véhicule :
- **`vehicles`** : brand, model, year, mileage, fuel, transmission, power, price, description, slug, status=`published`
- **`vehicle_images`** : jusqu'à 10 images, `is_primary=true` pour la première, `sort_order` préservé

---

## Étape 4 — Migration DB (index external_id)

```bash
# Via Supabase MCP ou CLI
supabase db push   # pousse migration 012_external_id_index.sql
```

Ou via le dashboard Supabase → SQL Editor → coller le contenu de `supabase/migrations/012_external_id_index.sql`.

---

## Pagination SEO

Après l'import, les routes paginées sont disponibles :

| Route | Description |
|-------|-------------|
| `/vehicules` | Catalogue complet avec filtres (page principale) |
| `/vehicules/page/1` | Page 1 SEO (12 véhicules, metadata unique) |
| `/vehicules/page/2` | Page 2 SEO |
| `/vehicules/page/N` | Page N, jusqu'à `ceil(total/12)` |

Chaque page `/vehicules/page/[page]` inclut :
- `<title>` unique
- `<meta description>` unique
- `<link rel="canonical">`
- Open Graph + Twitter Card
- JSON-LD `ItemList`

---

## Architecture images post-migration

```
vehicle_images (table)
  ├── is_primary = true  → thumbnail principal
  ├── sort_order 0..9    → ordre galerie
  └── url                → URL absolue garagemendonca.com

Fallback : vehicles.images[] (JSONB legacy, rempli aussi)
```

Le helper `getVehicleImages(vehicle)` gère automatiquement la priorité :
`vehicle_images table > vehicles.images JSONB`

---

## Dépannage

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| `mileage: 0` | Description sans pattern `XX kms du dd/mm/yyyy` | Corriger manuellement après import |
| `year: 2010` (générique) | Année non trouvée dans description | Idem |
| `price: 0` | Prix non structuré sur la page | Corriger via admin |
| Import `409 Conflict` | Slug dupliqué | Le slug inclut l'externalId → rare |
| `HTTP 403` au scraping | Rate limiting du site source | Augmenter `DELAY_MS` dans le script |
