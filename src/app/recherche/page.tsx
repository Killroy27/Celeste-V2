import type { Metadata } from "next";
import Link from "next/link";
import { Listing } from "@/components/Listing";
import { PageIntro } from "@/components/PageIntro";
import { searchVendors } from "@/lib/content";

export const metadata: Metadata = { title: "Recherche", robots: { index: false } };

type Props = { searchParams: Promise<{ quoi?: string; ou?: string; quand?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { quoi = "", ou = "", quand = "" } = await searchParams;
  const results = searchVendors({ quoi, ou });
  const what = quoi.trim() || "Tous les prestataires";
  const details = [ou.trim() && `à ${ou.trim()}`, quand.trim() && `pour le ${quand.trim()}`].filter(Boolean).join(" ");

  return (
    <>
      <PageIntro
        crumbs={[["Recherche"]]}
        title={
          <>
            {what} <em style={{ fontWeight: 600 }}>{details}</em>
          </>
        }
        lead={
          results.length
            ? `${results.length} prestataire${results.length > 1 ? "s" : ""} disponible${results.length > 1 ? "s" : ""}. Demandez vos devis gratuitement, réponse sous 48 h.`
            : undefined
        }
      />
      {results.length ? (
        <Listing vendors={results} showCategory />
      ) : (
        <div className="container" style={{ paddingBottom: 96 }}>
          <div className="card-surface" style={{ padding: 40, display: "grid", gap: 12, justifyItems: "start" }}>
            <h2 className="h3">Aucun résultat pour cette recherche</h2>
            <p className="muted" style={{ margin: 0 }}>
              Vérifiez l&apos;orthographe, essayez un métier (photographe, traiteur, DJ…) ou laissez-nous vous proposer des prestataires.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <Link href="/matchs" className="btn btn-sm">
                Trouver mon Best Match
              </Link>
              <Link href="/decouvrir" className="link-underline">
                Parcourir tous les métiers
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
