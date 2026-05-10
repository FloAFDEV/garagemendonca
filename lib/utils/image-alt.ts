/**
 * Génère les textes alt SEO pour les images du catalogue.
 * Format optimisé pour la recherche locale : "Toyota Yaris hybride occasion Drémil-Lafage"
 */

export function generateVehicleAlt(
  brand: string,
  model: string,
  opts?: { year?: number; fuel?: string; index?: number },
): string {
  const parts: string[] = [brand, model];
  if (opts?.fuel && opts.fuel !== "Essence") parts.push(opts.fuel.toLowerCase());
  if (opts?.year) parts.push(String(opts.year));
  parts.push("occasion");
  if (opts?.index && opts.index > 0) parts.push(`photo ${opts.index + 1}`);
  return parts.join(" ");
}

export function generateServiceAlt(serviceName: string, index?: number): string {
  const base = `${serviceName} — Garage Mendonça Drémil-Lafage`;
  return index ? `${base} (${index + 1})` : base;
}

export function generateBannerAlt(message?: string): string {
  return message ? `Promotion : ${message} — Garage Mendonça` : "Bannière promotionnelle Garage Mendonça";
}
