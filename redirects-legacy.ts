/**
 * redirects-legacy.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Source de vérité pour les redirections 301 du site legacy.
 *
 * Architecture hybride :
 *  - SIMPLE_REDIRECTS → next.config.ts (pas de + dans le path)
 *  - VEHICLE_REDIRECTS → middleware.ts  (paths avec +, lookup Map direct)
 */

/** Redirections sans + — intégrées dans next.config.ts redirects() */
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

/**
 * Redirections véhicules — paths avec + incompatibles avec path-to-regexp.
 * Utilisé par middleware.ts via un Map<legacyPath, newPath>.
 * 139 véhicules matchés (external_id Supabase) + 1 orpheline.
 */
export const VEHICLE_PATH_MAP: Record<string, string> = {
  // Mini Cooper S (F56) 2015
  "/details-mini+cooper+s+f56+2+0i+192+ch+cooper+s+vehicule+francais+toit+ouvrant-350.html": "/vehicules/mini-cooper-s-f56-2015-350",
  // Mercedes GLA 2015
  "/details-mercedes+gla+250+4matic+2+0+tsi+210+ch+serie+limite+edition+1+toit+ouvrant-372.html": "/vehicules/mercedes-gla-2015-372",
  // Jeep Compass 2010
  "/details-jeep+compass+2+2+crd+163+ch+limited+4x4+toit+ouvrant+vehicule+francais-381.html": "/vehicules/jeep-compass-2010-381",
  // Ford Fiesta 2007
  "/details-ford+fiesta+1+4i+80+ch+connection+1+er+main+boite+automatique-387.html": "/vehicules/ford-fiesta-2007-387",
  // Peugeot 107 2009
  "/details-peugeot+107+1+0i+68+ch+trendy+1+er+main+boite+automatique-393.html": "/vehicules/peugeot-107-2009-393",
  // Citroën C1 2010
  "/details-citroen+c1+1+0i+68+ch+style+boite+automatique+1+main-404.html": "/vehicules/citroen-c1-2010-404",
  // Suzuki Swift 2012
  "/details-suzuki+swift+1+2i+95+ch+club+boite+automatique+crit+air1+1+er+main-407.html": "/vehicules/suzuki-swift-2012-407",
  // Suzuki Splash 2012
  "/details-suzuki+splash+1+2i+95+ch+club+1+er+main+crit+air1-408.html": "/vehicules/suzuki-splash-2012-408",
  // Renault Scenic 2010
  "/details-renault+scenic+2+0i+140+ch+dynamique+boite+automatique+crit+air1-417.html": "/vehicules/renault-scenic-2010-417",
  // Peugeot 107 2009
  "/details-peugeot+107+1+0i+68+ch+filou+boite+automatique+1+er+main-441.html": "/vehicules/peugeot-107-2009-441",
  // Nissan Pixo 2009
  "/details-nissan+pixo+1+0i+68+ch+acenta+boite+automatique+1er+main-442.html": "/vehicules/nissan-pixo-2009-442",
  // Toyota Yaris 2007
  "/details-toyota+yaris+1+3+vvt-i+87+ch+luna+boite+automatique+1+er+main-443.html": "/vehicules/toyota-yaris-2007-443",
  // Toyota Yaris 2006
  "/details-toyota+yaris+1+0i+68+ch+vehicule+francais+1+er+main-444.html": "/vehicules/toyota-yaris-2006-444",
  // Suzuki Celerio 2017
  "/details-suzuki+celerio+1+0i+68+ch+basis+boite+automatique+crit+air1-445.html": "/vehicules/suzuki-celerio-2017-445",
  // Kia Picanto 2015
  "/details-kia+picanto+1+2i+85+ch+gold+boite+automatique+crit+air1-446.html": "/vehicules/kia-picanto-2015-446",
  // Toyota AYGO 2009
  "/details-toyota+aygo+1+0i+68+ch+city+1+main+boite+automatique-447.html": "/vehicules/toyota-aygo-2009-447",
  // Peugeot 107 2009
  "/details-peugeot+107+1+0i+68+ch+filou+boite+automatique+crit+air2-448.html": "/vehicules/peugeot-107-2009-448",
  // Toyota AYGO 2008
  "/details-toyota+aygo+1+0i+68+ch+crit+air2+boite+automatique-449.html": "/vehicules/toyota-aygo-2008-449",
  // Hyundai i10 2009
  "/details-hyundai+i10+1+2i+77+ch+classic+boite+automatique+crit+air2-450.html": "/vehicules/hyundai-i10-2009-450",
  // Volkswagen Polo 2005
  "/details-volkswagen+polo+1+4i+75+ch+trendline+boite+automatique+crit+air2-451.html": "/vehicules/volkswagen-polo-2005-451",
  // Toyota AYGO 2007
  "/details-toyota+aygo+1+0i+68+ch+cool+boite+automatique+1+ere+main-452.html": "/vehicules/toyota-aygo-2007-452",
  // Volkswagen Polo 2008
  "/details-volkswagen+polo+1+4i+80+ch+united+boite+automatique+1+main-453.html": "/vehicules/volkswagen-polo-2008-453",
  // Peugeot 107 2012
  "/details-peugeot+107+1+0i+68+ch+active+boite+automatique+crit+air1-454.html": "/vehicules/peugeot-107-2012-454",
  // Toyota AYGO 2011
  "/details-toyota+aygo+1+0i+68+ch+edition+boite+automatique+1+ere+main-456.html": "/vehicules/toyota-aygo-2011-456",
  // Citroën C1 2013
  "/details-citroen+c1+1+0i+68+ch+exclusive+boite+automatique+crit+air1-457.html": "/vehicules/citroen-c1-2013-457",
  // Hyundai i10 2010
  "/details-hyundai+i10+1+1i+67+ch+style+boite+automatique+crit+air2-458.html": "/vehicules/hyundai-i10-2010-458",
  // Toyota Yaris 2008
  "/details-toyota+yaris+1+3+vvt-i+87+ch+boite+automatique+1+er+main-460.html": "/vehicules/toyota-yaris-2008-460",
  // Citroën C1 2007
  "/details-citroen+c1+1+0i+68+ch+sx+boite+automatique+crit+air2-461.html": "/vehicules/citroen-c1-2007-461",
  // Suzuki Splash 2009
  "/details-suzuki+splash+1+2i+85+ch+comfort+boite+automatique+crit+air2-462.html": "/vehicules/suzuki-splash-2009-462",
  // Hyundai i10 2012
  "/details-hyundai+i10+1+2i+85+ch+pack+sensation+boite+automatique+crit+air1-463.html": "/vehicules/hyundai-i10-2012-463",
  // Nissan Micra 2010
  "/details-nissan+micra+1+2i+80+ch+connect+edition+boite+automatique+crit+air2-464.html": "/vehicules/nissan-micra-2010-464",
  // Suzuki Swift 2008
  "/details-suzuki+swift+1+5i+102+ch+ch+comfort+boite+automatique+1+main-465.html": "/vehicules/suzuki-swift-2008-465",
  // Peugeot 107 2011
  "/details-peugeot+107+1+0i+68+ch+filou+boite+automatique+crit+air1-466.html": "/vehicules/peugeot-107-2011-466",
  // Opel Agila 2009
  "/details-opel+agila+1+2i+85+ch+edition+boite+automatique+crit+air+2-467.html": "/vehicules/opel-agila-2009-467",
  // Opel Agila 2010
  "/details-opel+agila+1+2i+85+ch+edition+boite+automatique+crit+air+2-468.html": "/vehicules/opel-agila-2010-468",
  // Peugeot 107 2008
  "/details-peugeot+107+1+0i+68+ch+filou+boite+automatique+crit+air2-470.html": "/vehicules/peugeot-107-2008-470",
  // Ford Fiesta 2005
  "/details-ford+fiesta+1+4+tdci+68+ch+ghia+1+main+boite+automatique-471.html": "/vehicules/ford-fiesta-2005-471",
  // Peugeot 107 2009
  "/details-peugeot+107+1+0i+68+ch+filou+boite+automatique+crit+air2-472.html": "/vehicules/peugeot-107-2009-472",
  // Volkswagen Polo 2007
  "/details-volkswagen+polo+1+4i+80+ch+tour+edition+toit+ouvrant+1+main-473.html": "/vehicules/volkswagen-polo-2007-473",
  // Toyota AYGO 2008
  "/details-toyota+aygo+1+0i+68+ch+city+crit+air2+boite+automatique-474.html": "/vehicules/toyota-aygo-2008-474",
  // Toyota Yaris 2007
  "/details-toyota+yaris+1+3+vvt-i+87+ch+sol+boite+automatique+crit+air2-475.html": "/vehicules/toyota-yaris-2007-475",
  // Ford Fusion 2008
  "/details-ford+fusion+1+6i+100+ch+style+1+ermain+crit+air+2+attelage-476.html": "/vehicules/ford-fusion-2008-476",
  // Toyota Corolla 2001
  "/details-toyota+corolla+1+4i+95+ch+vehicule+francais-477.html": "/vehicules/toyota-corolla-2001-477",
  // Volkswagen Polo 2009
  "/details-volkswagen+polo+1+4i+80+ch+tour+edition+toit+ouvrant+boite+automatique-478.html": "/vehicules/volkswagen-polo-2009-478",
  // Nissan Pixo 2012
  "/details-nissan+pixo+1+0i+68+ch+acenta+boite+automatique+1er+main-479.html": "/vehicules/nissan-pixo-2012-479",
  // Citroën C1 2012
  "/details-citroen+c1+1+0i+68+ch+millenium+boite+automatique+crit+air1-480.html": "/vehicules/citroen-c1-2012-480",
  // Volkswagen Polo 2008
  "/details-volkswagen+polo+1+4i+80+ch+united+crit+air2+boite+automatique-481.html": "/vehicules/volkswagen-polo-2008-481",
  // Hyundai i10 2012
  "/details-hyundai+i10+1+2i+85+ch+pack+sensation+boite+automatique+1er+main-482.html": "/vehicules/hyundai-i10-2012-482",
  // Nissan Micra 2009
  "/details-nissan+micra+1+4+88+ch+tekna+boite+automatique+crit+air2-483.html": "/vehicules/nissan-micra-2009-483",
  // Suzuki Swift 2010
  "/details-suzuki+swift+1+3i+92+ch+boite+automatique+crit+air2-484.html": "/vehicules/suzuki-swift-2010-484",
  // Citroën C1 2015
  "/details-citroen+c1+1+0i+68+ch+boite+automatique+crit+air1-485.html": "/vehicules/citroen-c1-2015-485",
  // Hyundai i10 2010
  "/details-hyundai+i10+1+1i+67+ch+style+boite+automatique+crit+air2-486.html": "/vehicules/hyundai-i10-2010-486",
  // Volkswagen Polo 2008
  "/details-volkswagen+polo+1+4i+80+ch+black+edition+boite+automatique+1+main-487.html": "/vehicules/volkswagen-polo-2008-487",
  // Hyundai i10 2012
  "/details-hyundai+i10+1+1i+70+ch+classic+boite+automatique+1+main-488.html": "/vehicules/hyundai-i10-2012-488",
  // Renault Twingo 2017
  "/details-renault+twingo+3+0+9i+90+ch+limited+boite+automatique+crit+air1-489.html": "/vehicules/renault-twingo-2017-489",
  // Peugeot 108 2016
  "/details-peugeot+108+1+0i+68+ch+allure+boite+automatique+crit+air1-490.html": "/vehicules/peugeot-108-2016-490",
  // Suzuki Alto 2010
  "/details-suzuki+alto+1+0i+68+ch+club+boite+automatique+crit+air1-492.html": "/vehicules/suzuki-alto-2010-492",
  // Suzuki Swift 2005
  "/details-suzuki+swift+1+3i+92+ch+gl+boite+automatique+1+main-493.html": "/vehicules/suzuki-swift-2005-493",
  // Citroën C1 2018
  "/details-citroen+c1+1+0i+68+ch+shine+1+main+carplay-494.html": "/vehicules/citroen-c1-2018-494",
  // Hyundai i10 2008
  "/details-hyundai+i10+1+1i+67+ch+classic+boite+automatique+crit+air2-495.html": "/vehicules/hyundai-i10-2008-495",
  // Suzuki Alto 2014
  "/details-suzuki+alto+1+0i+68+ch+club+boite+automatique+8+500+kms+1er+main-499.html": "/vehicules/suzuki-alto-2014-499",
  // Citroën C1 2015
  "/details-citroen+c1+1+0i+68+ch+feel+boite+automatique+8900+kms+crit+air1-500.html": "/vehicules/citroen-c1-2015-500",
  // Suzuki Swift 2013
  "/details-suzuki+swift+1+2i+94+ch+glx+pack+boite+automatique+toit+ouvrant-502.html": "/vehicules/suzuki-swift-2013-502",
  // Kia Picanto 2012
  "/details-kia+picanto+1+2i+85+ch+premium+boite+automatique+crit+air1-503.html": "/vehicules/kia-picanto-2012-503",
  // Suzuki Swift 2016
  "/details-suzuki+swift+1+2i+95+ch+privilege+boite+automatique+crit+air1-504.html": "/vehicules/suzuki-swift-2016-504",
  // Kia Picanto 2014
  "/details-kia+picanto+1+2i+85+ch+platinum+edition+boite+automatique+crit+air1+1er+main-505.html": "/vehicules/kia-picanto-2014-505",
  // Opel Agila 2009
  "/details-opel+agila+1+2i+85+ch+edition+1+main+boite+automatique-506.html": "/vehicules/opel-agila-2009-506",
  // Nissan Micra 2005
  "/details-nissan+micra+1+2i+80+ch+mix+boite+automatique+1+main-507.html": "/vehicules/nissan-micra-2005-507",
  // Honda Jazz 2010
  "/details-honda+jazz+1+4i+100+ch+exclusive+boite+automatique+crit+air1+1+main-508.html": "/vehicules/honda-jazz-2010-508",
  // Opel Agila 2012
  "/details-opel+agila+1+2i+95+ch+edition+1+main+boite+automatique-509.html": "/vehicules/opel-agila-2012-509",
  // Nissan Micra 2007
  "/details-nissan+micra+1+2i+80+ch+boite+automatique+vehicule+francais-510.html": "/vehicules/nissan-micra-2007-510",
  // Nissan Pixo 2009
  "/details-nissan+pixo+1+0i+68+ch+acenta+boite+automatique+1er+main-511.html": "/vehicules/nissan-pixo-2009-511",
  // Hyundai i10 2022
  "/details-hyundai+i10+1+0i+67+ch+intuitive+boite+automatique+1+main-512.html": "/vehicules/hyundai-i10-2022-512",
  // Citroën C1 2017
  "/details-citroen+c1+1+0i+68+ch+shine+boite+automatique+carplay-514.html": "/vehicules/citroen-c1-2017-514",
  // Peugeot 108 2016
  "/details-peugeot+108+1+0i+68+ch+feel+boite+automatique+crit+air1-515.html": "/vehicules/peugeot-108-2016-515",
  // Toyota AYGO 2012
  "/details-toyota+aygo+1+0i+68+ch+crit+air1+boite+automatique-516.html": "/vehicules/toyota-aygo-2012-516",
  // Ford Fiesta 2010
  "/details-ford+fiesta+1+4i+97+ch+trend+boite+automatique+crt+air1-517.html": "/vehicules/ford-fiesta-2010-517",
  // Toyota Yaris 2008
  "/details-toyota+yaris+1+3+vvt-i+87+ch+sol+boite+automatique+vehicule+francais-518.html": "/vehicules/toyota-yaris-2008-518",
  // Hyundai i10 2017
  "/details-hyundai+i10+1+2i+87+ch+creative+boite+automatique+vehicule+francais-519.html": "/vehicules/hyundai-i10-2017-519",
  // Ford Fiesta 2008
  "/details-ford+fiesta+1+4i+80+ch+style+boite+automatique+crit+air2-520.html": "/vehicules/ford-fiesta-2008-520",
  // Ford Fiesta 2008
  "/details-ford+fiesta+1+4i+80+ch+style+boite+automatique+crit+air2-521.html": "/vehicules/ford-fiesta-2008-521",
  // Suzuki Alto 2009
  "/details-suzuki+alto+1+0i+68+ch+comfort+boite+automatique+1+main-524.html": "/vehicules/suzuki-alto-2009-524",
  // Toyota Yaris 2007
  "/details-toyota+yaris+1+3+vvt-i+87+ch+luna+boite+automatique-525.html": "/vehicules/toyota-yaris-2007-525",
  // Hyundai i10 2011
  "/details-hyundai+i10+1+2i+85+ch+life+boite+automatique+crit+air1-526.html": "/vehicules/hyundai-i10-2011-526",
  // Toyota Yaris 2020
  "/details-toyota+yaris+1+5i+eh+92+ch+116h+france+business+1+main+garantie+24+mois-528.html": "/vehicules/toyota-yaris-2020-528",
  // Nissan Pixo 2010
  "/details-nissan+pixo+1+0i+68+ch+acenta+boite+automatique+1er+main-529.html": "/vehicules/nissan-pixo-2010-529",
  // Skoda Fabia 2021
  "/details-skoda+fabia+1+0+tsi+95+ch+clever+carplay+1er+main-531.html": "/vehicules/skoda-fabia-2021-531",
  // Toyota Yaris 2011
  "/details-toyota+yaris+1+33i+100+ch+club+camera+de+recul+gps-532.html": "/vehicules/toyota-yaris-2011-532",
  // Toyota Yaris 2009
  "/details-toyota+yaris+1+3+vvt-i+87+ch+team+boite+automatique+1+er+main-533.html": "/vehicules/toyota-yaris-2009-533",
  // Toyota Yaris 2015
  "/details-toyota+yaris+1+33i+100+ch+comfort+camera+de+recul+gps-534.html": "/vehicules/toyota-yaris-2015-534",
  // Nissan Micra 2009
  "/details-nissan+micra+1+2+80+ch+acenta+boite+automatique+1+main-535.html": "/vehicules/nissan-micra-2009-535",
  // Renault Twingo 2015
  "/details-renault+twingo+3+0+9i+90+ch+cosmic+boite+automatique+crit+air1-536.html": "/vehicules/renault-twingo-2015-536",
  // Renault Twingo 2017
  "/details-renault+twingo+3+1+0i+70+ch+zen+boite+automatique+1+main-537.html": "/vehicules/renault-twingo-2017-537",
  // Peugeot 107 2013
  "/details-peugeot+107+1+0i+68+ch+active+boite+automatique+1+main-538.html": "/vehicules/peugeot-107-2013-538",
  // Kia Picanto 2007
  "/details-kia+picanto+1+1i+65+ch+boite+automatique+1+main-539.html": "/vehicules/kia-picanto-2007-539",
  // Honda Jazz 2009
  "/details-honda+jazz+1+4i+100+ch+exclusive+boite+automatique+vehicule+francais-540.html": "/vehicules/honda-jazz-2009-540",
  // Suzuki Swift 2012
  "/details-suzuki+swift+1+2i+95+ch+club+boite+automatique-541.html": "/vehicules/suzuki-swift-2012-541",
  // Renault Twingo 2018
  "/details-renault+twingo+3+1+0i+70+ch+intens+boite+automatique-542.html": "/vehicules/renault-twingo-2018-542",
  // Toyota Yaris 2012
  "/details-toyota+yaris+1+33i+100+ch+life+camera+de+recul+boite+automatique-543.html": "/vehicules/toyota-yaris-2012-543",
  // Hyundai i10 2013
  "/details-hyundai+i10+1+2i+85+ch+pack+sensation+1+main+boite+automatique-544.html": "/vehicules/hyundai-i10-2013-544",
  // Hyundai i10 2009
  "/details-hyundai+i10+1+2i+77+ch+classic+boite+automatique-546.html": "/vehicules/hyundai-i10-2009-546",
  // Mitsubishi Space Star 2014
  "/details-mitsubishi+space+star+1+2i+80+ch+top+boite+automatique+1+main-547.html": "/vehicules/mitsubishi-space-star-2014-547",
  // Suzuki Swift 2013
  "/details-suzuki+swift+1+2i+95+ch+comfort+boite+automatique-550.html": "/vehicules/suzuki-swift-2013-550",
  // Volkswagen Polo 2019
  "/details-volkswagen+polo+1+0+tsi+95+ch+iq+drive+app-connect+boite+automatique-551.html": "/vehicules/volkswagen-polo-2019-551",
  // Peugeot 107 2014
  "/details-peugeot+107+1+0i+68+ch+envy+ii+boite+automatique+1+main-552.html": "/vehicules/peugeot-107-2014-552",
  // Opel Agila 2009
  "/details-opel+agila+1+2i+85+ch+edition+1+main+boite+automatique-553.html": "/vehicules/opel-agila-2009-553",
  // Suzuki Swift 2012
  "/details-suzuki+swift+1+2i+94+ch+glx+pack+boite+automatique+toit+ouvrant-554.html": "/vehicules/suzuki-swift-2012-554",
  // Peugeot 107 2007
  "/details-peugeot+107+1+0i+68+ch+trendy+boite+automatique-555.html": "/vehicules/peugeot-107-2007-555",
  // Toyota Yaris 2008
  "/details-toyota+yaris+1+3+vvt-i+87+ch+team+boite+automatique+1+er+main-557.html": "/vehicules/toyota-yaris-2008-557",
  // Suzuki Alto 2009
  "/details-suzuki+alto+1+0i+68+ch+club+boite+automatique+crit+air1-558.html": "/vehicules/suzuki-alto-2009-558",
  // Hyundai i10 2009
  "/details-hyundai+i10+1+2i+77+ch+classic+1+main+boite+automatique-559.html": "/vehicules/hyundai-i10-2009-559",
  // Citroën C1 2019
  "/details-citroen+c1+1+0i+72+ch+feel+boite+automatique+1+main-560.html": "/vehicules/citroen-c1-2019-560",
  // Ford Fiesta 2005
  "/details-ford+fiesta+1+4+tdci+68+ch+ghia+1+main+boite+automatique-561.html": "/vehicules/ford-fiesta-2005-561",
  // Hyundai i10 2012
  "/details-hyundai+i10+1+2i+85+ch+boite+automatique-562.html": "/vehicules/hyundai-i10-2012-562",
  // Nissan Micra 2008
  "/details-nissan+micra+1+4+88+ch+acenta+boite+automatique+crit+air2-563.html": "/vehicules/nissan-micra-2008-563",
  // Suzuki Swift 2013
  "/details-suzuki+swift+1+2i+95+ch+comfort+boite+automatique+1+er+main-564.html": "/vehicules/suzuki-swift-2013-564",
  // Citroën C1 2019
  "/details-citroen+c1+1+0i+72+ch+shine+boite+automatique+1+main+carplay-565.html": "/vehicules/citroen-c1-2019-565",
  // Renault Clio V 2021
  "/details-renault+clio+v+1+0+tce+90+ch+intens+boite+automatique-566.html": "/vehicules/renault-clio-v-2021-566",
  // Renault Clio V 2021
  "/details-renault+clio+v+1+0+tce+90+ch+business+boite+automatique-567.html": "/vehicules/renault-clio-v-2021-567",
  // Renault Clio V 2021
  "/details-renault+clio+v+1+0+tce+90+ch+business+boite+automatique+carplay+android+auto-568.html": "/vehicules/renault-clio-v-2021-568",
  // Toyota Yaris 2020
  "/details-toyota+yaris+1+5i+eh+100h+france+affaires+1+main-569.html": "/vehicules/toyota-yaris-2020-569",
  // Toyota Yaris 2020
  "/details-toyota+yaris+1+5i+eh+100h+france+affaires+1+main-570.html": "/vehicules/toyota-yaris-2020-570",
  // Toyota Yaris 2020
  "/details-toyota+yaris+1+5i+eh+100h+france+affaires+1+main-571.html": "/vehicules/toyota-yaris-2020-571",
  // Opel Agila 2011
  "/details-opel+agila+1+2i+95+ch+edition+1+main+boite+automatique-572.html": "/vehicules/opel-agila-2011-572",
  // Suzuki Swift 2018
  "/details-suzuki+swift+1+0i+110+ch+boosterjet+comfort+boite+automatique-574.html": "/vehicules/suzuki-swift-2018-574",
  // Renault Twingo 2019
  "/details-renault+twingo+3+0+9i+90+ch+intens+1+main+boite+automatique+crit+air1-575.html": "/vehicules/renault-twingo-2019-575",
  // Honda Jazz 2009
  "/details-honda+jazz+1+4i+100+ch+comfort+boite+automatique+1+main-576.html": "/vehicules/honda-jazz-2009-576",
  // Citroën C2 2008
  "/details-citroen+c2+1+1i+60+ch+vehicule+francais+1+er+main-577.html": "/vehicules/citroen-c2-2008-577",
  // Hyundai i10 2011
  "/details-hyundai+i10+1+2i+85+ch+style+boite+automatique-579.html": "/vehicules/hyundai-i10-2011-579",
  // Honda Jazz 2016
  "/details-honda+jazz+1+3+i-vtec+102+ch+comfort+boite+automatique+1+main-580.html": "/vehicules/honda-jazz-2016-580",
  // Toyota Yaris 2020
  "/details-toyota+yaris+1+5i+eh+100h+france+business+1+main+boite+automatique-581.html": "/vehicules/toyota-yaris-2020-581",
  // Suzuki Alto 2009
  "/details-suzuki+alto+1+0i+68+ch+comfort+boite+automatique+1+main-582.html": "/vehicules/suzuki-alto-2009-582",
  // Suzuki Swift 2008
  "/details-suzuki+swift+1+3i+92+ch+boite+automatique+crit+air2-583.html": "/vehicules/suzuki-swift-2008-583",
  // Opel Agila 2009
  "/details-opel+agila+1+2i+85+ch+edition+boite+automatique+crit+air+2-584.html": "/vehicules/opel-agila-2009-584",
  // Peugeot 108 2017
  "/details-peugeot+108+1+0i+72+ch+allure+boite+automatique+crit+air1-585.html": "/vehicules/peugeot-108-2017-585",
  // Toyota Yaris 2013
  "/details-toyota+yaris+1+33i+100+ch+club+1+main+camera+de+recul-586.html": "/vehicules/toyota-yaris-2013-586",
  // Toyota Yaris 2016
  "/details-toyota+yaris+1+33i+100+ch+collection+1+main+camera+de+recul-587.html": "/vehicules/toyota-yaris-2016-587",
  // Toyota Yaris 2008
  "/details-toyota+yaris+1+3+vvt-i+87+ch+sol+boite+automatique-588.html": "/vehicules/toyota-yaris-2008-588",
  // Honda Jazz 2008
  "/details-honda+jazz+1+4i+83+ch+es+boite+automatique+1+main-589.html": "/vehicules/honda-jazz-2008-589",
  // Toyota Yaris (id=590, absent de Supabase)
  "/details-toyota+yaris+1+5i+eh+100h+france+business+1+main+boite+automatique-590.html": "/vehicules",
};
