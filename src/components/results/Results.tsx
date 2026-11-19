"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { formatDay, isoDate } from "@/lib/format";
import { isSelectPublic } from "@/lib/select";
import { getCategory, priceLabel, type Vendor } from "@/lib/content";
import { useDna } from "@/lib/dna";
import { computeMatches } from "@/lib/match";
import { personFor, pinFor, availabilityOn } from "@/lib/vendorDetail";
import { CardPhotos } from "../CardPhotos";
import { SaveButton } from "../SaveButton";
import { Dropdown } from "./Dropdown";
import type { Pin } from "./ResultsMap";
import styles from "./Results.module.css";
import { WhyOrder } from "./WhyOrder";

const ResultsMap = dynamic(() => import("./ResultsMap"), { ssr: false, loading: () => <div className={styles.mapLoading} /> });

type Sort = "best" | "rating" | "price";

const num = (r: string) => parseFloat(r.replace(",", "."));
const unit: Record<string, string> = { traiteurs: "/pers.", patisserie: "/part" };
const shortPrice = (v: Vendor) => (v.price >= 1000 ? `${(v.price / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} k€` : `${v.price} €${unit[v.category] ?? ""}`);

function Check() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

const noop = () => () => {};

// Résultats façon Airbnb : filtres en pastilles, grille à gauche, carte à droite.
// La carte n'apparaît que si au moins un prestataire est localisé (docs/recherche.md).
export function Results({ vendors, category, showCategory = false, initialDate = "" }: { vendors: Vendor[]; category?: string; showCategory?: boolean; initialDate?: string }) {
  const { dna } = useDna();
  // Badge Select : seuils administrables lus côté navigateur, affiché après l'hydratation.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const [styleSel, setStyleSel] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [verified, setVerified] = useState(false);
  // Date choisie dans la barre de recherche (Jour J) : le filtre « libres ce jour-là » part déjà réglé.
  const [onDate, setOnDate] = useState(initialDate);
  const [zonesSel, setZonesSel] = useState<string[]>([]);
  const [servicesSel, setServicesSel] = useState<string[]>([]);
  const [selectOnly, setSelectOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("best");
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [mapView, setMapView] = useState(false);

  // Score Best Match quand un Wedding DNA existe (calculé métier par métier).
  const scores = useMemo(() => {
    const out = new Map<string, number>();
    if (!dna) return out;
    for (const cat of new Set(vendors.map((v) => v.category))) for (const m of computeMatches(dna, cat, {})) out.set(m.vendor.slug, m.score);
    return out;
  }, [dna, vendors]);

  const styleOptions = useMemo(() => {
    const count = new Map<string, number>();
    vendors.forEach((v) => count.set(v.style, (count.get(v.style) ?? 0) + 1));
    return [...count.entries()].sort((a, b) => b[1] - a[1]);
  }, [vendors]);
  const zoneOptions = useMemo(() => {
    const count = new Map<string, number>();
    vendors.forEach((v) => count.set(v.area, (count.get(v.area) ?? 0) + 1));
    return [...count.entries()].sort((a, b) => b[1] - a[1]);
  }, [vendors]);
  // Services : ce que les formules incluent, les plus fréquents d'abord.
  const serviceOptions = useMemo(() => {
    const count = new Map<string, number>();
    vendors.forEach((v) => new Set(v.packages.flatMap((p) => p.includes)).forEach((s) => count.set(s, (count.get(s) ?? 0) + 1)));
    return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [vendors]);
  const [pMin, pMax] = useMemo(() => {
    const ps = vendors.map((v) => v.price);
    return [Math.min(...ps), Math.max(...ps)];
  }, [vendors]);

  const list = useMemo(() => {
    const out = vendors.filter(
      (v) =>
        (!styleSel.length || styleSel.includes(v.style)) &&
        (maxPrice === null || v.price <= maxPrice) &&
        num(v.rating) >= minRating &&
        (!verified || v.verified) &&
        (!onDate || availabilityOn(v, onDate) !== "Complet") &&
        (!zonesSel.length || zonesSel.includes(v.area)) &&
        (!servicesSel.length || servicesSel.every((s) => v.packages.some((p) => p.includes.includes(s)))) &&
        (!selectOnly || isSelectPublic(v.slug)),
    );
    const reco = (v: Vendor) => num(v.rating) * Math.log10(10 + v.reviewsCount);
    if (sort === "best") out.sort((a, b) => (scores.size ? (scores.get(b.slug) ?? 0) - (scores.get(a.slug) ?? 0) : reco(b) - reco(a)));
    if (sort === "rating") out.sort((a, b) => num(b.rating) - num(a.rating) || b.reviewsCount - a.reviewsCount);
    if (sort === "price") out.sort((a, b) => a.price - b.price);
    return out;
  }, [vendors, styleSel, maxPrice, minRating, verified, onDate, zonesSel, servicesSel, selectOnly, sort, scores]);

  const pins: Pin[] = useMemo(
    () =>
      list.map((v) => {
        const [lat, lng] = pinFor(v);
        return { slug: v.slug, lat, lng, price: shortPrice(v) };
      }),
    [list],
  );
  const hasMap = pins.length > 0;
  const picked = selected ? list.find((v) => v.slug === selected) : undefined;

  const filtersOn = styleSel.length + (maxPrice !== null ? 1 : 0) + (minRating ? 1 : 0) + (verified ? 1 : 0) + (onDate ? 1 : 0) + zonesSel.length + servicesSel.length + (selectOnly ? 1 : 0);
  const reset = () => {
    setStyleSel([]);
    setMaxPrice(null);
    setMinRating(0);
    setVerified(false);
    setOnDate("");
    setZonesSel([]);
    setServicesSel([]);
    setSelectOnly(false);
  };

  const cat = category ? getCategory(category) : undefined;
  const noun = cat ? cat.plural.toLowerCase() : "prestataires";
  const sortLabel: Record<Sort, string> = { best: dna ? "Meilleur match" : "Recommandés", rating: "Mieux notés", price: "Prix croissant" };

  const cards = list.map((v) => <ResultCard key={v.slug} v={v} score={scores.get(v.slug)} select={mounted && isSelectPublic(v.slug)} showCategory={showCategory} active={hover === v.slug || selected === v.slug} onHover={setHover} />);
  // Sans Wedding DNA : une invitation à faire trier la liste, glissée dans la grille.
  if (!dna && list.length) cards.splice(Math.min(3, list.length), 0, <Invite key="invite" category={category} />);

  return (
    <div className={styles.results} data-map={hasMap || undefined} data-view={mapView ? "map" : "list"}>
      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <Dropdown label={onDate ? `Libres le ${formatDay(onDate)}` : "Date"} active={!!onDate} width={300}>
            {(close) => (
              <>
                <p className={styles.popTitle}>Disponibles à votre date</p>
                <input className={styles.dateInput} type="date" min={isoDate()} value={onDate} onChange={(e) => setOnDate(e.target.value)} aria-label="Date du mariage" />
                {dna?.date && dna.date !== onDate && (
                  <button type="button" className={styles.dnaLink} onClick={() => setOnDate(dna.date!)}>
                    Utiliser la date de mon mariage ({formatDay(dna.date)})
                  </button>
                )}
                <PopFoot onClear={() => setOnDate("")} canClear={!!onDate} onDone={close} count={list.length} />
              </>
            )}
          </Dropdown>

          <Dropdown label={styleSel.length ? `Style · ${styleSel.length}` : "Style"} active={styleSel.length > 0}>
            {(close) => (
              <>
                <p className={styles.popTitle}>Style</p>
                <div className={styles.options}>
                  {styleOptions.map(([s, n]) => {
                    const on = styleSel.includes(s);
                    return (
                      <button key={s} type="button" role="checkbox" aria-checked={on} className={styles.option} onClick={() => setStyleSel((p) => (on ? p.filter((x) => x !== s) : [...p, s]))}>
                        <span className={styles.box}>{on && <Check />}</span>
                        <span className={styles.optLabel}>{s}</span>
                        <span className={styles.optCount}>{n}</span>
                      </button>
                    );
                  })}
                </div>
                <PopFoot onClear={() => setStyleSel([])} canClear={styleSel.length > 0} onDone={close} count={list.length} />
              </>
            )}
          </Dropdown>

          {category && pMax > pMin && (
            <Dropdown label={maxPrice !== null ? `Jusqu'à ${maxPrice.toLocaleString("fr-FR")} €` : "Budget"} active={maxPrice !== null}>
              {(close) => (
                <>
                  <p className={styles.popTitle}>Prix d&apos;appel maximum</p>
                  <p className={styles.budgetValue}>
                    {(maxPrice ?? pMax).toLocaleString("fr-FR")} €{cat && (category === "traiteurs" ? " / invité" : category === "patisserie" ? " / part" : "")}
                  </p>
                  <input
                    className={styles.slider}
                    type="range"
                    min={pMin}
                    max={pMax}
                    step={Math.max(1, Math.round((pMax - pMin) / 40))}
                    value={maxPrice ?? pMax}
                    style={{ ["--p" as string]: `${(((maxPrice ?? pMax) - pMin) / (pMax - pMin)) * 100}%` }}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setMaxPrice(n >= pMax ? null : n);
                    }}
                    aria-label="Prix maximum"
                  />
                  <div className={styles.sliderEnds}>
                    <span>{pMin.toLocaleString("fr-FR")} €</span>
                    <span>{pMax.toLocaleString("fr-FR")} €</span>
                  </div>
                  <PopFoot onClear={() => setMaxPrice(null)} canClear={maxPrice !== null} onDone={close} count={list.length} />
                </>
              )}
            </Dropdown>
          )}

          <Dropdown label={minRating ? `${minRating.toLocaleString("fr-FR")} et plus` : "Note"} active={minRating > 0} width={260}>
            {(close) => (
              <>
                <p className={styles.popTitle}>Note des couples</p>
                <div className={styles.options}>
                  {[
                    [0, "Toutes les notes"],
                    [4.8, "4,8 et plus"],
                    [4.9, "4,9 et plus"],
                  ].map(([val, label]) => (
                    <button
                      key={label}
                      type="button"
                      role="radio"
                      aria-checked={minRating === val}
                      className={styles.option}
                      onClick={() => {
                        setMinRating(val as number);
                        close();
                      }}
                    >
                      <span className={styles.radio} />
                      <span className={styles.optLabel}>{label}</span>
                      {val ? <span className={styles.optStar}>★</span> : null}
                    </button>
                  ))}
                </div>
              </>
            )}
          </Dropdown>

          {zoneOptions.length > 1 && (
            <Dropdown label={zonesSel.length ? `Zone · ${zonesSel.length}` : "Zone"} active={zonesSel.length > 0}>
              {(close) => (
                <>
                  <p className={styles.popTitle}>Zone</p>
                  <div className={styles.options}>
                    {zoneOptions.map(([z, n]) => {
                      const on = zonesSel.includes(z);
                      return (
                        <button key={z} type="button" role="checkbox" aria-checked={on} className={styles.option} onClick={() => setZonesSel((p) => (on ? p.filter((x) => x !== z) : [...p, z]))}>
                          <span className={styles.box}>{on && <Check />}</span>
                          <span className={styles.optLabel}>{z}</span>
                          <span className={styles.optCount}>{n}</span>
                        </button>
                      );
                    })}
                  </div>
                  <PopFoot onClear={() => setZonesSel([])} canClear={zonesSel.length > 0} onDone={close} count={list.length} />
                </>
              )}
            </Dropdown>
          )}

          {category && serviceOptions.length > 0 && (
            <Dropdown label={servicesSel.length ? `Services · ${servicesSel.length}` : "Services"} active={servicesSel.length > 0} width={320}>
              {(close) => (
                <>
                  <p className={styles.popTitle}>Services inclus</p>
                  <div className={styles.options}>
                    {serviceOptions.map(([sv, n]) => {
                      const on = servicesSel.includes(sv);
                      return (
                        <button key={sv} type="button" role="checkbox" aria-checked={on} className={styles.option} onClick={() => setServicesSel((p) => (on ? p.filter((x) => x !== sv) : [...p, sv]))}>
                          <span className={styles.box}>{on && <Check />}</span>
                          <span className={styles.optLabel}>{sv}</span>
                          <span className={styles.optCount}>{n}</span>
                        </button>
                      );
                    })}
                  </div>
                  <PopFoot onClear={() => setServicesSel([])} canClear={servicesSel.length > 0} onDone={close} count={list.length} />
                </>
              )}
            </Dropdown>
          )}

          <button type="button" className={styles.pill} aria-pressed={verified} data-active={verified || undefined} onClick={() => setVerified((x) => !x)}>
            {verified && <Check />}
            Vérifiés
          </button>

          <button type="button" className={styles.pill} aria-pressed={selectOnly} data-active={selectOnly || undefined} onClick={() => setSelectOnly((x) => !x)}>
            {selectOnly && <Check />}
            Céleste Select
          </button>

          {filtersOn > 0 && (
            <button type="button" className={styles.clear} onClick={reset}>
              Tout effacer
            </button>
          )}
        </div>

        <Dropdown
          align="right"
          width={240}
          label={
            <>
              <span className={styles.sortKey}>Trier :</span> {sortLabel[sort]}
            </>
          }
        >
          {(close) => (
            <div className={styles.options}>
              {(Object.keys(sortLabel) as Sort[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={sort === s}
                  className={styles.option}
                  onClick={() => {
                    setSort(s);
                    close();
                  }}
                >
                  <span className={styles.optLabel}>{sortLabel[s]}</span>
                  {sort === s && (
                    <span className={styles.optCheck}>
                      <Check />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </Dropdown>
      </div>

      <div className={styles.split}>
        <div className={styles.listPane}>
          <p className={styles.count} aria-live="polite">
            {list.length} {list.length > 1 ? noun : noun.replace(/s(\b|$)/g, "$1").replace("lieux", "lieu")}
            {dna && sort === "best" && (
              <span className={styles.dnaNote}>
                {" "}
                · classés selon votre Wedding DNA{" "}
                <Link href="/matchs" className={styles.dnaLink}>
                  Modifier
                </Link>
              </span>
            )}
            <span className={styles.dnaNote}>
              {" · "}
              <WhyOrder mode={sort === "best" ? (scores.size ? "dna" : "reco") : sort} />
            </span>
          </p>

          {list.length ? (
            <div className={styles.grid}>{cards}</div>
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Aucun prestataire ne correspond à ces filtres</p>
              <p>Retirez un style ou élargissez le budget pour voir plus de profils.</p>
              <button type="button" className="btn btn-sm btn-outline" onClick={reset}>
                Effacer les filtres
              </button>
            </div>
          )}
        </div>

        {hasMap && (
          <div className={styles.mapPane}>
            <div className={styles.mapBox}>
              <ResultsMap pins={pins} active={hover} selected={selected} onSelect={setSelected} onHover={setHover} />
              {picked && <MapCard v={picked} onClose={() => setSelected(null)} />}
            </div>
          </div>
        )}
      </div>

      {hasMap && (
        <button type="button" className={styles.toggle} onClick={() => setMapView((m) => !m)}>
          {mapView ? "Afficher la liste" : "Afficher la carte"}
          {mapView ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
              <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4ZM9 4v13M15 6.5v13" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

function PopFoot({ onClear, canClear, onDone, count }: { onClear: () => void; canClear: boolean; onDone: () => void; count: number }) {
  return (
    <div className={styles.popFoot}>
      <button type="button" className={styles.clear} onClick={onClear} disabled={!canClear}>
        Effacer
      </button>
      <button type="button" className={styles.done} onClick={onDone}>
        Afficher {count} résultat{count > 1 ? "s" : ""}
      </button>
    </div>
  );
}

function ResultCard({ v, score, select, showCategory, active, onHover }: { v: Vendor; score?: number; select: boolean; showCategory: boolean; active: boolean; onHover: (s: string | null) => void }) {
  const cat = getCategory(v.category)!;
  const person = personFor(v);
  return (
    <article className={styles.card} data-active={active || undefined} onMouseEnter={() => onHover(v.slug)} onMouseLeave={() => onHover(null)}>
      <CardPhotos href={`/prestataire/${v.slug}`} photos={v.gallery} alt={`${v.name}, ${cat.singular} à ${v.city}`} pos={v.pos}>
        {score !== undefined ? (
          <span className={styles.match}>
            <i />
            {Math.round(score)} % match
          </span>
        ) : (
          v.verified && <span className={styles.badge}>Vérifié</span>
        )}
        <SaveButton slug={v.slug} name={v.name} className={styles.save} />
      </CardPhotos>
      <Link href={`/prestataire/${v.slug}`} className={styles.info}>
        <span className={styles.line}>
          <strong className={styles.name}>{v.name}</strong>
          <span className={styles.rating}>
            ★ {v.rating} <span>({v.reviewsCount})</span>
          </span>
        </span>
        <span className={styles.meta}>
          {showCategory ? `${cat.plural} · ` : ""}
          {v.area} · {v.style}
        </span>
        <span className={styles.meta}>
          Avec {person.firstName} · répond en {v.responseTime}
        </span>
        {select && (
          <span className={styles.selectTag}>
            <i aria-hidden="true">◆</i> Céleste Select
          </span>
        )}
        <span className={styles.price}>
          dès <strong>{priceLabel(v)}</strong>
        </span>
      </Link>
    </article>
  );
}

function MapCard({ v, onClose }: { v: Vendor; onClose: () => void }) {
  return (
    <div className={styles.mapCard}>
      <Link href={`/prestataire/${v.slug}`} className={styles.mapCardLink}>
        <span className={styles.mapCardPhoto}>
          <Image src={v.photo} alt="" fill sizes="120px" style={{ objectFit: "cover", objectPosition: v.pos ?? "50% 40%" }} />
        </span>
        <span className={styles.mapCardText}>
          <strong>{v.name}</strong>
          <span>
            ★ {v.rating} ({v.reviewsCount}) · {v.area}
          </span>
          <span>
            dès <b>{priceLabel(v)}</b>
          </span>
        </span>
      </Link>
      <button type="button" className={styles.mapCardClose} onClick={onClose} aria-label="Fermer">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}

export function Invite({ category }: { category?: string }) {
  const cat = category ? getCategory(category) : undefined;
  return (
    <aside className={styles.invite}>
      <span className={styles.inviteMark} aria-hidden>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
          <path d="M12 3l2.4 5.6L20 11l-5.6 2.4L12 19l-2.4-5.6L4 11l5.6-2.4L12 3Z" />
        </svg>
      </span>
      <p className={styles.inviteTitle}>Et si la liste se triait pour vous ?</p>
      <p className={styles.inviteText}>
        Quelques images, votre date, votre budget : en trois minutes, chaque {cat ? cat.singular : "prestataire"} reçoit un score de compatibilité, expliqué.
      </p>
      <Link href="/matchs" className={styles.inviteCta}>
        Trouver mon Best Match
      </Link>
    </aside>
  );
}
