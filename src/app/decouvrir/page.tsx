import type { Metadata } from "next";
import { Carousel, Slide } from "@/components/Carousel";
import { CategoryBar } from "@/components/CategoryBar";
import { ResultsHead } from "@/components/results/ResultsHead";
import { VendorCard } from "@/components/VendorCard";
import { categories, vendorsIn } from "@/lib/content";

export const metadata: Metadata = {
  title: "Découvrir les prestataires",
  description: "Tous les métiers du mariage à Paris : lieux, traiteurs, photographes, DJ, fleuristes et plus encore.",
};

// Une rangée par métier, comme l'accueil : « Métier · Lieu → », chevrons, carte « Tout afficher ».
export default function DiscoverPage() {
  return (
    <div style={{ background: "#fff", paddingBottom: 96 }}>
      <ResultsHead narrow crumbs={[["Découvrir"]]} title="Tous les métiers" place="Paris et Île-de-France" lead="Les mieux notés de chaque métier. Une rangée vous plaît ? La flèche ouvre tous les profils, avec la carte." />
      <CategoryBar narrow />
      <div style={{ display: "grid", gap: 8, paddingTop: 24 }}>
        {categories.map((c) => {
          const list = vendorsIn(c.slug);
          return (
            <Carousel key={c.slug} title={`${c.plural} · Paris`} href={`/prestataires/${c.slug}`} more={{ href: `/prestataires/${c.slug}`, photos: list.slice(0, 3).map((v) => v.photo) }}>
              {list.map((v) => (
                <Slide key={v.slug}>
                  <VendorCard vendor={v} landscape />
                </Slide>
              ))}
            </Carousel>
          );
        })}
      </div>
    </div>
  );
}
