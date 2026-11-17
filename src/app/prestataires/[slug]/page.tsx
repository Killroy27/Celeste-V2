import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryBar } from "@/components/CategoryBar";
import { Results } from "@/components/results/Results";
import { ResultsHead } from "@/components/results/ResultsHead";
import { categories, getCategory, vendorsIn } from "@/lib/content";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const cat = getCategory((await params).slug);
  return cat ? { title: `${cat.plural} de mariage à Paris et en Île-de-France`, description: cat.intro } : {};
}

// Page métier : en-tête, onglets des métiers collés, puis résultats (filtres, grille, carte).
export default async function CategoryPage({ params }: Params) {
  const cat = getCategory((await params).slug);
  if (!cat) notFound();
  return (
    <div style={{ background: "#fff" }}>
      <ResultsHead crumbs={[["Découvrir", "/decouvrir"], [cat.plural]]} title={cat.plural} place="Paris et Île-de-France" lead={cat.intro} />
      <CategoryBar active={cat.slug} />
      <Results vendors={vendorsIn(cat.slug)} category={cat.slug} />
    </div>
  );
}
