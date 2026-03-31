import Header from "./Header";
import Footer from "./Footer";
import PromoBanner from "@/components/PromoBanner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* PromoBanner est passée comme slot server component au Header fixe —
          elle se rend à l'intérieur de l'élément <header> position:fixed,
          au-dessus de la nav, sans conflit de z-index ni hydratation. */}
      <Header banner={<PromoBanner />} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
