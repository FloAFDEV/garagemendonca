/**
 * redirects-simple.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Redirections 301 sans "+" dans le path — compatibles avec path-to-regexp.
 * Importé uniquement par next.config.ts.
 *
 * Les redirections véhicules (paths avec +) restent dans redirects-legacy.ts
 * (VEHICLE_PATH_MAP) pour ne pas charger 21 KB dans le bundle de config webpack.
 */
export const SIMPLE_REDIRECTS = [
  { source: "/nos-voitures-1.html", destination: "/vehicules", permanent: true },
  { source: "/nos-voitures-2.html", destination: "/vehicules", permanent: true },
  { source: "/nos-voitures-3.html", destination: "/vehicules", permanent: true },
  { source: "/nos-voitures-4.html", destination: "/vehicules", permanent: true },
  { source: "/nos-voitures-5.html", destination: "/vehicules", permanent: true },
  { source: "/nos-voitures-6.html", destination: "/vehicules", permanent: true },
  { source: "/nos-voitures-7.html", destination: "/vehicules", permanent: true },
  { source: "/nos-voitures-8.html", destination: "/vehicules", permanent: true },
  { source: "/nos-voitures-9.html", destination: "/vehicules", permanent: true },
  { source: "/nos-voitures-10.html", destination: "/vehicules", permanent: true },
  { source: "/nos-voitures-11.html", destination: "/vehicules", permanent: true },
  { source: "/nos-voitures-12.html", destination: "/vehicules", permanent: true },
  { source: "/nos-voitures-occasion-1.html", destination: "/vehicules", permanent: true },
  { source: "/carrosserie-1.html", destination: "/services", permanent: true },
  { source: "/mecanique-1.html", destination: "/services", permanent: true },
  { source: "/contact.html", destination: "/contact", permanent: true },
  { source: "/toutes-nos-prestations-1.html", destination: "/services", permanent: true },
  { source: "/guide-local-1.html", destination: "/", permanent: true },
  { source: "/nos-activites.html", destination: "/", permanent: true },
  { source: "/mentions-legales.html", destination: "/", permanent: true },
  { source: "/secteurs.html", destination: "/", permanent: true },
  { source: "/plan-du-site.html", destination: "/", permanent: true },
  { source: "/archives-1.html", destination: "/", permanent: true },
] as const;
