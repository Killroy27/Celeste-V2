import { Hero } from "@/components/Hero";
import { ReviewRow, VendorRows } from "@/components/home/Rows";
import { AppSoon, BestMatch, BrowseLinks, HowItWorks, ProBand, Stats } from "@/components/home/Sections";

// Ordre pensé pour l'action : chercher ou faire son Best Match en haut, parcourir le catalogue,
// puis comprendre Céleste. Un seul fond, aucune bande : les sections se séparent par l'espace.
export default function Home() {
  return (
    <>
      <Hero />
      <VendorRows />
      <BestMatch />
      <AppSoon />
      <HowItWorks />
      <ReviewRow />
      <Stats />
      <ProBand />
      <BrowseLinks />
    </>
  );
}
