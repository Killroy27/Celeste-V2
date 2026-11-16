import { Hero } from "@/components/Hero";
import { VendorRows } from "@/components/home/Rows";
import { AppSoon, BestMatch, ProBand, Promises, Proof } from "@/components/home/Sections";

// Chercher ou faire son Best Match en haut, parcourir le catalogue (« Métier · Lieu → »),
// puis de grands blocs aérés, un message chacun : Best Match, promesses, preuve, application, prestataires.
export default function Home() {
  return (
    <>
      <Hero />
      <VendorRows />
      <BestMatch />
      <Promises />
      <Proof />
      <AppSoon />
      <ProBand />
    </>
  );
}
