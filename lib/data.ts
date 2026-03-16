import { Vehicle, Service } from "@/types";

export const vehicles: Vehicle[] = [
  {
    id: "1",
    brand: "Toyota",
    model: "Yaris",
    year: 2020,
    mileage: 38000,
    fuel: "Essence",
    price: 12900,
    transmission: "Automatique",
    power: 100,
    color: "Blanc Nacré",
    doors: 5,
    featured: true,
    description:
      "Toyota Yaris en excellent état, boîte automatique, caméra de recul et GPS intégré. Entretien complet effectué, carnet de bord à jour. Idéale en ville, économique et fiable. Contrôle technique récent.",
    images: [
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80",
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    ],
  },
  {
    id: "2",
    brand: "Nissan",
    model: "Micra",
    year: 2019,
    mileage: 52000,
    fuel: "Essence",
    price: 9500,
    transmission: "Automatique",
    power: 80,
    color: "Gris Métallisé",
    doors: 5,
    featured: true,
    description:
      "Nissan Micra boîte automatique, très économique en carburant. Parfaite pour les déplacements urbains. Révisée et contrôlée par notre atelier avant mise en vente. Historique d'entretien complet.",
    images: [
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80",
      "https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?w=800&q=80",
    ],
  },
  {
    id: "3",
    brand: "Kia",
    model: "Picanto",
    year: 2021,
    mileage: 28000,
    fuel: "Essence",
    price: 13200,
    transmission: "Automatique",
    power: 85,
    color: "Rouge",
    doors: 5,
    featured: true,
    description:
      "Kia Picanto Platinum Edition, boîte automatique, équipée de la climatisation automatique, sièges chauffants et écran tactile. Garantie constructeur restante. Première main, très soignée.",
    images: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
    ],
  },
  {
    id: "4",
    brand: "Ford",
    model: "Fiesta",
    year: 2018,
    mileage: 65000,
    fuel: "Essence",
    price: 10900,
    transmission: "Automatique",
    power: 97,
    color: "Bleu",
    doors: 5,
    featured: true,
    description:
      "Ford Fiesta Trend boîte automatique. Agréable à conduire, bien équipée avec climatisation, bluetooth et régulateur de vitesse. Révisée, freins neufs, prête à rouler.",
    images: [
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80",
      "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&q=80",
    ],
  },
  {
    id: "5",
    brand: "Nissan",
    model: "Pixo",
    year: 2017,
    mileage: 72000,
    fuel: "Essence",
    price: 7900,
    transmission: "Automatique",
    power: 68,
    color: "Argent",
    doors: 5,
    featured: false,
    description:
      "Nissan Pixo Acenta boîte automatique, petite citadine très maniable. Consommation très faible, idéale pour les petits budgets. Entretien complet réalisé, contrôle technique récent.",
    images: [
      "https://images.unsplash.com/photo-1617469767807-42f8d20f0be8?w=800&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    ],
  },
  {
    id: "6",
    brand: "Suzuki",
    model: "Alto",
    year: 2018,
    mileage: 58000,
    fuel: "Essence",
    price: 8400,
    transmission: "Automatique",
    power: 68,
    color: "Blanc",
    doors: 5,
    featured: false,
    description:
      "Suzuki Alto Club boîte automatique. Légère, économique et facile à garer. Parfaite pour la ville. Véhicule contrôlé et révisé par notre équipe, prêt pour la route.",
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
      "Maintenez votre véhicule en parfait état avec nos services d'entretien complets. Vidange, filtres, distribution, freinage : nous prenons en charge toutes les opérations de maintenance selon les préconisations constructeur, avec garantie constructeur respectée.",
    icon: "wrench",
    features: [
      "Vidange huile moteur",
      "Remplacement filtres (air, habitacle, carburant)",
      "Contrôle et remplacement courroie de distribution",
      "Entretien système de freinage",
      "Contrôle pneumatiques et géométrie",
      "Préparation contrôle technique",
      "Révision garantie constructeur",
      "Recharge et révision climatisation",
    ],
  },
  {
    id: "mecanique",
    title: "Réparation Mécanique",
    description:
      "Notre équipe de mécaniciens qualifiés intervient sur tous types de pannes mécaniques, toutes marques. Spécialistes BMW, Audi et Volkswagen, nous diagnostiquons et réparons rapidement pour vous remettre sur la route en toute sécurité.",
    icon: "settings",
    features: [
      "Réparation moteur — spécialiste BMW / Audi / VW",
      "Remplacement embrayage et boîte de vitesses",
      "Réparation suspension, direction et amortisseurs",
      "Réparation système d'échappement",
      "Remplacement pneumatiques toutes marques",
      "Rénovation optiques et phares",
      "Mise au point moteur",
      "Remplacement pièces d'usure",
    ],
  },
  {
    id: "carrosserie",
    title: "Carrosserie & Peinture",
    description:
      "Notre atelier carrosserie remet à neuf votre véhicule après un accident ou une simple rayure. Travaux de débosselage, peinture teinte constructeur, remplacement de vitrage et réparation d'ailes pour retrouver un véhicule comme neuf.",
    icon: "paintbrush",
    features: [
      "Débosselage et redressage carrosserie",
      "Peinture teinte constructeur",
      "Remplacement et réparation d'ailes",
      "Réparation et remplacement vitrage / pare-brise",
      "Rénovation optiques et phares",
      "Polissage et lustrage",
      "Traitement anti-rouille",
    ],
  },
  {
    id: "diagnostic",
    title: "Diagnostic Électronique",
    description:
      "Grâce à nos équipements de diagnostic dernière génération, nous identifions rapidement les défaillances électroniques et électriques de votre véhicule. Compatible avec toutes les marques, nous intervenons pour une simple lecture de codes jusqu'à la reprogrammation de calculateurs.",
    icon: "cpu",
    features: [
      "Lecture et effacement codes défaut",
      "Diagnostic toutes marques",
      "Réparation panne moteur",
      "Reprogrammation calculateurs",
      "Contrôle système anti-pollution",
      "Test batterie et alternateur",
      "Diagnostic électrique complet",
    ],
  },
];

export const trustBadges = [
  {
    icon: "calendar",
    value: "30+",
    label: "Ans d'expérience",
    description: "M. Victor Mendonça et son équipe à votre service depuis plus de 30 ans",
  },
  {
    icon: "shield-check",
    value: "Toutes",
    label: "Marques acceptées",
    description: "Spécialistes BMW, Audi et VW — toutes marques bienvenues",
  },
  {
    icon: "car",
    value: "VO",
    label: "Boîte automatique",
    description: "Large sélection de véhicules d'occasion en boîte automatique",
  },
  {
    icon: "key",
    value: "9",
    label: "Véhicules de prêt",
    description: "Véhicule de courtoisie offert pendant toute intervention",
  },
];
