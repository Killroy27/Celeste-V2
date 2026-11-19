"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { categories, vendors } from "@/lib/content";
import { formatDate, isoDate, parseDate, whenLabel } from "@/lib/format";
import { SearchIcon } from "./icons";
import styles from "./SearchForm.module.css";

type Props = {
  variant?: "hero" | "dialog";
  autoFocus?: boolean;
  id?: string;
};

type Panel = "what" | "where" | "when" | null;
type Option = { key: string; label: string; sub?: string; icon?: string; pin?: boolean; pick: () => void };

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const WEEK = ["L", "M", "M", "J", "V", "S", "D"];
const singular = (slug: string) => {
  const s = categories.find((c) => c.slug === slug)?.singular ?? "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// Lieux proposés : Île-de-France, Paris, puis les communes où interviennent des prestataires (avec leur nombre).
const PLACES = (() => {
  const count = new Map<string, number>();
  vendors.forEach((v) => {
    const place = v.area.startsWith("Paris") ? "Paris" : v.area;
    count.set(place, (count.get(place) ?? 0) + 1);
  });
  const others = [...count.entries()].filter(([p]) => p !== "Paris").sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"));
  return [{ label: "Toute l'Île-de-France", n: vendors.length }, { label: "Paris", n: count.get("Paris") ?? 0 }, ...others.map(([label, n]) => ({ label, n }))];
})();

// Une seule barre de recherche, réutilisée dans le hero et dans la recherche ouverte depuis l'en-tête.
// Chaque partie déroule son panneau (benchmark Fresha / Airbnb) : métiers et prestataires, lieux, date.
export function SearchForm({ variant = "hero", autoFocus, id }: Props) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const whatInput = useRef<HTMLInputElement>(null);
  const whereInput = useRef<HTMLInputElement>(null);
  const whenButton = useRef<HTMLButtonElement>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");
  const [when, setWhen] = useState("");
  const [whatTab, setWhatTab] = useState<"tous" | "metiers" | "prestataires">("tous");
  const [whenTab, setWhenTab] = useState<"date" | "mois" | "flexible">("date");
  const [active, setActive] = useState(-1);

  // Clic en dehors de la barre ou Échap : le panneau se ferme.
  useEffect(() => {
    if (!panel) return;
    const onDown = (e: MouseEvent) => !form.current?.contains(e.target as Node) && setPanel(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [panel]);

  useEffect(() => setActive(-1), [panel, what, where, whatTab]);

  // Recherche ouverte depuis l'en-tête : le champ Prestataire a déjà le curseur, son panneau s'ouvre avec lui.
  useEffect(() => {
    if (autoFocus) setPanel("what");
  }, [autoFocus]);

  const open = (p: Panel) => setPanel(p);
  const toWhere = () => {
    setPanel("where");
    whereInput.current?.focus();
  };
  const toWhen = () => {
    setPanel("when");
    whenButton.current?.focus();
  };

  const whatOptions = useMemo<Option[]>(() => {
    const q = norm(what);
    const cats = categories
      .filter((c) => !q || norm(`${c.plural} ${c.singular} ${c.label}`).includes(q))
      .map((c) => ({ key: `c-${c.slug}`, label: c.plural, icon: c.icon, pick: () => {
        setWhat(c.plural);
        toWhere();
      },
    }));
    const pros = q
      ? vendors
          .filter((v) => norm(`${v.name} ${v.style}`).includes(q))
          .slice(0, 8)
          .map((v) => ({ key: `v-${v.slug}`, label: v.name, sub: `${singular(v.category)} · ${v.area}`, icon: v.photo, pick: () => router.push(`/prestataire/${v.slug}`) }))
      : vendors
          .filter((v) => v.verified)
          .sort((a, b) => Number(b.rating.replace(",", ".")) - Number(a.rating.replace(",", ".")) || b.reviewsCount - a.reviewsCount)
          .slice(0, 8)
          .map((v) => ({ key: `v-${v.slug}`, label: v.name, sub: `${singular(v.category)} · ★ ${v.rating}`, icon: v.photo, pick: () => router.push(`/prestataire/${v.slug}`) }));
    if (whatTab === "metiers") return cats;
    if (whatTab === "prestataires") return pros;
    return q ? [...cats, ...pros] : cats;
    // toWhere ne dépend que de refs et d'un setter stables.
  }, [what, whatTab, router]);

  const whereOptions = useMemo<Option[]>(() => {
    const q = norm(where);
    return PLACES.filter((p) => !q || norm(p.label).includes(q)).map((p) => ({
      key: p.label,
      label: p.label,
      sub: `${p.n} prestataire${p.n > 1 ? "s" : ""}`,
      pin: true,
      pick: () => {
        setWhere(p.label);
        toWhen();
      },
    }));
  }, [where]);

  const list = panel === "what" ? whatOptions : panel === "where" ? whereOptions : [];

  // Clavier : flèches pour parcourir la liste, Entrée pour choisir (sinon Entrée lance la recherche).
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!list.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % list.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? list.length - 1 : a - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      list[active].pick();
    }
  };

  const options = (items: Option[], listId: string, empty: string) => (
    <ul id={listId} role="listbox" className={styles.options}>
      {items.length === 0 && <li className={styles.none}>{empty}</li>}
      {items.map((o, i) => (
        <li key={o.key} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
          <button type="button" className={styles.option} data-active={i === active} onMouseDown={(e) => e.preventDefault()} onClick={o.pick} tabIndex={-1}>
            <span className={`${styles.optIcon} ${o.icon?.startsWith("/photos/") ? styles.optPhoto : ""}`}>
              {o.pin ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11zm0-8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                </svg>
              ) : (
                o.icon && <Image src={o.icon} alt="" width={o.icon.startsWith("/photos/") ? 40 : 24} height={o.icon.startsWith("/photos/") ? 40 : 24} style={o.icon.startsWith("/photos/") ? { objectFit: "cover" } : undefined} />
              )}
            </span>
            <span className={styles.optText}>
              <span>{o.label}</span>
              {o.sub && <small>{o.sub}</small>}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );

  const listId = (p: string) => `${id ?? variant}-${p}-list`;

  return (
    <form
      ref={form}
      id={id}
      action="/recherche"
      method="get"
      role="search"
      className={`${styles.form} ${styles[variant]}`}
      data-open={panel ?? undefined}
      onSubmit={() => setPanel(null)}
    >
      {/* Prestataire : métiers et prestataires */}
      <div className={`${styles.seg} ${styles.what}`} data-on={panel === "what"} onClick={() => whatInput.current?.focus()}>
        <label className={styles.label} htmlFor={`${listId("what")}-input`}>
          Prestataire
        </label>
        <input
          ref={whatInput}
          id={`${listId("what")}-input`}
          name="quoi"
          placeholder="Photographe, DJ, traiteur…"
          autoComplete="off"
          autoFocus={autoFocus}
          value={what}
          role="combobox"
          aria-expanded={panel === "what"}
          aria-controls={listId("what")}
          aria-activedescendant={panel === "what" && active >= 0 ? `${listId("what")}-${active}` : undefined}
          onFocus={() => open("what")}
          onClick={() => open("what")}
          onChange={(e) => {
            setWhat(e.target.value);
            open("what");
          }}
          onKeyDown={onKeyDown}
        />
        {panel === "what" && (
          <div className={`${styles.pop} ${styles.popWhat}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.tabs} role="tablist" aria-label="Type de résultat">
              {(
                [
                  ["tous", "Tous"],
                  ["metiers", "Métiers"],
                  ["prestataires", "Prestataires"],
                ] as const
              ).map(([k, l]) => (
                <button key={k} type="button" role="tab" aria-selected={whatTab === k} onMouseDown={(e) => e.preventDefault()} onClick={() => setWhatTab(k)}>
                  {l}
                </button>
              ))}
            </div>
            {!what && whatTab === "prestataires" && <p className={styles.popHint}>Les mieux notés, vérifiés par Céleste</p>}
            {options(whatOptions, listId("what"), `Aucun métier ni prestataire pour « ${what} ». Lancez la recherche pour tout parcourir.`)}
          </div>
        )}
      </div>

      <span className={styles.sep} aria-hidden="true" />

      {/* Lieu */}
      <div className={styles.seg} data-on={panel === "where"} onClick={() => whereInput.current?.focus()}>
        <label className={styles.label} htmlFor={`${listId("where")}-input`}>
          Lieu
        </label>
        <input
          ref={whereInput}
          id={`${listId("where")}-input`}
          name="ou"
          placeholder="Ville ou région"
          autoComplete="off"
          value={where}
          role="combobox"
          aria-expanded={panel === "where"}
          aria-controls={listId("where")}
          aria-activedescendant={panel === "where" && active >= 0 ? `${listId("where")}-${active}` : undefined}
          onFocus={() => open("where")}
          onClick={() => open("where")}
          onChange={(e) => {
            setWhere(e.target.value);
            open("where");
          }}
          onKeyDown={onKeyDown}
        />
        {panel === "where" && (
          <div className={`${styles.pop} ${styles.popWhere}`} onClick={(e) => e.stopPropagation()}>
            <p className={styles.popTitle}>Où se marie-t-on ?</p>
            {options(whereOptions, listId("where"), "Aucun prestataire dans cette zone pour l'instant. Essayez « Toute l'Île-de-France ».")}
          </div>
        )}
      </div>

      <span className={styles.sep} aria-hidden="true" />

      {/* Date */}
      <div className={`${styles.seg} ${styles.last}`} data-on={panel === "when"}>
        <div className={styles.dateField}>
          <span className={styles.label} id={`${listId("when")}-label`}>
            Date
          </span>
          <button
            ref={whenButton}
            type="button"
            className={styles.whenBtn}
            data-empty={!when}
            aria-labelledby={`${listId("when")}-label ${listId("when")}-value`}
            aria-expanded={panel === "when"}
            onClick={() => open(panel === "when" ? null : "when")}
          >
            <span id={`${listId("when")}-value`}>{when ? whenLabel(when) : "Jour J"}</span>
          </button>
          <input type="hidden" name="quand" value={when} />
        </div>
        {panel === "when" && <WhenPanel value={when} tab={whenTab} setTab={setWhenTab} onPick={(v) => {
              setWhen(v);
              setPanel(null);
            }} />}
        <button type="submit" className={styles.submit}>
          <SearchIcon size={20} />
          <span className={styles.submitText}>Rechercher</span>
        </button>
      </div>
    </form>
  );
}

/* ---------- Panneau de date : jour précis, mois, ou pas encore fixée ---------- */

function WhenPanel({ value, tab, setTab, onPick }: { value: string; tab: "date" | "mois" | "flexible"; setTab: (t: "date" | "mois" | "flexible") => void; onPick: (v: string) => void }) {
  const today = isoDate();
  const start = /^\d{4}-\d{2}/.test(value) ? value.slice(0, 7) : today.slice(0, 7);
  const [month, setMonth] = useState(start); // AAAA-MM affiché dans le calendrier
  const first = parseDate(`${month}-01`);
  const offset = (first.getDay() + 6) % 7; // lundi en premier
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const shift = (d: number) => {
    const m = new Date(first.getFullYear(), first.getMonth() + d, 1);
    setMonth(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`);
  };
  const months = Array.from({ length: 24 }, (_, i) => {
    const m = new Date(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1 + i, 1);
    return `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
  });

  return (
    <div className={`${styles.pop} ${styles.popWhen}`} onClick={(e) => e.stopPropagation()}>
      <div className={styles.tabs} role="tablist" aria-label="Type de date">
        {(
          [
            ["date", "Date précise"],
            ["mois", "Mois"],
            ["flexible", "Pas encore fixée"],
          ] as const
        ).map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>

      {tab === "date" && (
        <div className={styles.cal}>
          <div className={styles.calHead}>
            <button type="button" onClick={() => shift(-1)} disabled={month <= today.slice(0, 7)} aria-label="Mois précédent">
              ‹
            </button>
            <strong>
              {MONTHS[first.getMonth()]} {first.getFullYear()}
            </strong>
            <button type="button" onClick={() => shift(1)} disabled={month >= months[months.length - 1]} aria-label="Mois suivant">
              ›
            </button>
          </div>
          <div className={styles.calGrid} role="grid" aria-label={`${MONTHS[first.getMonth()]} ${first.getFullYear()}`}>
            {WEEK.map((d, i) => (
              <span key={i} className={styles.calWeek} aria-hidden="true">
                {d}
              </span>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <span key={`e${i}`} />
            ))}
            {Array.from({ length: days }, (_, i) => {
              const iso = `${month}-${String(i + 1).padStart(2, "0")}`;
              return (
                <button key={iso} type="button" className={styles.calDay} aria-pressed={value === iso} disabled={iso <= today} onClick={() => onPick(iso)} aria-label={formatDate(iso)}>
                  {i + 1}
                </button>
              );
            })}
          </div>
          <p className={styles.popHint}>Les résultats ne montreront que les prestataires encore libres ce jour-là.</p>
        </div>
      )}

      {tab === "mois" && (
        <div className={styles.monthGrid}>
          {months.map((m) => (
            <button key={m} type="button" aria-pressed={value === m} onClick={() => onPick(m)}>
              <span>{MONTHS[Number(m.slice(5)) - 1]}</span>
              <small>{m.slice(0, 4)}</small>
            </button>
          ))}
        </div>
      )}

      {tab === "flexible" && (
        <div className={styles.flexible}>
          <p>Pas de souci : comparez d&apos;abord, la date viendra ensuite. Vous pourrez filtrer par disponibilité à tout moment.</p>
          <button type="button" className="btn btn-sm" onClick={() => onPick("")}>
            Voir tous les prestataires
          </button>
        </div>
      )}
      {value && tab !== "flexible" && (
        <button type="button" className={styles.clear} onClick={() => onPick("")}>
          Effacer la date
        </button>
      )}
    </div>
  );
}
