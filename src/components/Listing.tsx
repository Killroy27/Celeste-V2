"use client";

import { useMemo, useState } from "react";
import type { Vendor } from "@/lib/content";
import { CategoryBar } from "./CategoryBar";
import { CloseIcon } from "./icons";
import { VendorGrid } from "./VendorCard";
import styles from "./Listing.module.css";

type Sort = "match" | "price" | "rating";

const sorts: [Sort, string][] = [
  ["match", "Meilleur match"],
  ["rating", "Mieux notés"],
  ["price", "Prix croissant"],
];

const num = (r: string) => parseFloat(r.replace(",", "."));

// Liste filtrable : onglets métiers collés, panneau de filtres, tri. Tout se met à jour sur place.
export function Listing({ vendors, active, showCategory = false }: { vendors: Vendor[]; active?: string; showCategory?: boolean }) {
  const [sort, setSort] = useState<Sort>("match");
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const styleOptions = useMemo(() => [...new Set(vendors.map((v) => v.style))], [vendors]);
  const prices = useMemo(() => [...new Set(vendors.map((v) => v.price))].sort((a, b) => a - b), [vendors]);

  const list = useMemo(() => {
    const out = vendors.filter(
      (v) => (!picked.length || picked.includes(v.style)) && (!verifiedOnly || v.verified) && (maxPrice === null || v.price <= maxPrice),
    );
    if (sort === "price") out.sort((a, b) => a.price - b.price);
    if (sort === "rating") out.sort((a, b) => num(b.rating) - num(a.rating) || b.reviewsCount - a.reviewsCount);
    return out;
  }, [vendors, picked, verifiedOnly, maxPrice, sort]);

  const count = picked.length + (verifiedOnly ? 1 : 0) + (maxPrice !== null ? 1 : 0);
  const reset = () => {
    setPicked([]);
    setVerifiedOnly(false);
    setMaxPrice(null);
  };
  const toggleStyle = (s: string) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  return (
    <div id="filtres" className={styles.wrap}>
      <CategoryBar active={active} onFilters={() => setOpen((o) => !o)} filtersCount={count} />

      <div className="container">
        {open && (
          <div className={styles.panel} role="region" aria-label="Filtres">
            <div className={styles.group}>
              <span className={styles.label}>Style</span>
              <div className={styles.chips}>
                {styleOptions.map((s) => (
                  <button key={s} type="button" className="chip" aria-pressed={picked.includes(s)} onClick={() => toggleStyle(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.group}>
              <span className={styles.label}>Budget maximum</span>
              <div className={styles.chips}>
                <button type="button" className="chip" aria-pressed={maxPrice === null} onClick={() => setMaxPrice(null)}>
                  Tous
                </button>
                {prices.slice(0, -1).map((p) => (
                  <button key={p} type="button" className="chip" aria-pressed={maxPrice === p} onClick={() => setMaxPrice(p)}>
                    ≤ {p.toLocaleString("fr-FR")} €
                  </button>
                ))}
              </div>
            </div>
            <label className={styles.check}>
              <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
              Prestataires vérifiés uniquement
            </label>
            <div className={styles.panelActions}>
              <button type="button" className={styles.reset} onClick={reset} disabled={!count}>
                Tout effacer
              </button>
              <button type="button" className="btn btn-sm" onClick={() => setOpen(false)}>
                Afficher {list.length} résultat{list.length > 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}

        <div className={styles.toolbar}>
          <span className={styles.total} aria-live="polite">
            {list.length} prestataire{list.length > 1 ? "s" : ""}
          </span>
          <div className={styles.activeFilters}>
            {picked.map((s) => (
              <button key={s} type="button" className={styles.tag} onClick={() => toggleStyle(s)}>
                {s} <CloseIcon size={12} />
              </button>
            ))}
            {verifiedOnly && (
              <button type="button" className={styles.tag} onClick={() => setVerifiedOnly(false)}>
                Vérifiés <CloseIcon size={12} />
              </button>
            )}
            {maxPrice !== null && (
              <button type="button" className={styles.tag} onClick={() => setMaxPrice(null)}>
                ≤ {maxPrice.toLocaleString("fr-FR")} € <CloseIcon size={12} />
              </button>
            )}
          </div>
          <label className={styles.sort}>
            Trier
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              {sorts.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>

        {list.length ? (
          <VendorGrid vendors={list} showCategory={showCategory} />
        ) : (
          <div className={styles.empty}>
            <p className="h3">Aucun prestataire ne correspond à ces filtres</p>
            <p className="muted">Essayez d&apos;élargir votre budget ou de retirer un style.</p>
            <button type="button" className="btn btn-sm btn-outline" onClick={reset}>
              Effacer les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
