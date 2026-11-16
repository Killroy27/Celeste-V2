import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { FavoritesList } from "./FavoritesList";

export const metadata: Metadata = { title: "Mes coups de cœur", robots: { index: false } };

export default function FavoritesPage() {
  return (
    <>
      <PageIntro crumbs={[["Mes coups de cœur"]]} title="Mes coups de cœur" lead="Les prestataires que vous avez enregistrés. Comparez-les, puis demandez vos devis." />
      <FavoritesList />
    </>
  );
}
