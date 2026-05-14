import Header from "./Header";
import Footer from "./Footer";
import PromoBanner from "@/components/PromoBanner";
import FloatingCTA from "@/components/contact/FloatingCTA";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header banner={<PromoBanner />} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
      <FloatingCTA />
    </div>
  );
}
