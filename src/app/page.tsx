import { FeaturedVendors } from "@/components/FeaturedVendors";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { featuredVendors } from "@/lib/content";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturedVendors
          title="Photographes coups de cœur à Paris"
          href="/prestataires/photographes?ou=Paris"
          total={48}
          vendors={featuredVendors}
          ctaLabel="Voir les 48 photographes"
          category="photographes"
        />
      </main>
    </>
  );
}
