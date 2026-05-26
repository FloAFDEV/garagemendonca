export interface FaqItem {
	question: string;
	answer: string;
}

export interface FaqCategory {
	id: string;
	label: string;
	items: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
	{
		id: "vehicules",
		label: "Véhicules & Stock",
		items: [
			{
				question: "Quels types de véhicules proposez-vous ?",
				answer:
					"Nous sommes spécialisés dans les véhicules japonais (Toyota, Honda, Nissan, Mazda, Mitsubishi) et coréens (Hyundai, Kia), particulièrement les modèles équipés de boîtes automatiques. Notre stock tourne régulièrement autour d'une vingtaine de véhicules soigneusement sélectionnés, adaptés aux jeunes conducteurs, aux seniors et aux personnes à mobilité réduite.",
			},
			{
				question: "D'où viennent vos véhicules d'occasion ?",
				answer:
					"Nos véhicules proviennent principalement de marchands professionnels et de particuliers de confiance. Chaque véhicule est inspecté, révisé et, si nécessaire, remis en état avant d'être mis en vente. Nous travaillons exclusivement avec des véhicules dont nous pouvons retracer l'historique d'entretien.",
			},
			{
				question: "Peut-on essayer un véhicule avant d'acheter ?",
				answer:
					"Oui, un essai routier est possible sur demande pour tous les véhicules en stock. Nous vous conseillons d'appeler au 05 32 00 20 38 pour convenir d'un rendez-vous. L'essai se fait accompagné de l'un de nos mécaniciens qui peut répondre à vos questions techniques en temps réel.",
			},
		],
	},
	{
		id: "garantie",
		label: "Garantie & Documents",
		items: [
			{
				question: "Les véhicules sont-ils garantis ?",
				answer:
					"Oui. Tous nos véhicules d'occasion bénéficient d'une garantie légale de conformité de 12 mois (vices cachés inclus). Selon le véhicule, nous pouvons proposer des extensions de garantie. Le détail est précisé sur chaque annonce et dans le bon de commande.",
			},
			{
				question: "Quels documents sont fournis à l'achat ?",
				answer:
					"Vous recevez : le certificat d'immatriculation (carte grise) à votre nom, le procès-verbal du contrôle technique datant de moins de 6 mois, le carnet d'entretien, la facture de vente et, si disponible, l'historique des réparations. La déclaration de cession est effectuée directement par nos soins.",
			},
			{
				question: "Proposez-vous la reprise de mon véhicule actuel ?",
				answer:
					"Oui, nous effectuons des reprises. Amenez simplement votre véhicule au garage pour une estimation gratuite et sans engagement. Le montant de la reprise est déduit du prix d'achat de votre prochain véhicule, ce qui simplifie les démarches administratives.",
			},
		],
	},
	{
		id: "financement",
		label: "Financement & Paiement",
		items: [
			{
				question: "Le financement est-il possible ?",
				answer:
					"Oui. Nous travaillons avec des partenaires financiers qui proposent des solutions de crédit auto adaptées à votre situation. Rapprochez-vous de nous directement pour étudier votre dossier. Les simulations sont gratuites et sans engagement.",
			},
			{
				question: "Quels modes de paiement acceptez-vous ?",
				answer:
					"Nous acceptons les espèces, les virements bancaires et les chèques de banque pour les montants importants. Nous n'acceptons pas les paiements par carte bancaire pour les achats de véhicules. Pour le financement, le partenaire bancaire gère le déblocage des fonds directement.",
			},
		],
	},
	{
		id: "logistique",
		label: "Livraison & Réservation",
		items: [
			{
				question: "Livrez-vous les véhicules ?",
				answer:
					"Nous proposons la livraison dans un rayon de 100 km autour de Drémil-Lafage. Les frais de livraison sont à convenir directement avec nous selon la distance. La majorité de nos clients vient sur place, mais nous pouvons organiser la remise du véhicule à votre domicile.",
			},
			{
				question: "Puis-je réserver un véhicule sans me déplacer ?",
				answer:
					"Oui, un acompte peut bloquer un véhicule jusqu'à votre venue. Contactez-nous par téléphone ou via notre formulaire de contact pour convenir des modalités. Nous pouvons également organiser un rendez-vous vidéo pour vous présenter le véhicule à distance avant votre déplacement.",
			},
		],
	},
	{
		id: "technique",
		label: "Boîte automatique & Entretien",
		items: [
			{
				question: "Pourquoi choisir une voiture à boîte automatique ?",
				answer:
					"La boîte automatique est idéale pour la conduite en ville, les longs trajets autoroutiers, les jeunes conducteurs en apprentissage ou les personnes dont la mobilité est réduite. Elle réduit la fatigue au volant et s'avère souvent plus durable qu'une boîte manuelle lorsqu'elle est correctement entretenue.",
			},
			{
				question: "Comment entretenir une boîte automatique ?",
				answer:
					"L'entretien d'une boîte automatique repose principalement sur le remplacement régulier de l'huile de boîte (tous les 60 000 km environ selon les constructeurs). Nous sommes spécialisés dans cet entretien et utilisons les huiles préconisées par chaque constructeur. Évitez les vidanges tardives qui abîment irrémédiablement la boîte.",
			},
			{
				question: "Êtes-vous spécialisés dans les marques japonaises ?",
				answer:
					"Oui, c'est notre cœur de métier depuis 2001. Nous maîtrisons parfaitement les spécificités mécaniques des Toyota, Honda, Nissan, Mazda et Mitsubishi — notamment leurs boîtes automatiques et leurs systèmes hybrides. Nous disposons des outils de diagnostic dédiés et des pièces adaptées.",
			},
			{
				question: "Combien de temps dure un diagnostic ?",
				answer:
					"Notre diagnostic électronique couvre l'ensemble des calculateurs du véhicule (moteur, boîte, ABS, airbags…) grâce à des outils professionnels de dernière génération. Ce bilan technique complet nous permet de chiffrer précisément toute intervention nécessaire.",
			},
		],
	},
];

export const ALL_FAQ_ITEMS: FaqItem[] = FAQ_CATEGORIES.flatMap((c) => c.items);
