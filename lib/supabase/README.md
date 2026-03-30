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
