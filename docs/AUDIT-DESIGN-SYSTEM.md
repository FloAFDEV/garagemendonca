# Audit cohérence visuelle — Design System

> Document de référence. **Aucune des recommandations ci-dessous n'est appliquée
> automatiquement** : elles sont documentées pour arbitrage produit.
>
> Les correctifs déjà appliqués (couleur de marque, doctrine typographique,
> opacités invalides) sont décrits dans le résumé de la PR associée et ne
> figurent pas ici.

---

## 1. Radius (`border-radius`)

**Constat — 7 familles de rayons coexistent sur le front :**

| Classe | Occurrences | Usage observé |
|---|---:|---|
| `rounded-xl` | 177 | cartes, boutons, inputs (dominant) |
| `rounded-full` | 124 | badges, pastilles, avatars (légitime) |
| `rounded-lg` | 102 | boutons, petits conteneurs |
| `rounded-2xl` | 71 | grandes cartes, sections |
| `rounded` (4px) | 53 | divers |
| `rounded-md` | 10 | résiduel |
| `rounded-3xl` | 8 | héros / blocs marketing |

**Incohérence :** un même niveau hiérarchique (ex. carte) utilise tantôt
`rounded-lg`, `rounded-xl` ou `rounded-2xl` selon le composant. Le couple
`rounded` (4px) + `rounded-md` (6px) fait doublon avec `rounded-lg` (8px) sans
règle claire.

**Recommandation :** définir une échelle sémantique à 3 niveaux et la documenter
dans `tailwind.config.ts` :
- `rounded-lg` → contrôles (boutons, inputs, badges carrés)
- `rounded-xl` → cartes et conteneurs
- `rounded-full` → pastilles/avatars uniquement

Retirer progressivement `rounded` (4px), `rounded-md`, `rounded-3xl` au profit de
l'échelle. **Priorité : moyenne.** (cosmétique, fort volume → migration par lots)

---

## 2. Shadows

**Constat :** le design system définit des tokens (`shadow-premium`,
`shadow-premium-lg`, `shadow-brand`, `shadow-card`, `shadow-card-hover`) dans
`tailwind.config.ts`, mais ils sont **sous-utilisés** et concurrencés par
**15 ombres arbitraires inline** (`shadow-[0_4px_20px_rgba(...)]`).

| Type | Constat |
|---|---|
| `shadow-premium` / `shadow-premium-lg` | **définis mais jamais utilisés (0 usage)** |
| `shadow-card` / `shadow-card-hover` | 7 / 3 usages |
| `shadow-brand` / `shadow-brand-lg` | 10 / 2 usages |
| `shadow-[...]` arbitraires | **15 valeurs uniques** (ex. `VehicleCard.tsx`, héros) |
| `shadow-sm/md/lg/xl/2xl` Tailwind | 75 usages mélangés aux tokens |

**Incohérence :** trois systèmes d'ombres se chevauchent (tokens maison +
échelle Tailwind par défaut + arbitraires inline). `VehicleCard` redéfinit son
ombre en inline alors qu'un token `shadow-card`/`shadow-card-hover` existe pour
exactement ce cas.

**Recommandation :**
1. Soit supprimer `shadow-premium*` (morts), soit les adopter et retirer les
   arbitraires.
2. Remplacer les `shadow-[...]` de `VehicleCard.tsx` par `shadow-card` /
   `hover:shadow-card-hover` (le token a été créé pour ça).
3. Réserver l'échelle Tailwind par défaut (`shadow-sm/md/lg`) aux overlays et
   éléments hors design system.

**Priorité : moyenne-haute** (faible volume, fort gain de cohérence perçue, et
les valeurs inline de `VehicleCard` sont sur un composant ultra-visible).

---

## 3. Durées d'animation

**Constat :**

| Durée | Occurrences |
|---|---:|
| `duration-200` | 41 (standard interactions) |
| `duration-300` | 15 |
| `duration-500` | 2 |
| `duration-400` | 1 (token custom défini dans config) |
| `transition-all` **sans durée explicite** | **62** (→ 150ms par défaut Tailwind) |

**Incohérences :**
- **62 `transition-all` sans durée** s'exécutent à 150ms (défaut Tailwind),
  créant un 4ᵉ timing implicite non maîtrisé à côté de 200/300/400/500.
- `transitionDuration: { "400": "400ms" }` est défini dans `tailwind.config.ts`
  pour **un seul usage** → token quasi mort.
- `transition-all` est large (anime toutes les propriétés, y compris layout) :
  coût perf et animations parasites possibles.

**Recommandation :**
1. Standardiser 2 durées : **200ms** (micro-interactions : hover, focus) et
   **300ms** (transitions de contenu : accordéons, galeries).
2. Toujours expliciter la durée (`transition-colors duration-200`) plutôt que
   `transition-all` nu.
3. Remplacer `transition-all` par des transitions ciblées
   (`transition-colors`, `transition-transform`, `transition-shadow`) là où
   seule une propriété change.
4. Supprimer le token `duration-400` ou l'adopter réellement.

**Priorité : moyenne** (impact perf léger + cohérence du « feel »).

---

## 4. Spacing / rythme vertical des sections

**Constat — padding vertical des sections (`py-*`) :**

| Classe | Occurrences |
|---|---:|
| `py-16` | 17 |
| `py-20` | 14 |
| `py-12` | 12 |
| `py-8` | 5 |
| `py-10` | 5 |
| `py-14` | 4 |
| `py-24` | 2 |
| `py-28` | 1 |

**Incohérence :** 8 valeurs de padding vertical de section différentes, sans
échelle de rythme claire. Des sections de même importance alternent `py-12`,
`py-16` et `py-20`, ce qui casse la régularité verticale perçue (signe « premium »
= rythme constant).

**Recommandation :** définir un rythme vertical à 3 paliers et l'appliquer :
- section standard → `py-16 md:py-20`
- section compacte → `py-12`
- section héros → `py-24 md:py-28`

Documenter dans `tailwind.config.ts` ou via une classe utilitaire
`.section-y`. **Priorité : basse-moyenne** (volume élevé, gain visuel réel mais
non bloquant).

---

## Synthèse priorités

| # | Sujet | Priorité | Effort | Gain perçu |
|---|---|---|---|---|
| 2 | Ombres : tokens vs inline (VehicleCard) | Moyenne-haute | Faible | ⭐⭐⭐ |
| 3 | Durées : expliciter + 2 paliers | Moyenne | Moyen | ⭐⭐ |
| 1 | Radius : échelle à 3 niveaux | Moyenne | Élevé (volume) | ⭐⭐ |
| 4 | Rythme vertical sections | Basse-moyenne | Élevé (volume) | ⭐⭐ |

> Aucun de ces points n'impacte la logique métier, le SEO, les routes ou les
> données véhicules. Ce sont exclusivement des conventions de design system à
> arbitrer puis migrer par lots.
