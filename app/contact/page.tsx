import type { Metadata } from "next";
import { Suspense } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ContactForm from "@/components/contact/ContactForm";
import { Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact & Devis",
  description:
    "Contactez Garage Auto Mendonca à Drémil-Lafage. Appelez le 05 61 83 78 05 ou envoyez-nous un message pour un devis gratuit.",
};

function ContactFormWrapper({ searchParams }: { searchParams: Record<string, string> }) {
  const vehicule = searchParams?.vehicule;
  return <ContactForm vehicule={vehicule} />;
}

const hours = [
  { day: "Lundi", time: "08h00–12h00 / 14h00–19h00", open: true },
  { day: "Mardi", time: "08h00–12h00 / 14h00–19h00", open: true },
  { day: "Mercredi", time: "08h00–12h00 / 14h00–19h00", open: true },
  { day: "Jeudi", time: "08h00–12h00 / 14h00–19h00", open: true },
  { day: "Vendredi", time: "08h00–12h00 / 14h00–18h00", open: true },
  { day: "Samedi", time: "Fermé", open: false },
  { day: "Dimanche", time: "Fermé", open: false },
];

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function ContactPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-dark-900 pt-36 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <span className="inline-block text-brand-400 font-semibold text-sm uppercase tracking-widest mb-4">
              On est là pour vous
            </span>
            <h1 className="font-heading font-black text-white text-5xl md:text-6xl mb-6 leading-tight">
              Contactez-nous &{" "}
              <span className="text-gradient">demandez un devis</span>
            </h1>
            <p className="text-dark-400 text-xl leading-relaxed max-w-2xl">
              Appelez-nous directement ou envoyez-nous un message. Nous
              répondons sous 24h et vous proposons un devis gratuit et détaillé.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-dark-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="font-heading font-bold text-dark-900 text-2xl mb-6">
                Envoyez-nous un message
              </h2>
              <Suspense fallback={<div className="h-96 bg-white rounded-2xl animate-pulse" />}>
                <ContactFormWrapper searchParams={params} />
              </Suspense>
            </div>

            {/* Info sidebar */}
            <div className="lg:col-span-2 space-y-5">
              <h2 className="font-heading font-bold text-dark-900 text-2xl mb-6">
                Nos coordonnées
              </h2>

              {/* Phone */}
              <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
                    <Phone size={22} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-400 font-medium">Téléphone</p>
                    <a
                      href="tel:0561837805"
                      className="font-heading font-bold text-dark-900 text-xl hover:text-brand-600 transition-colors"
                    >
                      05 61 83 78 05
                    </a>
                  </div>
                </div>
                <a
                  href="tel:0561837805"
                  className="btn-primary w-full justify-center mt-2"
                >
                  <Phone size={16} />
                  Appeler maintenant
                </a>
              </div>

              {/* Email */}
              <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail size={22} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-400 font-medium mb-1">Email</p>
                    <a
                      href="mailto:contact@garagemendonca.com"
                      className="font-semibold text-dark-900 hover:text-brand-600 transition-colors text-sm break-all"
                    >
                      contact@garagemendonca.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={22} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-400 font-medium mb-1">Adresse</p>
                    <p className="font-semibold text-dark-900 text-sm leading-relaxed">
                      6 Avenue de la Mouyssaguese
                      <br />
                      31280 Drémil-Lafage
                    </p>
                    <a
                      href="https://maps.google.com/?q=6+Avenue+de+la+Mouyssaguese+31280+Drémil-Lafage"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-brand-600 text-xs font-medium mt-2 hover:text-brand-700"
                    >
                      Itinéraire Google Maps
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
                    <Clock size={22} className="text-brand-600" />
                  </div>
                  <h3 className="font-semibold text-dark-900">Horaires</h3>
                </div>
                <ul className="space-y-2">
                  {hours.map(({ day, time, open }) => (
                    <li
                      key={day}
                      className="flex items-center justify-between text-sm border-b border-dark-50 pb-2 last:border-0 last:pb-0"
                    >
                      <span className="text-dark-600">{day}</span>
                      <span
                        className={`font-medium ${open ? "text-dark-900" : "text-red-500"}`}
                      >
                        {time}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mt-10 rounded-2xl overflow-hidden border border-dark-200 shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2889.1234567890!2d1.5678901234!3d43.6789012345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12ae913a72ec4f5b%3A0xe4c1d2b3f5a7e8c9!2s6%20Av.%20de%20la%20Mouyssaguese%2C%2031280%20Dr%C3%A9mil-Lafage%2C%20France!5e0!3m2!1sfr!2sfr!4v1699999999999!5m2!1sfr!2sfr"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Carte Garage Mendonca - Contact"
            />
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
