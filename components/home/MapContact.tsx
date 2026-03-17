import { Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

const hours = [
  { day: "Lundi – Jeudi", time: "08h00–12h00  /  14h00–19h00" },
  { day: "Vendredi", time: "08h00–12h00  /  14h00–18h00" },
  { day: "Samedi – Dimanche", time: "Fermé" },
];

export default function MapContact() {
  return (
    <section className="py-24 bg-[#f1f5f9]">
      <div className="container mx-auto px-4">

        <AnimateOnScroll>
          <div className="text-center mb-14">
            <div className="section-divider mx-auto" />
            <span className="eyebrow justify-center">Nous trouver</span>
            <h2 className="section-title">Comment nous rendre visite</h2>
            <p className="section-subtitle mx-auto mt-4">
              Situé à Drémil-Lafage, à quelques kilomètres de Toulouse, notre
              garage est facilement accessible.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Info panel */}
          <AnimateOnScroll delay={80} className="lg:col-span-2 flex flex-col gap-5">
            {/* Address */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-brand-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0f172a] mb-1">Adresse</h3>
                  <p className="text-[#475569] text-sm leading-relaxed">
                    6 Avenue de la Mouyssaguese
                    <br />
                    31280 Drémil-Lafage, France
                  </p>
                  <a
                    href="https://maps.google.com/?q=Garage+Mendonca+Drémil-Lafage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-brand-600 text-sm font-medium mt-3 hover:text-brand-700 transition-colors rounded"
                  >
                    Ouvrir dans Google Maps
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>

            {/* Phone & Email */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-brand-500" />
                  </div>
                  <div>
                    <p className="text-xs text-[#475569] font-medium mb-0.5">Téléphone</p>
                    <a
                      href="tel:0532002038"
                      className="text-[#0f172a] font-semibold hover:text-brand-600 transition-colors"
                    >
                      05 32 00 20 38
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="text-brand-500" />
                  </div>
                  <div>
                    <p className="text-xs text-[#475569] font-medium mb-0.5">Email</p>
                    <a
                      href="mailto:contact@garagemendonca.com"
                      className="text-[#0f172a] font-semibold hover:text-brand-600 transition-colors text-sm"
                    >
                      contact@garagemendonca.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center">
                  <Clock size={20} className="text-brand-500" />
                </div>
                <h3 className="font-semibold text-[#0f172a]">Horaires d&apos;ouverture</h3>
              </div>
              <ul className="space-y-3">
                {hours.map(({ day, time }) => (
                  <li
                    key={day}
                    className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0"
                  >
                    <span className="text-[#475569]">{day}</span>
                    <span
                      className={`font-medium ${
                        time === "Fermé" ? "text-red-500" : "text-[#0f172a]"
                      }`}
                    >
                      {time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimateOnScroll>

          {/* Map */}
          <AnimateOnScroll delay={160} className="lg:col-span-3">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-card h-full min-h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2889.1234567890!2d1.5678901234!3d43.6789012345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12ae913a72ec4f5b%3A0xe4c1d2b3f5a7e8c9!2s6%20Av.%20de%20la%20Mouyssaguese%2C%2031280%20Dr%C3%A9mil-Lafage%2C%20France!5e0!3m2!1sfr!2sfr!4v1699999999999!5m2!1sfr!2sfr"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Carte Garage Mendonca"
              />
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
