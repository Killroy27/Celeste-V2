"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { isSelect, useAdmin, vendorState, type Admin, type DocStatus, type VendorState } from "@/lib/admin";
import { getCategory, vendors } from "@/lib/content";
import { useDisputes, type Dispute } from "@/lib/disputes";
import { formatDay, formatTime } from "@/lib/format";
import { StatusChip } from "../../espace/ui";
import styles from "../../espace/espace.module.css";
import { Guard, useAsk } from "../AdminShell";
import a from "../admin.module.css";

const FILTERS: { id: string; label: string; match: (x: Admin, slug: string, d: Dispute[]) => boolean }[] = [
  { id: "tous", label: "Tous", match: () => true },
  { id: "verifier", label: "À vérifier", match: (x, s) => vendorState(x, s) === "À vérifier" },
  { id: "incomplets", label: "Incomplets", match: (x, s) => vendorState(x, s) === "Incomplet" },
  { id: "verifies", label: "Vérifiés", match: (x, s) => vendorState(x, s) === "Vérifié" },
  { id: "select", label: "Select", match: (x, s, d) => isSelect(x, s, d) },
  { id: "suspendus", label: "Suspendus", match: (x, s) => vendorState(x, s) === "Suspendu" },
];

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);
const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

// Prestataires et dossier prestataire (CDC §18, §20.1, §22, §30.3).
export function AdminVendors() {
  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Prestataires</h1>
          <p className={styles.lead}>Vérification, statuts de confiance, signalements.</p>
        </div>
      </header>
      <Guard section="prestataires">
        <VendorsInner />
      </Guard>
    </>
  );
}

function VendorsInner() {
  const { admin } = useAdmin();
  const { disputes } = useDisputes();
  const params = useSearchParams();
  const [filter, setFilter] = useState("tous");
  const [q, setQ] = useState("");
  if (!admin) return null;
  const f = FILTERS.find((x) => x.id === filter)!;
  const list = vendors.filter((v) => f.match(admin, v.slug, disputes) && (!q || fold(`${v.name} ${v.city} ${getCategory(v.category)?.singular ?? ""}`).includes(fold(q))));
  const selected = params.get("p") ?? list[0]?.slug;

  return (
    <div className={a.split}>
      <section className={styles.card} aria-label="Liste des prestataires">
        <div className={a.toolbar}>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, ville, métier" aria-label="Rechercher un prestataire" />
          <div className={a.chips} role="group" aria-label="Filtrer">
            {FILTERS.map((x) => (
              <button key={x.id} type="button" aria-pressed={filter === x.id} onClick={() => setFilter(x.id)}>
                {x.label} <span>{vendors.filter((v) => x.match(admin, v.slug, disputes)).length}</span>
              </button>
            ))}
          </div>
        </div>
        <ul className={a.table}>
          {list.map((v) => {
            const st = vendorState(admin, v.slug);
            const signals = admin.signals.filter((s) => s.vendorSlug === v.slug && !s.warned).length;
            return (
              <li key={v.slug}>
                <Link href={`/admin/prestataires?p=${v.slug}`} className={a.tableRow} aria-current={v.slug === selected ? "true" : undefined} scroll={false}>
                  <span className={a.vendorCell}>
                    <strong>{v.name}</strong>
                    <small>
                      {cap(getCategory(v.category)?.singular)} · {v.city}
                    </small>
                  </span>
                  <span className={a.cellEnd}>
                    {signals > 0 && <span className={a.flag}>{signals} signal{signals > 1 ? "s" : ""}</span>}
                    {isSelect(admin, v.slug, disputes) && <span className={a.select}>
                      <i aria-hidden="true">◆</i> Select
                    </span>}
                    <StatusChip status={st} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        {!list.length && <p className={styles.rowMeta}>Aucun prestataire ne correspond.</p>}
      </section>
      {selected && <Dossier admin={admin} slug={selected} disputes={disputes} />}
    </div>
  );
}

const DOC_TONE: Record<DocStatus, string> = { Validé: "Validé", "À vérifier": "En attente", Refusé: "Refusée", Manquant: "À fournir" };

function Dossier({ admin, slug, disputes }: { admin: Admin; slug: string; disputes: Dispute[] }) {
  const ask = useAsk();
  const v = vendors.find((x) => x.slug === slug);
  const c = admin.cases[slug];
  if (!v || !c) return null;
  const st: VendorState = vendorState(admin, slug);
  const select = isSelect(admin, slug, disputes);
  const signals = admin.signals.filter((s) => s.vendorSlug === slug);
  const setDoc = (id: string, status: DocStatus) => (x: Admin) => ({ ...x, cases: { ...x.cases, [slug]: { ...x.cases[slug], docs: x.cases[slug].docs.map((d) => (d.id === id ? { ...d, status } : d)) } } });
  const setCase = (patch: Partial<typeof c>) => (x: Admin) => ({ ...x, cases: { ...x.cases, [slug]: { ...x.cases[slug], ...patch } } });

  return (
    <article className={`${styles.card} ${a.dossier}`} aria-labelledby="dossier-t">
      <div className={a.dossierHead}>
        <span className={a.thumb}>
          <Image src={v.photo} alt="" fill sizes="64px" style={{ objectFit: "cover", objectPosition: v.pos }} />
        </span>
        <div>
          <p className={styles.eyebrow}>Dossier prestataire</p>
          <h2 id="dossier-t" className={styles.sectionTitle}>
            {v.name}
          </h2>
          <p className={styles.rowMeta}>
            {cap(getCategory(v.category)?.singular)} · {v.area} · ★ {v.rating} ({v.reviewsCount} avis) · répond en {v.responseTime}
          </p>
        </div>
        <div className={a.dossierBadges}>
          <StatusChip status={st} />
          {select && <span className={a.select}>
                      <i aria-hidden="true">◆</i> Select
                    </span>}
        </div>
      </div>

      <section className={a.block} aria-labelledby="docs-t">
        <h3 id="docs-t" className={a.blockTitle}>
          Vérification (§18.1)
        </h3>
        {c.submittedAt && st === "À vérifier" && (
          <p className={styles.rowMeta}>
            Dossier déposé le {formatDay(c.submittedAt)}. Vérifié confirme l&apos;existence et l&apos;identité professionnelles, pas la qualité de la prestation.
          </p>
        )}
        <ul className={a.docs}>
          {c.docs.map((d) => (
            <li key={d.id}>
              <span>{d.label}</span>
              <StatusChip status={DOC_TONE[d.status]} />
              {d.status === "À vérifier" && (
                <span className={a.docActions}>
                  <button type="button" className="btn btn-sm" onClick={() => ask({ action: "Document validé", target: `${v.name} · ${d.label}`, confirm: "Valider" }, setDoc(d.id, "Validé"))}>
                    Valider
                  </button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => ask({ action: "Document refusé", target: `${v.name} · ${d.label}`, confirm: "Refuser", hint: "Le prestataire recevra le motif et pourra déposer un nouveau document." }, setDoc(d.id, "Refusé"))}>
                    Refuser
                  </button>
                </span>
              )}
              {(d.status === "Manquant" || d.status === "Refusé") && <span className={a.docActions}><small className={styles.small}>En attente du prestataire</small></span>}
            </li>
          ))}
        </ul>
      </section>

      <section className={a.block} aria-labelledby="sel-t">
        <h3 id="sel-t" className={a.blockTitle}>
          Céleste Select (§18.2)
        </h3>
        <p className={styles.rowMeta}>
          {c.selectRevoked
            ? "Select retiré manuellement. Le badge reste retiré jusqu'à rétablissement motivé."
            : select
              ? "Critères de performance remplis : le badge est attribué automatiquement. Il ne s'achète pas."
              : "Critères non remplis pour l'instant : attribution automatique dès qu'ils le seront."}
        </p>
        {c.selectRevoked ? (
          <button type="button" className="btn btn-sm btn-outline" onClick={() => ask({ action: "Select rétabli", target: v.name, confirm: "Rétablir" }, setCase({ selectRevoked: false }))}>
            Rétablir Select
          </button>
        ) : (
          select && (
            <button type="button" className="btn btn-sm btn-outline" onClick={() => ask({ action: "Select retiré", target: v.name, confirm: "Retirer le badge", danger: true, hint: "Réservé aux cas motivés : litige grave, fraude, manquement répété." }, setCase({ selectRevoked: true }))}>
              Retirer Select
            </button>
          )
        )}
      </section>

      <section className={a.block} aria-labelledby="sig-t">
        <h3 id="sig-t" className={a.blockTitle}>
          Signaux anti-contournement (§22)
        </h3>
        <p className={styles.rowMeta}>Détection automatique : seul le type de motif est visible, jamais le contenu des messages.</p>
        {signals.length ? (
          <ul className={a.docs}>
            {signals.map((s) => (
              <li key={s.id}>
                <span>
                  {s.kind}
                  <small className={styles.small}>
                    {" "}
                    · {formatDay(s.at)} à {formatTime(s.at)}
                  </small>
                </span>
                <StatusChip status={s.warned ? "Averti" : "Nouveau signal"} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.rowMeta}>Aucun signal.</p>
        )}
        {signals.some((s) => !s.warned) && (
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() =>
              ask(
                { action: "Avertissement envoyé", target: v.name, confirm: "Envoyer l'avertissement", hint: "Réaction graduée : avertissement d'abord ; la répétition réduit les opportunités, puis peut mener à la perte de statut ou à la suspension." },
                (x) => ({ ...x, signals: x.signals.map((s) => (s.vendorSlug === slug ? { ...s, warned: true } : s)) }),
              )
            }
          >
            Envoyer un avertissement
          </button>
        )}
      </section>

      <div className={a.dossierFoot}>
        <Link href={`/prestataire/${slug}`} className={styles.more}>
          Voir la fiche publique
        </Link>
        {c.suspended ? (
          <button type="button" className="btn btn-sm" onClick={() => ask({ action: "Compte réactivé", target: v.name, confirm: "Réactiver" }, setCase({ suspended: false }))}>
            Réactiver le compte
          </button>
        ) : (
          <button type="button" className={`btn btn-sm ${a.danger}`} onClick={() => ask({ action: "Compte suspendu", target: v.name, confirm: "Suspendre", danger: true, hint: "La fiche disparaît de la marketplace ; les réservations en cours restent suivies par le support." }, setCase({ suspended: true }))}>
            Suspendre
          </button>
        )}
      </div>
    </article>
  );
}
