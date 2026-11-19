"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { vendorAnswerSlot, type OfferStatus } from "@/lib/deal";
import { daysUntil, euros, formatDate, formatDay, formatTime, formatWeekday, isoDate } from "@/lib/format";
import { disputesFor, useDisputes } from "@/lib/disputes";
import { dayStatus, dealAppointments, dealDocuments, dealName, dealOffer, dealPayments, isBooking, PRO_SLUG, proIdentity, useDeals, type Pro, type ProDeal } from "@/lib/pro";
import { CALENDAR_MONTHS } from "@/lib/settings";
import type { Availability } from "@/lib/vendorDetail";
import { DisputeFollow, DisputeOpen } from "../../espace/Dispute";
import { DateBadge, StatusChip } from "../../espace/ui";
import { SlotProposer } from "../SlotProposer";
import styles from "../../espace/espace.module.css";
import p from "../pro.module.css";

const VIEWS = [
  { id: "offres", label: "Offres" },
  { id: "visites", label: "Visites" },
  { id: "reservations", label: "Réservations" },
  { id: "calendrier", label: "Calendrier" },
] as const;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Mon activité (CDC §16.1, §30.2) : pipeline des offres, visites, réservations, calendrier et capacité.
export function Activite() {
  const params = useSearchParams();
  const view = VIEWS.find((v) => v.id === params.get("vue"))?.id ?? "offres";
  const { deals, pro, apply, updatePro } = useDeals();
  if (!pro) return null;

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Mon activité</h1>
          <p className={styles.lead}>Vos offres, rendez-vous, réservations et disponibilités.</p>
        </div>
      </header>
      <nav className={styles.subnav} aria-label="Mon activité">
        {VIEWS.map((v) => (
          <Link key={v.id} href={`/espace-pro/activite?vue=${v.id}`} aria-current={v.id === view ? "page" : undefined} scroll={false}>
            {v.label}
          </Link>
        ))}
      </nav>
      {view === "offres" && <Pipeline deals={deals} />}
      {view === "visites" && <Visits deals={deals} apply={apply} />}
      {view === "reservations" && <Bookings deals={deals} pro={pro} />}
      {view === "calendrier" && <Calendar pro={pro} deals={deals} updatePro={updatePro} />}
    </>
  );
}

/* ---------- Pipeline des offres ---------- */

const COLUMNS: { title: string; match: (s: OfferStatus | undefined) => boolean }[] = [
  { title: "À chiffrer", match: (s) => !s },
  { title: "Envoyées", match: (s) => s === "envoyee" || s === "vue" || s === "revisee" },
  { title: "En discussion", match: (s) => s === "en-discussion" },
  { title: "Acceptées, à finaliser", match: (s) => s === "acceptee" },
  { title: "Réservations confirmées", match: (s) => s === "confirmee" },
  { title: "Sans suite", match: (s) => s === "refusee" || s === "expiree" || s === "retiree" },
];

function Pipeline({ deals }: { deals: ProDeal[] }) {
  return (
    <div className={p.board}>
      {COLUMNS.map((col) => {
        const list = deals.filter((d) => col.match(dealOffer(d)?.status));
        return (
          <section key={col.title} className={p.column} aria-label={col.title}>
            <h2 className={p.columnTitle}>
              {col.title} <span>{list.length}</span>
            </h2>
            {list.length ? (
              <ul className={p.cards}>
                {list.map((d) => {
                  const o = dealOffer(d);
                  return (
                    <li key={d.id}>
                      <Link href={`/espace-pro/messages?d=${d.id}`} className={p.card}>
                        <strong>{dealName(d)}</strong>
                        <span>{o ? `${o.offer.name} · v${o.offer.version}` : "Pas encore d'offre"}</span>
                        <span className={p.cardFoot}>
                          {o && <b>{euros(o.total)}</b>}
                          <span>{formatDay(d.w.date)}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={p.none}>Aucune</p>
            )}
          </section>
        );
      })}
    </div>
  );
}

/* ---------- Visites et rendez-vous (§12) ---------- */

type Apply = (id: string, fn: (w: ProDeal["w"]) => ProDeal["w"]) => void;

function Visits({ deals, apply }: { deals: ProDeal[]; apply: Apply }) {
  const [alt, setAlt] = useState<{ id: string; date: string; time: string } | null>(null);
  const now = isoDate();
  const all = deals.flatMap((d) => dealAppointments(d).map((a) => ({ a, d }))).sort((x, y) => x.a.date.localeCompare(y.a.date));
  const pending = all.filter((x) => x.a.status === "Demandée");
  const upcoming = all.filter((x) => x.a.status !== "Demandée" && x.a.date.slice(0, 10) >= now);

  const row = ({ a, d }: (typeof all)[number]) => (
    <li key={a.id} className={styles.row} style={{ alignItems: "start" }}>
      <DateBadge iso={a.date} />
      <div>
        <p className={styles.rowTitle}>
          {a.kind} · {dealName(d)}
        </p>
        <p className={styles.rowMeta}>
          {cap(formatWeekday(a.date))} à {formatTime(a.date)}
        </p>
        {a.status === "Demandée" &&
          (alt?.id === a.id ? (
            <SlotProposer
              defaultDate={a.date.slice(0, 10)}
              onPropose={(alts) => {
                apply(d.id, (w) => vendorAnswerSlot(w, a.id, alts));
                setAlt(null);
              }}
              onCancel={() => setAlt(null)}
            />
          ) : (
            <div className={p.rdvActions}>
              <button type="button" className="btn btn-sm" onClick={() => apply(d.id, (w) => vendorAnswerSlot(w, a.id))}>
                Accepter
              </button>
              <button type="button" className="btn btn-sm btn-outline" onClick={() => setAlt({ id: a.id, date: a.date.slice(0, 10), time: "18:00" })}>
                Proposer un autre créneau
              </button>
            </div>
          ))}
      </div>
      <StatusChip status={a.status} />
    </li>
  );

  return (
    <div className={styles.grid}>
      <section className={`${styles.card} ${styles.span12}`} aria-labelledby="pending-t">
        <div className={styles.cardHead}>
          <h2 id="pending-t" className={styles.sectionTitle}>
            Disponibilités à confirmer
          </h2>
          <span className={styles.small}>{pending.length}</span>
        </div>
        <p className={styles.rowMeta}>Votre validation évite les rendez-vous impossibles : acceptez, ou proposez tout de suite une alternative.</p>
        {pending.length ? <ul className={styles.list}>{pending.map(row)}</ul> : <p className={styles.rowMeta}>Aucune demande en attente.</p>}
      </section>
      <section className={`${styles.card} ${styles.span12}`} aria-labelledby="up-t">
        <div className={styles.cardHead}>
          <h2 id="up-t" className={styles.sectionTitle}>
            Rendez-vous à venir
          </h2>
        </div>
        {upcoming.length ? <ul className={styles.list}>{upcoming.map(row)}</ul> : <p className={styles.rowMeta}>Aucun rendez-vous à venir.</p>}
      </section>
    </div>
  );
}

/* ---------- Réservations ---------- */

function Bookings({ deals, pro }: { deals: ProDeal[]; pro: Pro }) {
  const today = isoDate();
  const { disputes } = useDisputes();
  const me = proIdentity(pro).name;
  const mine = deals.flatMap((d) => disputesFor(disputes, dealName(d), PRO_SLUG, d.w.email).map((x) => ({ x, d })));
  const list = deals.filter(isBooking).sort((a, b) => a.w.date.localeCompare(b.w.date));
  const groups = [
    { title: "À venir", items: list.filter((d) => d.w.date >= today) },
    { title: "Passées", items: list.filter((d) => d.w.date < today).reverse() },
  ];
  return (
    <div className={styles.grid}>
      {mine.length > 0 && (
        <section className={`${styles.card} ${styles.span12}`} aria-labelledby="disp-t">
          <div className={styles.cardHead}>
            <h2 id="disp-t" className={styles.sectionTitle}>
              Litiges
            </h2>
            <span className={styles.small}>{mine.length}</span>
          </div>
          <div className={p.disputes}>
            {mine.map(({ x, d }) => (
              <DisputeFollow key={x.id} d={x} side="prestataire" otherName={dealName(d)} />
            ))}
          </div>
        </section>
      )}
      {groups.map((g) => (
        <section key={g.title} className={`${styles.card} ${styles.span12}`} aria-label={`Réservations ${g.title.toLowerCase()}`}>
          <div className={styles.cardHead}>
            <h2 className={styles.sectionTitle}>{g.title}</h2>
            <span className={styles.small}>{g.items.length}</span>
          </div>
          {g.items.length ? (
            <ul className={styles.list}>
              {g.items.map((d) => {
                const o = dealOffer(d);
                const pays = dealPayments(d);
                const paid = pays.filter((x) => x.paid).reduce((s, x) => s + x.amount, 0);
                const contract = dealDocuments(d).find((x) => x.kind === "Contrat");
                const disputed = disputesFor(disputes, dealName(d), PRO_SLUG, d.w.email).some((x) => !x.decision);
                return (
                  <li key={d.id} className={styles.row}>
                    <DateBadge iso={d.w.date} />
                    <div>
                      <p className={styles.rowTitle}>
                        <Link href={`/espace-pro/messages?d=${d.id}`}>{dealName(d)}</Link>
                      </p>
                      <p className={styles.rowMeta}>
                        {o?.offer.name} · {euros(o?.total ?? 0)} · {euros(paid)} réglés
                        {contract?.status === "Signé" ? " · contrat signé" : ""}
                        {d.w.date >= today ? ` · J-${daysUntil(d.w.date)}` : ""}
                      </p>
                      {!disputed && (
                        <DisputeOpen
                          side="prestataire"
                          couple={dealName(d)}
                          coupleEmail={d.w.email}
                          vendorSlug={PRO_SLUG}
                          vendorName={me}
                          amount={o?.total ?? 0}
                          evidence={[`Offre « ${o?.offer.name ?? ""} », version ${o?.offer.version ?? 1} acceptée`, ...(contract?.status === "Signé" ? ["Contrat signé"] : []), "Échanges utiles de la conversation"]}
                        />
                      )}
                    </div>
                    <StatusChip status={d.w.date < today ? "Terminé" : "Réservation confirmée"} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.rowMeta}>Aucune.</p>
          )}
        </section>
      ))}
    </div>
  );
}

/* ---------- Calendrier et capacité (§17) ---------- */

const STATUSES: Availability[] = ["Disponible confirmé", "Probablement disponible", "À confirmer", "Capacité limitée", "Complet"];
const TONE: Record<Availability, string> = {
  "Disponible confirmé": p.dPos,
  "Probablement disponible": p.dActive,
  "À confirmer": p.dWait,
  "Capacité limitée": p.dWait,
  Complet: p.dNeg,
};
const monthFmt = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });
const WEEK = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];

function Calendar({ pro, deals, updatePro }: { pro: Pro; deals: ProDeal[]; updatePro: (fn: (p: Pro) => Pro) => void }) {
  const [offset, setOffset] = useState(0);
  const [day, setDay] = useState<string | null>(null);
  const today = new Date();
  const month = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const lead = (month.getDay() + 6) % 7;
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const iso = (n: number) => isoDate(new Date(month.getFullYear(), month.getMonth(), n));
  const selected = day ? dayStatus(pro, deals, day) : null;
  const events = deals.filter((d) => d.w.date.slice(0, 7) === isoDate(month).slice(0, 7) && (isBooking(d) || dealOffer(d)?.status === "acceptee"));

  return (
    <div className={styles.grid}>
      <section className={`${styles.card} ${styles.span8}`} aria-labelledby="cal-t">
        <div className={p.calHead}>
          <button type="button" className={styles.iconBtn} onClick={() => setOffset((o) => Math.max(0, o - 1))} disabled={offset === 0} aria-label="Mois précédent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <h2 id="cal-t" className={styles.sectionTitle}>
            {cap(monthFmt.format(month))}
          </h2>
          <button type="button" className={styles.iconBtn} onClick={() => setOffset((o) => Math.min(CALENDAR_MONTHS - 1, o + 1))} disabled={offset >= CALENDAR_MONTHS - 1} aria-label="Mois suivant">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className={p.calGrid} role="group" aria-labelledby="cal-t">
          {WEEK.map((w) => (
            <span key={w} className={p.calWeek} aria-hidden="true">
              {w}
            </span>
          ))}
          {Array.from({ length: lead }, (_, i) => (
            <span key={`e${i}`} />
          ))}
          {Array.from({ length: count }, (_, i) => {
            const d = iso(i + 1);
            const s = dayStatus(pro, deals, d);
            const past = d < isoDate(today);
            return (
              <button
                key={d}
                type="button"
                className={`${p.calDay} ${TONE[s.status]}`}
                aria-pressed={day === d}
                aria-label={`${formatWeekday(d)} : ${s.status}${s.booked ? `, ${s.booked} réservation${s.booked > 1 ? "s" : ""}` : ""}`}
                disabled={past}
                onClick={() => setDay(d)}
              >
                {i + 1}
                {s.source !== "defaut" && <i aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <ul className={p.legend} aria-label="Légende">
          {STATUSES.map((s) => (
            <li key={s}>
              <span className={`${p.legendDot} ${TONE[s]}`} aria-hidden="true" />
              {s}
            </li>
          ))}
        </ul>
        <p className={styles.small}>Un point signale une date renseignée par vous ou par une réservation. Horizon : {CALENDAR_MONTHS} mois glissants.</p>
      </section>

      <div className={`${styles.span4} ${p.calSide}`}>
        <section className={styles.card} aria-labelledby="day-t">
          <h2 id="day-t" className={styles.sectionTitle}>
            {day ? cap(formatWeekday(day)) : "Choisissez une date"}
          </h2>
          {day && selected ? (
            selected.source === "reservation" || selected.source === "offre" ? (
              <p className={styles.rowMeta}>
                {selected.source === "reservation" ? `${selected.booked} réservation${selected.booked > 1 ? "s" : ""} confirmée${selected.booked > 1 ? "s" : ""} pour ${pro.capacity} événement${pro.capacity > 1 ? "s" : ""} possible${pro.capacity > 1 ? "s" : ""} : ` : "Offre acceptée, en attente d'acompte : "}
                <StatusChip status={selected.status} />
              </p>
            ) : (
              <fieldset className={p.dayStatus}>
                <legend className="visually-hidden">Disponibilité du {formatDay(day)}</legend>
                {STATUSES.map((s) => (
                  <label key={s} className={p.dayOption}>
                    <input
                      type="radio"
                      name="day-status"
                      checked={selected.status === s}
                      onChange={() => updatePro((x) => ({ ...x, availability: { ...x.availability, [day]: s } }))}
                    />
                    <span className={`${p.legendDot} ${TONE[s]}`} aria-hidden="true" />
                    {s}
                  </label>
                ))}
              </fieldset>
            )
          ) : (
            <p className={styles.rowMeta}>Indiquez vos disponibilités : les couples et le Best Match s&apos;appuient dessus.</p>
          )}
        </section>

        <section className={styles.card} aria-labelledby="cap-t">
          <h2 id="cap-t" className={styles.sectionTitle}>
            Capacité
          </h2>
          <p className={styles.rowMeta}>Combien de mariages pouvez-vous couvrir le même jour ? 1 pour un indépendant, plusieurs avec plusieurs équipes.</p>
          <label className={p.capacity}>
            <input
              type="number"
              min={1}
              max={20}
              value={pro.capacity}
              onChange={(e) => updatePro((x) => ({ ...x, capacity: Math.min(20, Math.max(1, Math.round(Number(e.target.value) || 1))) }))}
            />
            <span>événement{pro.capacity > 1 ? "s" : ""} par jour</span>
          </label>
        </section>

        {events.length > 0 && (
          <section className={styles.card} aria-labelledby="ev-t">
            <h2 id="ev-t" className={styles.sectionTitle}>
              Ce mois-ci
            </h2>
            <ul className={styles.list}>
              {events.map((d) => (
                <li key={d.id} className={styles.row}>
                  <DateBadge iso={d.w.date} />
                  <div>
                    <p className={styles.rowTitle}>{dealName(d)}</p>
                    <p className={styles.rowMeta}>{formatDate(d.w.date)}</p>
                  </div>
                  <span />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

