import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ActividadesSection from "@/components/ActividadesSection";
import InfoSection from "@/components/InfoSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ActividadesSection />
        <InfoSection />
      </main>
      <Footer />
    </>
  );
}
