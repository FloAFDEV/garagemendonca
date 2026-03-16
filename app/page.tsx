import MainLayout from "@/components/layout/MainLayout";
import Hero from "@/components/home/Hero";
import TrustBadges from "@/components/home/TrustBadges";
import ServicesOverview from "@/components/home/ServicesOverview";
import FeaturedVehicles from "@/components/home/FeaturedVehicles";
import CallToAction from "@/components/home/CallToAction";
import MapContact from "@/components/home/MapContact";

export default function HomePage() {
  return (
    <MainLayout>
      <Hero />
      <TrustBadges />
      <ServicesOverview />
      <FeaturedVehicles />
      <CallToAction />
      <MapContact />
    </MainLayout>
  );
}
