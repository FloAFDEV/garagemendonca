import MainLayout from "@/components/layout/MainLayout";
import Hero from "@/components/home/Hero";
import TrustBadges from "@/components/home/TrustBadges";
import ServicesOverview from "@/components/home/ServicesOverview";
import ProcessSection from "@/components/home/ProcessSection";
import GalleryAtelier from "@/components/home/GalleryAtelier";
import FeaturedVehicles from "@/components/home/FeaturedVehicles";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CallToAction";
import MapContact from "@/components/home/MapContact";

export default function HomePage() {
  return (
    <MainLayout>
      <Hero />
      <TrustBadges />
      <ServicesOverview />
      <ProcessSection />
      <GalleryAtelier />
      <FeaturedVehicles />
      <Testimonials />
      <CallToAction />
      <MapContact />
    </MainLayout>
  );
}
