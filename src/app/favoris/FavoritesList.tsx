"use client";

import Image from "next/image";
import Link from "next/link";
import { VendorGrid } from "@/components/VendorCard";
import { vendors } from "@/lib/content";
import { useFavorites } from "@/lib/favorites";

export function FavoritesList() {
  const { favorites } = useFavorites();
  const list = vendors.filter((v) => favorites.includes(v.slug));

  return (
    <div className="container" style={{ paddingBottom: 96 }}>
      {list.length ? (
        <VendorGrid vendors={list} showCategory />
      ) : (
        <div className="card-surface" style={{ display: "grid", justifyItems: "center", gap: 12, padding: "48px 24px", textAlign: "center" }}>
          <Image src="/icons/favorite-heart.png" alt="" width={96} height={96} />
          <h2 className="h3">Aucun coup de cœur pour l&apos;instant</h2>
          <p className="muted" style={{ margin: 0, maxWidth: 420 }}>
            Touchez le ♡ sur une fiche prestataire pour la retrouver ici. Vos coups de cœur restent enregistrés sur cet appareil.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
            <Link href="/decouvrir" className="btn btn-sm">
              Découvrir les prestataires
            </Link>
            <Link href="/matchs" className="btn btn-sm btn-outline">
              Trouver mes matchs
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
