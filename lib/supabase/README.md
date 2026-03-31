# Migration vers Supabase

## Étapes

1. **Créer le projet Supabase** sur [supabase.com](https://supabase.com)

2. **Configurer les variables d'environnement** dans `.env.local` :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   ```

3. **Installer le SDK** :
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

4. **Décommenter `lib/supabase/client.ts`**

5. **Exécuter les CREATE TABLE** depuis chaque repository :
   - `lib/repositories/vehicleRepository.ts` → table `vehicles`
   - `lib/repositories/serviceRepository.ts` → table `services`
   - `lib/repositories/bannerRepository.ts` → table `banners`

6. **Remplacer les implémentations mock** dans chaque repository :
   Chaque méthode a un commentaire `TODO: Supabase →` avec la requête exacte.
   Les signatures de méthodes ne changent pas — l'UI et l'admin ne bougent pas.

7. **Photos véhicules** : activer Supabase Storage, créer le bucket `vehicules-photos`,
   puis remplacer `URL.createObjectURL()` dans les formulaires admin par un upload
   vers `supabase.storage.from("vehicules-photos").upload(...)`.

## Structure des repositories

```
lib/repositories/
  vehicleRepository.ts   → vehicles (CRUD + filtres publics/admin)
  serviceRepository.ts   → services (liste + update)
  bannerRepository.ts    → banners (singleton upsert)
  index.ts               → re-exports centralisés
```

Les pages publiques et admin importent exclusivement depuis `lib/repositories`.

---

## Déploiement multi-garage

Trois stratégies possibles selon la volumétrie et la gouvernance souhaitée.

### Option A — Une instance par garage (recommandée pour démarrer)

Chaque garage est un déploiement Vercel indépendant pointant vers le **même projet Supabase** mais filtrant toutes ses requêtes sur `garage_id`.

```
Vercel projet A  →  NEXT_PUBLIC_GARAGE_ID=garage-mendonca  ┐
Vercel projet B  →  NEXT_PUBLIC_GARAGE_ID=garage-dupont    ├─→ Supabase unique
Vercel projet C  →  NEXT_PUBLIC_GARAGE_ID=garage-lambert   ┘
```

- **Avantages** : une seule base à maintenir, RLS Supabase isole les données, migrations uniques.
- **Inconvénients** : un déploiement Vercel par garage (coût si >10 garages), domaine custom par projet.
- **RLS** : toutes les tables ont une colonne `garage_id UUID NOT NULL` + policy `garage_id = current_setting('app.garage_id')::uuid`.

### Option B — Schémas Postgres séparés par garage

Un seul projet Supabase, un schéma Postgres par garage (`garage_mendonca`, `garage_dupont`…). Le repository switche de schéma selon `ACTIVE_GARAGE_ID`.

- **Avantages** : isolation forte, migrations par schéma possibles.
- **Inconvénients** : complexité opérationnelle élevée (migrations × N schémas), non recommandé au-delà de ~5 garages.

### Option C — Projet Supabase par garage

Chaque garage a son propre projet Supabase (URL + clés distinctes). `lib/config/garage.ts` expose aussi `SUPABASE_URL` et `SUPABASE_ANON_KEY` par instance.

- **Avantages** : isolation maximale, backups indépendants.
- **Inconvénients** : coût × N projets Supabase, opérations en étoile.

**Recommandation** : démarrer avec l'Option A (RLS sur `garage_id`). Migrer en Option C si un garage nécessite un SLA ou une souveraineté des données spécifique.

---

## Stratégie JSONB vs tables normalisées

### JSONB utilisé dans ce projet

| Champ | Table | Raison |
|---|---|---|
| `options` | `vehicles` | ~60 booléens équipement — schema évolutif, requêtes filtrantes rares |
| `features` | `vehicles` | Texte libre structuré (finition, garantie…) — non filtré |

### Quand garder JSONB

- Le champ est **affiché** mais rarement **filtré** ou **agrégé** (ex : liste d'équipements).
- Le schéma évolue souvent (nouvelles options sans migration ALTER TABLE).
- Cardinalité faible (< 100 clés).

### Quand normaliser en table relationnelle

- Filtres fréquents sur une clé du JSONB → index GIN moins performant qu'un index B-tree classique.
- Agrégats métier : "combien de véhicules ont `toit_panoramique` ?" → JOIN > `jsonb @>`.
- Intégrité référentielle requise (FK, contraintes).

### Décision actuelle : `options` reste JSONB

Les options véhicule (toit ouvrant, régulateur adaptatif…) sont affichées en badges, jamais filtrées dans le catalogue public. Un index GIN sur `options` suffit pour les rares requêtes admin. Si un jour le catalogue ajoute un filtre "boîte automatique uniquement", extraire `boite_automatique` en colonne dédiée est une migration triviale (`ALTER TABLE vehicles ADD COLUMN boite_automatique BOOLEAN GENERATED ALWAYS AS ((options->>'boite_automatique')::boolean) STORED`).
