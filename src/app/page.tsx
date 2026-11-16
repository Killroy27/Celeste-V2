import { Hero } from "@/components/Hero";
import { VendorRows } from "@/components/home/Rows";
import { Duo, Reviews, WhyCeleste } from "@/components/home/Sections";

// Chercher ou faire son Best Match en haut, parcourir le catalogue,
// puis en trois temps : ce que fait Céleste, la preuve, les deux portes de sortie.
export default function Home() {
  return (
    <>
      <Hero />
      <VendorRows />
      <WhyCeleste />
      <Reviews />
      <Duo />
    </>
  );
}
