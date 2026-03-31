import type { Service } from "@/types";
import ServiceHero from "./ServiceHero";
import ServiceFeatures from "./ServiceFeatures";
import ServiceSteps from "./ServiceSteps";
import ServicePricing from "./ServicePricing";
import ServiceTestimonials from "./ServiceTestimonials";
import ServiceFAQ from "./ServiceFAQ";
import ServiceCTA from "./ServiceCTA";

interface Props {
	service: Service;
	phone: string;
}

export default function ServiceSection({ service, phone }: Props) {
	return (
		<div className="py-16 sm:py-20">
			<div className="space-y-14">
				{/* 1 — Hero : image + titre + description */}
				<ServiceHero
					service={{
						slug: service.slug,
						title: service.title,
						long_description: service.long_description,
						images: service.images,
					}}
				/>

				{/* 2 — Prestations */}
				<ServiceFeatures features={service.features} />

				{/* 3 — Étapes (conditionnel) */}
				{service.steps && service.steps.length > 0 && (
					<ServiceSteps steps={service.steps} />
				)}

				{/* 4 — Tarifs (conditionnel) */}
				{service.pricing && service.pricing.length > 0 && (
					<ServicePricing pricing={service.pricing} />
				)}

				{/* 5 — Témoignages (conditionnel) */}
				{service.testimonials && service.testimonials.length > 0 && (
					<ServiceTestimonials testimonials={service.testimonials} />
				)}

				{/* 6 — FAQ (conditionnel) */}
				{service.faq && service.faq.length > 0 && (
					<ServiceFAQ faq={service.faq} serviceSlug={service.slug} />
				)}

				{/* 7 — CTA */}
				<ServiceCTA
					cta_label="Nous écrire"
					cta_url="/contact"
					phone={phone}
				/>
			</div>
		</div>
	);
}
