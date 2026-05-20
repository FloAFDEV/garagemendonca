/**
 * Marques & modèles — marché européen + marques chinoises implantées/émergentes.
 * Source de vérité unique. Couverture : ~75 marques, 700+ modèles.
 */

export const BRANDS_MODELS: Record<string, string[]> = {
  // ── FRANÇAISES ─────────────────────────────────────────────────────────────
  Citroën: [
    "C1", "C3", "ë-C3", "C3 Aircross", "C4", "C4 Aircross",
    "C5 Aircross", "C5 X", "Berlingo", "SpaceTourer", "Dispatch",
  ],
  DS: ["DS 3", "DS 3 E-Tense", "DS 4", "DS 7", "DS 9"],
  Peugeot: [
    "108", "208", "e-208", "2008", "e-2008", "308", "408", "508",
    "e-3008", "3008", "e-5008", "5008", "Rifter", "Partner", "Traveller", "Expert",
  ],
  Renault: [
    "Twingo", "Clio", "Mégane", "Mégane E-Tech", "Arkana", "Captur",
    "Austral", "Kadjar", "Scénic", "Scénic E-Tech", "Talisman", "Zoé",
    "Kangoo", "Kangoo E-Tech", "Rafale", "5 E-Tech", "4 E-Tech",
  ],
  Alpine: ["A110", "A110 GT", "A110 S", "A290", "A390"],

  // ── ALLEMANDES ─────────────────────────────────────────────────────────────
  Audi: [
    "A1", "A1 Allstreet", "A3", "A4", "A5", "A6", "A7", "A8",
    "Q2", "Q3", "Q3 Sportback", "Q4 e-tron", "Q4 e-tron Sportback",
    "Q5", "Q5 Sportback", "Q7", "Q8", "Q8 e-tron", "TT", "R8", "e-tron GT",
  ],
  BMW: [
    "Série 1", "Série 2 Active Tourer", "Série 2 Gran Coupé", "Série 2 Coupé",
    "Série 3", "Série 4", "Série 5", "Série 7", "Série 8",
    "X1", "X2", "iX1", "iX2", "X3", "X4", "X5", "X6", "X7",
    "Z4", "i4", "i5", "i7", "iX", "M2", "M3", "M4", "M5",
  ],
  Mercedes: [
    "Classe A", "Classe B", "Classe C", "Classe E", "Classe G", "Classe S",
    "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "AMG GT",
    "EQA", "EQB", "EQC", "EQE", "EQS", "Vito", "Citan",
  ],
  Maybach: ["Classe S", "GLS", "EQS"],
  Opel: [
    "Corsa", "Corsa Electric", "Astra", "Astra Sports Tourer",
    "Crossland", "Grandland", "Mokka", "Mokka Electric",
    "Zafira Life", "Combo Life", "Movano", "Vivaro",
  ],
  Porsche: [
    "Macan", "Macan Electric", "Cayenne", "Cayenne Coupé",
    "Panamera", "911 Carrera", "911 GT3", "Taycan", "Taycan Cross Turismo",
    "718 Boxster", "718 Cayman",
  ],
  Volkswagen: [
    "Polo", "Golf", "Golf GTI", "Golf GTE", "Golf R",
    "ID.3", "ID.4", "ID.5", "ID.7", "ID. Buzz",
    "T-Cross", "T-Roc", "T-Roc R", "Tiguan", "Tiguan Allspace",
    "Passat", "Arteon", "Touareg", "Caddy", "Transporter",
  ],

  // ── JAPONAISES ─────────────────────────────────────────────────────────────
  Daihatsu: ["Sirion", "Terios", "Copen", "Rocky"],
  Honda: [
    "Jazz", "Jazz e:HEV", "Civic", "Civic e:HEV",
    "HR-V", "HR-V e:HEV", "CR-V", "CR-V e:HEV",
    "ZR-V", "ZR-V e:HEV", "e:Ny1", "Accord", "e",
  ],
  Infiniti: ["Q30", "Q50", "Q60", "QX30", "QX50", "QX55", "QX70", "QX80"],
  Lexus: [
    "CT 200h", "UX", "UX 300e", "NX", "NX 450h+",
    "RX", "RZ", "IS", "ES", "LS", "LC", "LBX",
  ],
  Mazda: [
    "Mazda2", "Mazda2 Hybrid", "Mazda3", "Mazda3 Fastback", "Mazda6",
    "CX-3", "CX-30", "MX-30", "CX-5", "CX-60", "CX-80", "MX-5", "MX-5 RF",
  ],
  Mitsubishi: [
    "Space Star", "Colt", "ASX", "Eclipse Cross", "Eclipse Cross PHEV",
    "Outlander", "Outlander PHEV", "L200", "Pajero Sport",
  ],
  Nissan: [
    "Micra", "Juke", "Juke Hybrid", "Qashqai", "Qashqai e-Power",
    "X-Trail", "X-Trail e-Power", "Ariya", "Leaf", "Navara", "Note", "Townstar",
  ],
  Subaru: [
    "Impreza", "XV", "Crosstrek", "Forester", "Outback",
    "Levorg", "BRZ", "Solterra", "WRX",
  ],
  Suzuki: [
    "Alto", "Swift", "Swift Sport", "Ignis", "Baleno",
    "SX4 S-Cross", "Vitara", "Across", "Jimny", "Jimny 5 portes",
  ],
  Toyota: [
    "Aygo X", "Yaris", "Yaris Cross", "GR Yaris", "GR86",
    "Corolla", "Corolla Cross", "Corolla Touring Sports",
    "C-HR", "C-HR GR Sport", "RAV4", "RAV4 PHEV",
    "bZ4X", "bZ3", "Camry", "Prius", "Land Cruiser", "Hilux",
    "Proace City", "Proace",
  ],

  // ── CORÉENNES ──────────────────────────────────────────────────────────────
  Genesis: ["G70", "G80", "G90", "GV60", "GV70", "GV80"],
  Hyundai: [
    "i10", "i20", "i20 N", "i30", "i30 N", "i30 Fastback",
    "Bayon", "Kona", "Kona Electric", "Tucson", "Tucson PHEV",
    "Santa Fe", "Santa Fe PHEV", "IONIQ 5", "IONIQ 5 N", "IONIQ 6", "IONIQ 9",
  ],
  Kia: [
    "Picanto", "Rio", "Stonic", "Ceed", "Ceed SW", "ProCeed", "XCeed",
    "Niro", "Niro EV", "Sportage", "Sportage PHEV",
    "Sorento", "Sorento PHEV", "EV3", "EV6", "EV6 GT", "EV9",
  ],
  KGM: [
    "Tivoli", "Tivoli Grand", "Korando", "Korando e-Motion",
    "Rexton", "Rexton Sports", "Torres", "Torres EVX",
  ],
  SsangYong: ["Tivoli", "Korando", "Rexton", "Musso"],

  // ── ESPAGNOLES ─────────────────────────────────────────────────────────────
  Cupra: ["Born", "Formentor", "Formentor VZ", "Leon", "Leon Sportstourer", "Terramar", "Tavascan"],
  Seat: ["Mii", "Ibiza", "Leon", "Leon Sportstourer", "Arona", "Ateca", "Tarraco"],
  Skoda: [
    "Fabia", "Scala", "Octavia", "Octavia Combi", "Karoq", "Kamiq",
    "Kodiaq", "Superb", "Superb Combi", "Enyaq", "Enyaq Coupé", "Elroq",
  ],

  // ── ITALIENNES ─────────────────────────────────────────────────────────────
  Abarth: ["500", "595", "695", "500e", "Punto"],
  "Alfa Romeo": [
    "MiTo", "Giulietta", "Giulia", "Stelvio", "Tonale", "Tonale PHEV", "Milano",
  ],
  Ferrari: [
    "Roma", "Portofino", "SF90 Stradale", "SF90 Spider",
    "296 GTB", "296 GTS", "F8 Tributo", "812 Superfast",
    "Purosangue", "California T",
  ],
  Fiat: [
    "500", "500e", "500C", "Panda", "Panda Hybrid", "Grande Panda",
    "Tipo", "500X", "500L", "Doblò", "Scudo",
  ],
  Iveco: ["Daily", "Eurocargo", "Stralis", "S-Way"],
  Jeep: [
    "Avenger", "Avenger 4xe", "Renegade", "Renegade 4xe",
    "Compass", "Compass 4xe", "Wrangler", "Wrangler 4xe",
    "Cherokee", "Grand Cherokee", "Gladiator",
  ],
  Lamborghini: ["Urus", "Urus S", "Urus SE", "Huracán", "Revuelto"],
  Lancia: ["Ypsilon", "Delta", "Voyager"],
  Maserati: [
    "Ghibli", "Quattroporte", "Levante", "GranTurismo",
    "GranCabrio", "Grecale", "MC20",
  ],

  // ── BRITANNIQUES ───────────────────────────────────────────────────────────
  "Aston Martin": [
    "DB11", "DB12", "DBS", "Vantage", "DBX", "DBX707",
  ],
  Bentley: [
    "Bentayga", "Continental GT", "Continental GTC",
    "Flying Spur", "Mulsanne",
  ],
  Jaguar: [
    "XE", "XF", "XJ", "F-Type", "E-Pace", "F-Pace", "I-Pace", "EV",
  ],
  "Land Rover": [
    "Defender 90", "Defender 110", "Defender 130",
    "Discovery", "Discovery Sport", "Freelander",
    "Range Rover", "Range Rover Sport",
    "Range Rover Evoque", "Range Rover Velar",
  ],
  Lotus: ["Emira", "Eletre", "Emeya", "Exige", "Evora"],
  McLaren: [
    "720S", "750S", "Artura", "GT", "Elva", "Senna",
  ],
  Mini: [
    "Mini 3 portes", "Mini 5 portes", "Mini Cabrio", "Mini Cooper SE",
    "Mini John Cooper Works", "Mini Clubman", "Mini Countryman",
    "Mini Countryman Electric", "Mini Aceman", "Mini Paceman",
  ],
  "Rolls-Royce": [
    "Ghost", "Wraith", "Dawn", "Phantom", "Cullinan", "Spectre",
  ],

  // ── NORDIQUES ──────────────────────────────────────────────────────────────
  Polestar: ["Polestar 1", "Polestar 2", "Polestar 3", "Polestar 4"],
  Saab: ["9-3", "9-5", "9-4X"],
  Volvo: [
    "V40", "V60", "V60 Cross Country", "V90", "V90 Cross Country",
    "XC40", "XC40 Recharge", "EX40", "XC60", "XC90", "EX90",
    "C40 Recharge", "S60", "S90", "EX30",
  ],

  // ── AMÉRICAINES ────────────────────────────────────────────────────────────
  Chevrolet: [
    "Spark", "Aveo", "Cruze", "Malibu", "Camaro", "Corvette",
    "Trax", "Equinox", "Captiva", "Traverse", "Tahoe", "Suburban",
  ],
  Dodge: ["Challenger", "Charger", "Durango", "Journey", "Hornet"],
  Ford: [
    "Fiesta", "Focus", "Focus Wagon", "Puma", "Kuga", "Kuga PHEV",
    "Mustang", "Mustang Mach-E", "Explorer", "Ranger",
    "Transit Custom", "Transit",
  ],

  // ── PREMIUM / TECH ─────────────────────────────────────────────────────────
  Smart: ["ForTwo", "ForTwo Cabrio", "ForFour", "#1", "#3"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y", "Model 2", "Cybertruck"],

  // ── CHINOISES & ÉMERGENTES ─────────────────────────────────────────────────
  Aiways: ["U5", "U6"],
  BYD: [
    "Atto 3", "Atto 2", "Han", "Tang", "Seal", "Seal U",
    "Seal U DM-i", "Dolphin", "Dolphin Mini", "Shark",
    "Sea Lion 6", "Sea Lion 7",
  ],
  DR: ["1.0", "2.0", "3.0", "4.0", "5.0", "6.0", "7.0", "EV1", "EV3", "EV6"],
  Evo: ["3", "4", "5", "6"],
  Hongqi: ["E-HS9", "H5", "H9", "EH7"],
  Leapmotor: ["C01", "C10", "T03", "B10"],
  "Lynk & Co": ["01", "02", "03", "05", "06", "09"],
  MG: [
    "MG3", "MG3 Hybrid+", "MG4", "MG4 Trophy",
    "MG5", "MG ZS", "MG ZS EV", "MG HS", "MG HS PHEV",
    "MG One", "Cyberster",
  ],
  Nio: ["ET5", "ET5T", "ET7", "ES6", "ES7", "ES8", "EL6", "EL8"],
  Ora: ["Funky Cat", "Good Cat", "Black Cat"],
  Seres: ["3", "5", "7"],
  VinFast: ["VF 5", "VF 6", "VF 7", "VF 8", "VF 9"],
  Xpeng: ["P5", "P7", "G3", "G6", "G9", "X9"],
  Zeekr: ["001", "007", "009", "X"],

  // ── AUTRES ─────────────────────────────────────────────────────────────────
  Dacia: [
    "Sandero", "Sandero Stepway", "Duster", "Logan", "Logan MCV",
    "Spring", "Jogger", "Bigster",
  ],
  Autre: [],
};

export const ALL_BRANDS = Object.keys(BRANDS_MODELS).sort((a, b) => {
  if (a === "Autre") return 1;
  if (b === "Autre") return -1;
  return a.localeCompare(b, "fr");
});
