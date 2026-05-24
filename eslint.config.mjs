import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ── Anti-régression architecture image véhicule ───────────────────────────
  // Dans les composants vehicle/ et la page publique véhicule, toute URL image
  // doit passer par resolveVehicleUrl() depuis @/lib/utils/vehicle-images.
  // Importer @/lib/utils/storage directement est interdit dans ce périmètre.
  //
  // Note : les autres composants (services, bannière, galerie atelier) utilisent
  // légitimement getStoragePublicUrl() pour d'autres buckets — ils ne sont pas
  // soumis à cette règle.
  //
  // Voir CLAUDE.md § "Architecture images véhicule — règles figées".
  {
    files: [
      "components/vehicles/**/*.{ts,tsx}",
      "app/vehicules/**/*.{ts,tsx}",
      "app/occasions/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/utils/storage",
              message:
                "⛔ Import interdit dans les composants et pages véhicule. " +
                "Utilise resolveVehicleUrl() depuis @/lib/utils/vehicle-images. " +
                "Voir CLAUDE.md § Architecture images véhicule.",
            },
          ],
          patterns: [
            {
              group: ["*/lib/utils/storage"],
              message:
                "⛔ Utilise resolveVehicleUrl() depuis @/lib/utils/vehicle-images pour les images véhicule.",
            },
          ],
        },
      ],
    },
  },
];

export default config;
