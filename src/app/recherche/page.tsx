import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CategoryBar } from "@/components/CategoryBar";
import { Results } from "@/components/results/Results";
import { ResultsHead } from "@/components/results/ResultsHead";
import { categories, getCategory, searchVendors } from "@/lib/content";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Recherche", robots: { index: false } };

type Props = { searchParams: Promise<{ quoi?: string; ou?: string; quand?: string }> };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function SearchPage({ searchParams }: Props) {
  const { quoi = "", ou = "", quand = "" } = await searchParams;
  const results = searchVendors({ quoi, ou });
  const cats = [...new Set(results.map((v) => v.category))];
  const single = cats.length === 1 ? getCategory(cats[0]) : undefined;
  const q = quoi.trim();
  const title = single && q ? single.plural : q ? cap(q) : "Tous les prestataires";
  const place = ou.trim() ? cap(ou.trim()) : "Paris et Île-de-France";

  return (
    <div style={{ background: "#fff" }}>
      <ResultsHead crumbs={[["Recherche"]]} title={title} place={place} lead={quand.trim() ? `Date souhaitée : ${quand.trim()}.` : undefined} />
      <CategoryBar active={single?.slug} />
      {results.length ? (
        <Results vendors={results} category={single?.slug} showCategory={!single} />
      ) : (
        <div className={styles.empty}>
          <h2>Rien pour « {q || ou} », pour l&apos;instant</h2>
          <p>Vérifiez l&apos;orthographe ou partez d&apos;un métier :</p>
          <div className={styles.cats}>
            {categories.map((c) => (
              <Link key={c.slug} href={`/prestataires/${c.slug}`} className={styles.cat}>
                <Image src={c.icon} alt="" width={32} height={32} />
                {c.plural}
              </Link>
            ))}
          </div>
          <p className={styles.or}>
            Ou laissez le Best Match vous proposer des profils :{" "}
            <Link href="/matchs" className={styles.link}>
              Trouver mon Best Match
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
