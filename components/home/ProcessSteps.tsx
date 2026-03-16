import { Phone, ScanSearch, FileText, Wrench, CheckCircle2 } from "lucide-react";

const steps = [
  {
    num: "01",
    Icon: Phone,
    title: "Prise de contact",
    description: "Appelez-nous ou envoyez un message. Nous répondons dans la journée.",
  },
  {
    num: "02",
    Icon: ScanSearch,
    title: "Diagnostic",
    description: "Inspection complète de votre véhicule. Localisation précise de la panne.",
  },
  {
    num: "03",
    Icon: FileText,
    title: "Devis transparent",
    description: "Devis clair, détaillé et gratuit. Aucune surprise sur la facture finale.",
  },
  {
    num: "04",
    Icon: Wrench,
    title: "Réparation",
    description: "Intervention réalisée par nos mécaniciens qualifiés, dans les délais convenus.",
  },
  {
    num: "05",
    Icon: CheckCircle2,
    title: "Restitution",
    description: "Votre véhicule restitué propre, avec compte-rendu complet des travaux.",
  },
];

export default function ProcessSteps() {
  return (
    <section className="py-24 bg-dark-900 relative overflow-hidden">
      {/* Texture subtile */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 80px), repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 80px)",
        }}
      />

      <div className="relative container mx-auto px-4">

        {/* Header */}
        <div className="max-w-xl mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-brand-500" />
            <span className="text-brand-400 font-semibold text-xs uppercase tracking-[0.18em]">
              Comment ça se passe
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-white text-3xl md:text-4xl leading-tight">
            Un processus clair,<br />du diagnostic à la restitution
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Ligne de connexion horizontale — desktop */}
          <div className="hidden lg:block absolute top-10 left-0 right-0 h-px bg-dark-700" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
            {steps.map(({ num, Icon, title, description }) => (
              <div key={num} className="relative flex flex-col">
                {/* Numéro + icône */}
                <div className="flex lg:flex-col items-center lg:items-start gap-4 lg:gap-0 mb-4 lg:mb-5">
                  {/* Cercle numéroté */}
                  <div className="relative z-10 w-20 h-20 lg:w-16 lg:h-16 flex-shrink-0 bg-dark-900 border-2 border-dark-700 rounded-full flex items-center justify-center group-hover:border-brand-600 transition-colors">
                    <div className="w-12 h-12 lg:w-10 lg:h-10 bg-brand-600 rounded-full flex items-center justify-center">
                      <Icon size={20} className="text-white" strokeWidth={1.75} />
                    </div>
                  </div>

                  {/* Numéro mobile — à côté */}
                  <span className="lg:hidden font-heading font-black text-dark-600 text-3xl leading-none">
                    {num}
                  </span>
                </div>

                {/* Numéro desktop — au-dessus du titre */}
                <span className="hidden lg:block font-heading font-black text-dark-700 text-sm mb-1">
                  {num}
                </span>

                <h3 className="font-heading font-bold text-white text-base mb-2 leading-tight">
                  {title}
                </h3>
                <p className="text-dark-400 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA bas */}
        <div className="mt-14 pt-12 border-t border-dark-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="text-dark-400 text-sm max-w-md">
            Déposez votre véhicule avec ou sans rendez-vous. Véhicule de courtoisie disponible pendant l&apos;intervention.
          </p>
          <a
            href="tel:0532002038"
            className="btn-primary flex-shrink-0"
          >
            <Phone size={16} />
            Prendre rendez-vous
          </a>
        </div>
      </div>
    </section>
  );
}
