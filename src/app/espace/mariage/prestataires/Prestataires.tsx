"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getCategory, getVendor } from "@/lib/content";
import { coupleNames, isOpen, OFFER_LABEL, offerOf } from "@/lib/deal";
import { disputesFor, useDisputes } from "@/lib/disputes";
import { categoryLabel, categorySingular, euros, formatDay, formatTime, VENDOR_STATUSES, vendorName, useWedding, type ProjectVendor, type Wedding } from "@/lib/wedding";
import { DisputeFollow, DisputeOpen } from "../../Dispute";
import { StatusChip } from "../../ui";
import styles from "../../espace.module.css";
import s from "./prestataires.module.css";
import { ChangeBlock } from "./ChangeBlock";
import { ReviewBlock } from "./ReviewBlock";

// Mes prestataires (CDC §5.4) : classés par statut ; un clic ouvre une seule vue synthétique,
// pas un espace projet complet par prestataire.
export function Prestataires() {
  const { wedding: w } = useWedding();
  const [open, setOpen] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  if (!w) return null;
  const idOf = (pv: ProjectVendor) => pv.vendorSlug ?? pv.category;
  const current = w.vendors.find((v) => idOf(v) === open);

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Mes prestataires</h1>
          <p className={styles.lead}>Où en est chaque métier, d&apos;un coup d&apos;œil.</p>
        </div>
      </header>

      <div className={s.board}>
        {VENDOR_STATUSES.map((st) => {
          const list = w.vendors.filter((v) => v.status === st.value);
          return (
            <section key={st.value} className={s.column} aria-labelledby={`col-${st.value}`}>
              <h2 id={`col-${st.value}`} className={s.columnTitle}>
                {st.label} <span>{list.length}</span>
              </h2>
              {list.length ? (
                <ul className={s.cards}>
                  {list.map((pv) => {
                    const vendor = pv.vendorSlug ? getVendor(pv.vendorSlug) : undefined;
                    const offer = offerOf(w, pv.vendorSlug);
                    return (
                      <li key={idOf(pv)}>
                        <button type="button" className={s.card} onClick={() => setOpen(idOf(pv))}>
                          <span className={s.thumb}>
                            <Image src={vendor?.photo ?? getCategory(pv.category)?.cover ?? "/photos/hero.jpg"} alt="" fill sizes="56px" style={{ objectFit: "cover" }} />
                          </span>
                          <span className={s.cardText}>
                            <span className={s.cat}>{categoryLabel(pv.category)}</span>
                            <strong>{vendor?.name ?? `Trouver votre ${categorySingular(pv.category)}`}</strong>
                            {offer && <span className={s.cat}>{euros(offer.total)}</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className={s.none}>Aucun</p>
              )}
            </section>
          );
        })}
      </div>

      <dialog
        ref={dialog}
        className={s.drawer}
        onClose={() => setOpen(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(null);
        }}
        aria-labelledby="drawer-t"
      >
        {current && <Detail w={w} pv={current} onClose={() => setOpen(null)} />}
      </dialog>
    </>
  );

}

function Detail({ w, pv, onClose }: { w: Wedding; pv: ProjectVendor; onClose: () => void }) {
  const slug = pv.vendorSlug;
  const offer = offerOf(w, slug);
  const thread = `/espace/messages?c=${slug}`;
  const statusLabel = VENDOR_STATUSES.find((x) => x.value === pv.status)?.label ?? "";
  const rdv = w.appointments.filter((a) => a.vendorSlug === slug);
  const docs = w.documents.filter((d) => d.vendorSlug === slug);
  const pays = w.payments.filter((p) => p.vendorSlug === slug);
  return (
    <div className={s.detail}>
      <div className={s.detailHead}>
        <div>
          <p className={styles.eyebrow}>{categoryLabel(pv.category)}</p>
          <h2 id="drawer-t" className={styles.sectionTitle}>
            {slug ? vendorName(slug) : `Trouver votre ${categorySingular(pv.category)}`}
          </h2>
          <div style={{ marginTop: 8 }}>
            <StatusChip status={statusLabel} />
          </div>
        </div>
        <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Fermer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {!slug ? (
        <div className={styles.empty}>
          <p>Céleste connaît déjà votre date, votre budget et votre style : une ou deux questions suffisent pour voir les profils qui vous correspondent.</p>
          <Link href="/matchs" className="btn btn-signature btn-sm">
            ✦ Trouver avec le Best Match
          </Link>
          <Link href={`/prestataires/${pv.category}`} className={styles.more}>
            Parcourir les {categoryLabel(pv.category).toLowerCase()}
          </Link>
        </div>
      ) : (
        <>
          <Block title="Offre">
            {offer ? (
              <div className={s.offer}>
                <div>
                  <p className={styles.rowTitle}>{offer.offer.name}</p>
                  <p className={styles.rowMeta}>Version {offer.offer.version} · toutes les versions restent consultables dans la conversation</p>
                  <div style={{ marginTop: 8 }}>
                    <StatusChip status={OFFER_LABEL[offer.status]} />
                  </div>
                </div>
                <strong className={s.amount}>{euros(offer.total)}</strong>
              </div>
            ) : (
              <p className={styles.rowMeta}>Pas encore d&apos;offre. Décrivez votre besoin dans la conversation : {vendorName(slug)} vous enverra une proposition détaillée.</p>
            )}
            {offer?.status === "acceptee" && slug && (
              <div className={s.offerActions}>
                <Link href={`/espace/reservation/${slug}`} className="btn btn-sm">
                  Finaliser la réservation
                </Link>
              </div>
            )}
            {pv.status === "offre" && offer && isOpen(offer.status) && (
              <div className={s.offerActions}>
                <Link href={`${thread}&offre=1`} className="btn btn-sm">
                  Voir et répondre
                </Link>
                <Link href={`${thread}&adapter=1`} className="btn btn-sm btn-outline">
                  Demander une adaptation
                </Link>
              </div>
            )}
          </Block>

          <Block title="Rendez-vous">
            {rdv.length ? (
              <ul className={styles.list}>
                {rdv.map((a) => (
                  <li key={a.id} className={s.item}>
                    <span>
                      {a.kind} · {formatDay(a.date)} à {formatTime(a.date)}
                    </span>
                    <StatusChip status={a.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.rowMeta}>Aucun rendez-vous prévu.</p>
            )}
          </Block>

          <Block title="Paiements">
            {pays.length ? (
              <ul className={styles.list}>
                {pays.map((p) => (
                  <li key={p.id} className={s.item}>
                    <span>
                      {p.label} · {euros(p.amount)} · {p.paid ? "réglé" : `avant le ${formatDay(p.due)}`}
                    </span>
                    <StatusChip status={p.paid ? "Payé" : "Paiement à venir"} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.rowMeta}>L&apos;échéancier apparaîtra quand vous aurez accepté une offre.</p>
            )}
          </Block>

          <Block title="Documents">
            {docs.length ? (
              <ul className={styles.list}>
                {docs.map((d) => (
                  <li key={d.id} className={s.item}>
                    <span>
                      {d.kind} · {d.label}
                    </span>
                    <StatusChip status={d.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.rowMeta}>Aucun document pour l&apos;instant.</p>
            )}
          </Block>

          <ReviewBlock w={w} slug={slug} />
          {pv.status === "reserve" && <ChangeBlock w={w} slug={slug} />}
          <DisputeBlock w={w} slug={slug} status={pv.status} />

          <div className={s.footer}>
            <Link href={thread} className="btn btn-sm btn-outline">
              Ouvrir la conversation
            </Link>
            <Link href={`/prestataire/${slug}`} className={styles.more}>
              Voir la fiche
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={s.block}>
      <h3 className={s.blockTitle}>{title}</h3>
      {children}
    </section>
  );
}

// Médiation (§23) : un problème avec un prestataire réservé s'ouvre et se suit ici, au même endroit que le reste.
function DisputeBlock({ w, slug, status }: { w: Wedding; slug: string; status: ProjectVendor["status"] }) {
  const { disputes } = useDisputes();
  const couple = coupleNames(w);
  const mine = disputesFor(disputes, couple, slug, w.email);
  const booked = status === "reserve" || status === "termine";
  if (!booked && !mine.length) return null;
  const offer = offerOf(w, slug);
  const contract = w.documents.find((d) => d.vendorSlug === slug && d.kind === "Contrat" && d.status === "Signé");
  const evidence = [
    ...(offer ? [`Offre « ${offer.offer.name} », version ${offer.offer.version} acceptée`] : []),
    ...(contract ? ["Contrat signé"] : []),
    "Échanges utiles de la conversation",
  ];
  const open = mine.some((d) => !d.decision);
  return (
    <Block title="Un problème ?">
      <div className={s.disputes}>
        {mine.map((d) => (
          <DisputeFollow key={d.id} d={d} side="couple" otherName={vendorName(slug)} />
        ))}
        {!open && <DisputeOpen side="couple" couple={couple} coupleEmail={w.email} vendorSlug={slug} vendorName={vendorName(slug)} amount={offer?.total ?? 0} evidence={evidence} />}
      </div>
    </Block>
  );
}
