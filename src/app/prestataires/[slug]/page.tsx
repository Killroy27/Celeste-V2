import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Listing } from "@/components/Listing";
import { PageIntro } from "@/components/PageIntro";
import { categories, getCategory, vendorsIn } from "@/lib/content";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const cat = getCategory((await params).slug);
  return cat ? { title: `${cat.plural} de mariage à Paris`, description: cat.intro } : {};
}

export default async function CategoryPage({ params }: Params) {
  const cat = getCategory((await params).slug);
  if (!cat) notFound();
  return (
    <>
      <PageIntro crumbs={[["Découvrir", "/decouvrir"], [cat.plural]]} title={`${cat.plural} de mariage à Paris`} lead={cat.intro} />
      <Listing vendors={vendorsIn(cat.slug)} active={cat.slug} />
    </>
  );
}
