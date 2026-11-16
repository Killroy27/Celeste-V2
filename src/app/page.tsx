import { Hero } from "@/components/Hero";
import { VendorRows } from "@/components/home/Rows";
import { AppSoon, BestMatch, ProBand, Proof, WhyCeleste } from "@/components/home/Sections";

// Haut de page : chercher ou faire son Best Match, puis parcourir le catalogue.
// Dessous, un entonnoir : Best Match → pourquoi Céleste → avis → application (e-mail) → prestataires.
export default function Home() {
  return (
    <>
      <Hero />
      <VendorRows />
      <BestMatch />
      <WhyCeleste />
      <Proof />
      <AppSoon />
      <ProBand />
    </>
  );
}
