import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ServicesAndFleet } from "@/components/ServicesAndFleet";
import { CarbonQuoteCalculator } from "@/components/CarbonQuoteCalculator";
import { BookingCheckout } from "@/components/BookingCheckout";
import { PodPortal } from "@/components/PodPortal";
import { AboutAndSustainability } from "@/components/AboutAndSustainability";
import { ContactAndAdmin } from "@/components/ContactAndAdmin";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"LocalBusiness\",\"name\":\"logitechtransport\",\"description\":\"we are logistic and transport delivery company who operate all over the uk, we use green and yellow a our primary brand colours\",\"address\":{\"@type\":\"PostalAddress\",\"addressLocality\":\"cardiff, wales\"},\"url\":\"https://logitechtransport-de6f1e.duckbyte.co\"}" }} />
      <Navbar />
      <Suspense fallback={<div className="min-h-[30vh]" />}>
        <HeroSection />
      </Suspense>
      <Suspense fallback={<div className="min-h-[30vh]" />}>
        <ServicesAndFleet />
      </Suspense>
      <Suspense fallback={<div className="min-h-[30vh]" />}>
        <CarbonQuoteCalculator />
      </Suspense>
      <Suspense fallback={<div className="min-h-[30vh]" />}>
        <BookingCheckout />
      </Suspense>
      <Suspense fallback={<div className="min-h-[30vh]" />}>
        <PodPortal />
      </Suspense>
      <Suspense fallback={<div className="min-h-[30vh]" />}>
        <AboutAndSustainability />
      </Suspense>
      <Suspense fallback={<div className="min-h-[30vh]" />}>
        <ContactAndAdmin />
      </Suspense>
      <Footer />
    </main>
  );
}
