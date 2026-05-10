/**
 * Extrait les options véhicule d'une description textuelle.
 *
 * Chaque ligne de la description est analysée contre les patterns de mots-clés.
 * - Les lignes qui correspondent à une option connue sont retirées de la description.
 * - Le texte narratif (non identifiable comme option) est conservé.
 *
 * Usage :
 *   const { detectedOptions, remainingText, matchCount } =
 *     parseDescriptionToOptions(vehicle.description);
 */

import type { VehicleOptions } from "@/types";
import type { OptionKey } from "@/lib/vehicleOptions";

type Rule = { pattern: RegExp; key: OptionKey };

// Ordered from most specific to most generic so earlier rules win per key.
const RULES: Rule[] = [
  // ── Sécurité ──────────────────────────────────────────────────────
  { pattern: /\babs\b/i,                                                  key: "abs" },
  { pattern: /\besp\b|\bcontr[oô]le\s+de\s+stabilité\b/i,               key: "esp" },
  { pattern: /\bairbags?\s+frontaux\b|\bairbag\s+conducteur\b/i,         key: "airbags" },
  { pattern: /\bairbags?\s+lat[eé]raux\b/i,                              key: "airbags_lateraux" },
  { pattern: /\bairbags?\s+rideaux\b/i,                                  key: "airbags_rideaux" },
  { pattern: /\bfreinage.{0,10}urgence\b|\baeb\b/i,                      key: "aide_freinage_urgence" },
  { pattern: /\bcontr[oô]le.{0,15}pression.{0,10}pneus?\b|\btpms\b/i,   key: "detection_pression_pneus" },
  { pattern: /\bisofix\b/i,                                              key: "isofix" },
  { pattern: /\balarme\b/i,                                              key: "alarme" },
  { pattern: /\bantid[eé]marrage\b/i,                                    key: "antidemarrage" },

  // ── Aides à la conduite ───────────────────────────────────────────
  { pattern: /\br[eé]gulateur.{0,5}adaptatif\b|\bacc\b/i,               key: "regulateur_adaptatif" },
  { pattern: /\br[eé]gulateur\s+(de\s+)?vitesse\b/i,                    key: "regulateur_vitesse" },
  { pattern: /\blimiteur\s+(de\s+)?vitesse\b/i,                         key: "limiteur_vitesse" },
  { pattern: /\bmaintien\s+(de\s+)?voie\b|\blane[\s-]?assist\b/i,       key: "aide_maintien_voie" },
  { pattern: /\bfranchissement\s+(de\s+)?ligne\b/i,                     key: "alerte_franchissement_ligne" },
  { pattern: /\bangle\s+mort\b/i,                                       key: "detection_angle_mort" },
  { pattern: /\bd[eé]tection.{0,10}pi[eé]tons?\b/i,                    key: "detection_pietons" },
  { pattern: /\breconnaissance.{0,15}panneaux?\b/i,                     key: "reconnaissance_panneaux" },
  { pattern: /\bradar.{0,8}avant\b/i,                                   key: "radar_avant" },
  { pattern: /\bradar.{0,8}arri[eè]re\b|\bradar.{0,5}recul\b/i,        key: "radar_arriere" },
  { pattern: /\bcam[eé]ra\s*360\b/i,                                    key: "camera_360" },
  { pattern: /\bcam[eé]ra.{0,10}recul\b|\bcam[eé]ra.{0,10}arri[eè]re\b/i, key: "camera_recul" },
  { pattern: /\bstationnement\s+automatique\b|\bpark[\s-]?assist\b/i,   key: "stationnement_automatique" },

  // ── Extérieur ─────────────────────────────────────────────────────
  { pattern: /\bjantes?\s+alliage\b/i,                                   key: "jantes_alliage" },
  { pattern: /\bjantes?\s+t[oô]le\b/i,                                   key: "jantes_tole" },
  { pattern: /\btoit\s+panoramique\b/i,                                  key: "toit_panoramique" },
  { pattern: /\btoit\s+ouvrant\b/i,                                      key: "toit_ouvrant" },
  { pattern: /\bbarres?\s+de\s+toit\b/i,                                 key: "barres_toit" },
  { pattern: /\bvitres?\s+sur-?tein(?:t[eé])?es?\b/i,                   key: "vitres_surteintees" },
  { pattern: /\bvitres?\s+tein(?:t[eé])?es?\b/i,                        key: "vitres_teintees" },
  { pattern: /\br[eé]troviseurs?\s+d[eé]givrants?\b/i,                  key: "retroviseurs_degivrants" },
  { pattern: /\br[eé]troviseurs?\s+rabattables?\b/i,                    key: "retroviseurs_rabattables" },
  { pattern: /\br[eé]troviseurs?\s+[eé]lectriques?\b/i,                 key: "retroviseurs_electriques" },
  { pattern: /\bmatrix\s*led\b|\bfeux\s+matrix\b/i,                     key: "feux_matrix_led" },
  { pattern: /\bfeux\s+x[eé]non\b|\bphares?\s+x[eé]non\b/i,            key: "feux_xenon" },
  { pattern: /\bfeux\s+led\b|\bphares?\s+led\b/i,                       key: "feux_led" },
  { pattern: /\bfeux\s+automatiques?\b/i,                               key: "feux_automatiques" },
  { pattern: /\bessuie-?glaces?\s+automatiques?\b|\bcapteur\s+pluie\b/i, key: "essuie_glaces_automatiques" },
  { pattern: /\battelage\b/i,                                           key: "attelage" },
  { pattern: /\bhayon\s+[eé]lectrique\b/i,                             key: "hayon_electrique" },
  { pattern: /\bportes?\s+coulissantes?\b/i,                           key: "portes_coulissantes" },
  { pattern: /\bsoft[\s-]?close\b/i,                                   key: "fermeture_soft_close" },

  // ── Intérieur & Confort ───────────────────────────────────────────
  { pattern: /\bclim(?:atisation)?\s+tri-?zone\b/i,                    key: "climatisation_trizone" },
  { pattern: /\bclim(?:atisation)?\s+bi-?zone\b/i,                    key: "climatisation_bizone" },
  { pattern: /\bclim(?:atisation)?\s+auto(?:matique)?\b/i,            key: "climatisation_automatique" },
  { pattern: /\bclim(?:atisation)?\s+manuelle\b/i,                    key: "climatisation" },
  { pattern: /\bclim(?:atisation)?\b/i,                               key: "climatisation_automatique" },
  { pattern: /\bsi[eè]ges?\s+chauffants?\b/i,                         key: "sieges_chauffants" },
  { pattern: /\bsi[eè]ges?\s+ventil[eé]s?\b/i,                        key: "sieges_ventiles" },
  { pattern: /\bsi[eè]ges?\s+massants?\b/i,                           key: "sieges_massants" },
  { pattern: /\bsi[eè]ges?\s+[eé]lectriques?\b/i,                    key: "sieges_electriques" },
  { pattern: /\bsi[eè]ges?\s+m[eé]moire\b/i,                         key: "sieges_memoire" },
  { pattern: /\bsi[eè]ges?\s+rabattables?\b/i,                        key: "sieges_rabattables" },
  { pattern: /\bsellerie\s+alcantara\b|\balcantara\b/i,               key: "sellerie_alcantara" },
  { pattern: /\bsellerie\s+cuir\b|\bcuir\b/i,                         key: "sellerie_cuir" },
  { pattern: /\bsellerie\s+tissu\b/i,                                  key: "sellerie_tissu" },
  { pattern: /\bvolant\s+chauffant\b/i,                               key: "volant_chauffant" },
  { pattern: /\bvolant\s+r[eé]glable\b/i,                             key: "volant_reglable" },
  { pattern: /\bvolant\s+cuir\b/i,                                    key: "volant_cuir" },
  { pattern: /\baccoudoir\s+central\b/i,                              key: "accoudoir_central" },
  { pattern: /\bvitres?\s+[eé]lectriques?\s+(?:avant|av\.?)\b/i,     key: "vitres_electriques_avant" },
  { pattern: /\bvitres?\s+[eé]lectriques?\s+(?:arri[eè]re|ar\.?)\b/i, key: "vitres_electriques_arriere" },
  { pattern: /\bvitres?\s+[eé]lectriques?\s+av\s*[&+]\s*ar\b/i,      key: "vitres_electriques_avant" },
  { pattern: /\bvitres?\s+[eé]lectriques?\b/i,                       key: "vitres_electriques_avant" },
  { pattern: /\bfermeture\s+centralis[eé]e\b|\bverrouillage\s+central\b/i, key: "fermeture_centralisee" },
  { pattern: /\bd[eé]marrage\s+sans\s+cl[eé]\b|\bkeyless[\s-]?start\b/i, key: "demarrage_sans_cle" },
  { pattern: /\bouverture\s+sans\s+cl[eé]\b|\bkeyless[\s-]?entry\b/i, key: "ouverture_sans_cle" },
  { pattern: /\bcommandes?\s+au\s+volant\b/i,                         key: "commande_au_volant" },
  { pattern: /\bcoffre\s+[eé]lectrique\b/i,                          key: "coffre_electrique" },

  // ── Multimédia & Technologie ──────────────────────────────────────
  { pattern: /\btableau\s+de\s+bord\s+num[eé]rique\b|\bcombin[eé]\s+num[eé]rique\b/i, key: "tableau_bord_numerique" },
  { pattern: /\baffichage\s+t[eê]te\s+haute\b|\bhud\b/i,              key: "affichage_tete_haute" },
  { pattern: /\b[eé]cran\s+tactile\b|\btouchscreen\b/i,               key: "ecran_tactile" },
  { pattern: /\bgps\b|\bnavigation\b|\bsatellite\s+nav\b/i,           key: "gps" },
  { pattern: /\bbluetooth\b/i,                                        key: "bluetooth" },
  { pattern: /\busb[\s-]?c\b/i,                                       key: "usb_c" },
  { pattern: /\bprise\s+usb\b|\busb\b/i,                              key: "usb" },
  { pattern: /\bchargeur.{0,10}induction\b|\binduction\b/i,           key: "chargeur_induction" },
  { pattern: /\bjbl\b|\bbose\b|\bharman\b|\bsyst[eè]me\s+audio\b|\bhi-?fi\b/i, key: "systeme_audio" },
  { pattern: /\bcommande\s+vocale\b/i,                                key: "commande_vocale" },
  { pattern: /\bprise\s+12v\b|\ballume-?cigare\b/i,                   key: "prise_12v" },

  // ── Motorisation & Conduite ───────────────────────────────────────
  { pattern: /\bbo[iî]te\s+automatique\b|\btransmission\s+automatique\b/i, key: "boite_automatique" },
  { pattern: /\bbo[iî]te\s+manuelle\b|\btransmission\s+manuelle\b/i,      key: "boite_manuelle" },
  { pattern: /\bpalettes?\s+au\s+volant\b/i,                         key: "palettes_volant" },
  { pattern: /\bmode\s+sport\b/i,                                    key: "mode_sport" },
  { pattern: /\bsuspension\s+adaptative\b/i,                         key: "suspension_adaptative" },
  { pattern: /\b(?:4x4|4wd|awd)\b|\btransmission\s+int[eé]grale\b/i, key: "transmission_integrale" },
  { pattern: /\bstart[\s-]?(?:[&et]+\s*)?stop\b/i,                   key: "start_stop" },
];

// When both AV & AR are mentioned in a single line, also detect rear windows
const VITRES_AR_COMBINED = /\bvitres?\s+[eé]lectriques?\s+av\s*[&+]\s*ar\b/i;

export interface ParseResult {
  detectedOptions: Partial<VehicleOptions>;
  remainingText: string;
  matchCount: number;
}

/**
 * Seuil : une ligne de moins de MAX_LINE_LEN caractères est considérée
 * comme une "ligne d'option" et retirée si elle correspond à un pattern.
 * Les lignes plus longues (phrases narratives) sont conservées même si
 * elles contiennent des mots-clés d'option.
 */
const MAX_OPTION_LINE_LEN = 80;

export function parseDescriptionToOptions(description: string): ParseResult {
  if (!description?.trim()) {
    return { detectedOptions: {}, remainingText: description ?? "", matchCount: 0 };
  }

  const detectedOptions: Partial<VehicleOptions> = {};
  const remainingLines: string[] = [];

  // Split on newlines; also normalise Windows line endings
  const lines = description.replace(/\r\n/g, "\n").split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      remainingLines.push(line);
      continue;
    }

    const matchedKeys = new Set<OptionKey>();

    for (const rule of RULES) {
      if (rule.pattern.test(trimmed)) {
        matchedKeys.add(rule.key);
      }
    }

    // Special case: "vitres élec AV & AR" → also set rear windows
    if (VITRES_AR_COMBINED.test(trimmed)) {
      matchedKeys.add("vitres_electriques_arriere");
    }

    if (matchedKeys.size > 0 && trimmed.length <= MAX_OPTION_LINE_LEN) {
      // Short option line → consume it
      for (const key of matchedKeys) {
        (detectedOptions as Record<string, boolean>)[key] = true;
      }
    } else if (matchedKeys.size > 0) {
      // Long narrative line → extract options but keep the line
      for (const key of matchedKeys) {
        (detectedOptions as Record<string, boolean>)[key] = true;
      }
      remainingLines.push(line);
    } else {
      remainingLines.push(line);
    }
  }

  // Remove trailing blank lines
  while (remainingLines.length > 0 && !remainingLines[remainingLines.length - 1].trim()) {
    remainingLines.pop();
  }

  return {
    detectedOptions,
    remainingText: remainingLines.join("\n"),
    matchCount: Object.keys(detectedOptions).length,
  };
}
