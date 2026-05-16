"use client";

/**
 * CookieLayer — Client Component wrapper pour le lazy loading de CookieSettingsModal.
 *
 * Problème : next/dynamic avec ssr:false est interdit dans les Server Components
 * (app/layout.tsx est un Server Component). Ce wrapper "use client" permet
 * d'utiliser dynamic() avec ssr:false légitimement.
 *
 * Résultat : CookieSettingsModal (~15 kB) n'est téléchargé que lors du
 * premier clic sur "Paramétrer" ou "Gérer mes cookies", jamais dans le
 * bundle initial.
 */

import dynamic from "next/dynamic";

const CookieSettingsModal = dynamic(
  () => import("@/components/cookies/CookieSettingsModal"),
  { ssr: false },
);

export default function CookieLayer() {
  return <CookieSettingsModal />;
}
