import { Vehicle, Service } from "@/types";

export const vehicles: Vehicle[] = [
  {
    id: "1",
    brand: "Peugeot",
    model: "308 SW",
    year: 2021,
    mileage: 42000,
    fuel: "Diesel",
    price: 18900,
    transmission: "Manuelle",
    power: 130,
    color: "Gris Platinium",
    doors: 5,
    featured: true,
    description:
      "Peugeot 308 SW en excellent état, entretien à jour, carnet de bord complet. Véhicule révisé et contrôle technique récent. Parfait pour une famille, avec un grand coffre et une tenue de route exemplaire.",
    images: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
    ],
  },
  {
    id: "2",
    brand: "Renault",
    model: "Clio V",
    year: 2022,
    mileage: 28000,
    fuel: "Essence",
    price: 14500,
    transmission: "Manuelle",
    power: 100,
    color: "Rouge Flamme",
    doors: 5,
    featured: true,
    description:
      "Renault Clio V première main, très bien entretenue. Équipée de la navigation GPS, caméra de recul et climatisation automatique. Idéale en ville et sur route.",
    images: [
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80",
      "https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?w=800&q=80",
    ],
  },
  {
    id: "3",
    brand: "Volkswagen",
    model: "Golf 8",
    year: 2020,
    mileage: 55000,
    fuel: "Diesel",
    price: 21500,
    transmission: "Automatique",
    power: 150,
    color: "Bleu Atlantis",
    doors: 5,
    featured: true,
    description:
      "Volkswagen Golf 8 TDI 150ch DSG7. Équipée du système IQ.Drive avec régulateur de vitesse adaptatif, lane assist et front assist. Finition Life confort.",
    images: [
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80",
      "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&q=80",
    ],
  },
  {
    id: "4",
    brand: "Citroën",
    model: "C3 Aircross",
    year: 2021,
    mileage: 38000,
    fuel: "Essence",
    price: 16800,
    transmission: "Manuelle",
    power: 110,
    color: "Blanc Banquise",
    doors: 5,
    featured: true,
    description:
      "Citroën C3 Aircross SUV compact, confort exceptionnel avec les sièges Advanced Comfort. Modulable avec banquette coulissante, idéal pour les familles.",
    images: [
      "https://images.unsplash.com/photo-1617469767807-42f8d20f0be8?w=800&q=80",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    ],
  },
  {
    id: "5",
    brand: "Toyota",
    model: "Yaris Hybride",
    year: 2022,
    mileage: 19000,
    fuel: "Hybride",
    price: 19900,
    transmission: "Automatique",
    power: 116,
    color: "Vert Bi-ton",
    doors: 5,
    featured: false,
    description:
      "Toyota Yaris 4ème génération full hybrid. Consommation mixte remarquable de 3,8L/100km. Finition Design avec JBL audio, écran tactile 9 pouces et caméra 360°.",
    images: [
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80",
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    ],
  },
  {
    id: "6",
    brand: "BMW",
    model: "Série 1",
    year: 2019,
    mileage: 68000,
    fuel: "Diesel",
    price: 22800,
    transmission: "Automatique",
    power: 150,
    color: "Noir Saphir",
    doors: 5,
    featured: false,
    description:
      "BMW 118d en très bon état général. Carnet d'entretien BMW complet, révisions effectuées chez le concessionnaire. Équipée du pack Business avec navigation Pro.",
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
      "https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=800&q=80",
    ],
  },
];

export const services: Service[] = [
  {
    id: "entretien",
    title: "Entretien & Révision",
    description:
      "Maintenez votre véhicule en parfait état avec nos services d'entretien complets. Vidange, filtres, distribution, freinage : nous prenons en charge toutes les opérations de maintenance selon les préconisations constructeur.",
    icon: "wrench",
    features: [
      "Vidange huile moteur",
      "Remplacement filtres (air, habitacle, carburant)",
      "Contrôle et remplacement courroie de distribution",
      "Entretien système de freinage",
      "Contrôle pneumatiques et géométrie",
      "Remplacement bougies et consommables",
    ],
  },
  {
    id: "mecanique",
    title: "Réparation Mécanique",
    description:
      "Notre équipe de mécaniciens qualifiés intervient sur tous types de pannes mécaniques. Avec plus de 30 ans d'expérience, nous diagnostiquons et réparons rapidement pour vous remettre sur la route en toute sécurité.",
    icon: "settings",
    features: [
      "Réparation moteur et boîte de vitesses",
      "Remplacement embrayage",
      "Réparation suspension et direction",
      "Remplacement amortisseurs",
      "Réparation système d'échappement",
      "Remplacement pièces d'usure",
    ],
  },
  {
    id: "carrosserie",
    title: "Carrosserie & Peinture",
    description:
      "Notre atelier carrosserie remet à neuf votre véhicule après un accident ou une simple rayure. Travaux de débosselage, peinture teinte constructeur et remplacement de pièces pour retrouver un véhicule comme neuf.",
    icon: "paintbrush",
    features: [
      "Débosselage et redressage",
      "Peinture teinte constructeur",
      "Remplacement pare-chocs et ailes",
      "Réparation et remplacement vitrage",
      "Polissage et lustrage",
      "Traitement anti-rouille",
    ],
  },
  {
    id: "diagnostic",
    title: "Diagnostic Électronique",
    description:
      "Grâce à nos équipements de diagnostic dernière génération, nous identifions rapidement les défaillances électroniques et électriques de votre véhicule. Compatible avec tous les constructeurs.",
    icon: "cpu",
    features: [
      "Lecture et effacement codes défauts",
      "Diagnostic toutes marques",
      "Réparation électronique embarquée",
      "Reprogrammation calculateurs",
      "Contrôle système anti-pollution",
      "Test batterie et alternateur",
    ],
  },
];

export const trustBadges = [
  {
    icon: "calendar",
    value: "30+",
    label: "Ans d'expérience",
    description: "Fondé en 1993, un savoir-faire éprouvé",
  },
  {
    icon: "shield-check",
    value: "500+",
    label: "Clients satisfaits",
    description: "Une réputation bâtie sur la confiance",
  },
  {
    icon: "car",
    value: "100+",
    label: "Véhicules vendus/an",
    description: "Un stock renouvelé régulièrement",
  },
  {
    icon: "clock",
    value: "48h",
    label: "Délai moyen",
    description: "Intervention rapide et efficace",
  },
];
