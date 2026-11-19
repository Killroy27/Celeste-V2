"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { DISPUTE_STEPS, openDisputes, useAdmin, type Admin, type Dispute, type DisputeDecision } from "@/lib/admin";
import { useDisputes } from "@/lib/disputes";
import { getVendor } from "@/lib/content";
import { PRO_SLUG, usePro } from "@/lib/pro";
import { euros, formatDay, formatTime, shortWhen, stamp } from "@/lib/format";
import { StatusChip } from "../../espace/ui";
import styles from "../../espace/espace.module.css";
import { Guard, useAsk } from "../AdminShell";
import a from "../admin.module.css";

const VIEWS = [
  { id: "litiges", label: "Litiges" },
  { id: "avis", label: "Avis signalés" },
  { id: "tickets", label: "Tickets" },
] as const;

const DECISIONS: DisputeDecision[] = ["Remboursement total", "Remboursement partiel", "Report", "Rejet", "Autre solution acceptée"];

// Support (CDC §20.1, §22.3, §23, §24) : médiation, modération des avis, demandes des utilisateurs.
export function AdminSupport() {
  const params = useSearchParams();
  const view = VIEWS.find((v) => v.id === params.get("vue"))?.id ?? "litiges";
  const { admin } = useAdmin();
  const { disputes } = useDisputes();
  const { pro } = usePro();
  const proReports = pro && !pro.account ? Object.values(pro.reports ?? {}).filter((r) => r.status === "Signalé").length : 0;
  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Support</h1>
          <p className={styles.lead}>Médiation, modération des avis, demandes des couples et des prestataires.</p>
        </div>
      </header>
      <nav className={styles.subnav} aria-label="Support">
        {VIEWS.map((v) => {
          const n = !admin ? 0 : v.id === "litiges" ? openDisputes(disputes).length : v.id === "avis" ? admin.reviews.filter((r) => r.status === "Signalé").length + proReports : admin.tickets.filter((t) => t.status === "Ouvert").length;
          return (
            <Link key={v.id} href={`/admin/support?vue=${v.id}`} aria-current={v.id === view ? "page" : undefined} scroll={false}>
              {v.label}
              {n > 0 && ` (${n})`}
            </Link>
          );
        })}
      </nav>
      <Guard section="support">
        {admin && view === "litiges" && <Disputes disputes={disputes} selectedId={params.get("id")} />}
        {admin && view === "avis" && <Reviews admin={admin} />}
        {admin && view === "tickets" && <Tickets admin={admin} />}
      </Guard>
    </>
  );
}

/* ---------- Litiges et médiation (§23) ---------- */

function Disputes({ disputes, selectedId }: { disputes: Dispute[]; selectedId: string | null }) {
  const selected = disputes.find((d) => d.id === selectedId) ?? disputes[0];
  return (
    <div className={a.split}>
      <ul className={a.cases} aria-label="Litiges">
        {disputes.map((d) => (
          <li key={d.id}>
            <Link href={`/admin/support?vue=litiges&id=${d.id}`} className={a.caseItem} aria-current={d.id === selected?.id ? "true" : undefined} scroll={false}>
              <span className={a.caseTop}>
                <strong>{d.ref}</strong>
                <time dateTime={d.openedAt}>{shortWhen(d.openedAt)}</time>
              </span>
              <span className={styles.rowMeta}>
                {d.couple} · {getVendor(d.vendorSlug)?.name} · {euros(d.amount)}
              </span>
              <StatusChip status={d.step === DISPUTE_STEPS.length - 1 ? "Dossier clos" : DISPUTE_STEPS[d.step]} />
            </Link>
          </li>
        ))}
      </ul>
      {selected && <DisputeDetail key={selected.id} d={selected} />}
    </div>
  );
}

function DisputeDetail({ d }: { d: Dispute }) {
  const ask = useAsk();
  const { update: updateDisputes, addNote } = useDisputes();
  const [reply, setReply] = useState("");
  const [decision, setDecision] = useState<DisputeDecision>("Remboursement partiel");
  const [note, setNote] = useState("");
  const vendor = getVendor(d.vendorSlug);
  const closed = d.step === DISPUTE_STEPS.length - 1;
  // Le dossier vit dans le stockage commun ; l'action est tracée dans le journal d'audit de l'admin.
  const set = (patch: Partial<Dispute>) => (x: Admin) => {
    updateDisputes((list) => list.map((y) => (y.id === d.id ? { ...y, ...patch } : y)));
    return x;
  };
  const nextStep = Math.min(d.step + 1, DISPUTE_STEPS.length - 2);
  const atResolution = d.step >= DISPUTE_STEPS.length - 2;

  return (
    <article className={`${styles.card} ${a.dossier}`} aria-labelledby="disp-t">
      <div className={a.dossierHead}>
        <div>
          <p className={styles.eyebrow}>
            Litige ouvert par {d.openedBy === "couple" ? "le couple" : "le prestataire"} · {formatDay(d.openedAt)} à {formatTime(d.openedAt)}
          </p>
          <h2 id="disp-t" className={styles.sectionTitle}>
            {d.ref} · {d.couple} et {vendor?.name}
          </h2>
          <p className={styles.rowMeta}>
            Montant concerné : {euros(d.amount)}. {d.motif}
          </p>
        </div>
      </div>

      <ol className={a.steps} aria-label="Étapes de la médiation">
        {DISPUTE_STEPS.map((s, i) => (
          <li key={s} data-state={i < d.step || closed ? "done" : i === d.step ? "current" : "todo"} aria-current={i === d.step ? "step" : undefined}>
            <span aria-hidden="true">{i < d.step || closed ? "✓" : i + 1}</span>
            {s}
            {i === 2 && !d.frozen && i < d.step && <small> (fonds déjà libérés ou gel non applicable)</small>}
          </li>
        ))}
      </ol>
      <p className={styles.small}>Objectifs internes : première prise en charge sous 2 jours ouvrés, proposition sous 10 jours ouvrés quand le dossier est complet. Ce ne sont pas des garanties juridiques.</p>

      <section className={a.block} aria-labelledby="ev-t">
        <h3 id="ev-t" className={a.blockTitle}>
          Preuves
        </h3>
        <ul className={a.evidence}>
          {d.evidence.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
        {d.conversationAccess ? (
          <p className={a.hint}>Accès exceptionnel à la conversation accordé et journalisé. Les échanges utiles au dossier peuvent être consultés.</p>
        ) : (
          !closed && (
            <button
              type="button"
              className={a.textBtn}
              onClick={() =>
                ask(
                  { action: "Accès exceptionnel à une conversation", target: `${d.ref} · ${d.couple} et ${vendor?.name}`, confirm: "Accéder", hint: "Réservé à un motif justifié (support, litige, fraude, contrôle autorisé). L'accès est journalisé." },
                  set({ conversationAccess: true, evidence: [...d.evidence, "Extraits de conversation utiles au litige"] }),
                )
              }
            >
              Demander l&apos;accès à la conversation
            </button>
          )
        )}
      </section>

      {((d.notes?.length ?? 0) > 0 || !closed) && (
        <section className={a.block} aria-labelledby="notes-t">
          <h3 id="notes-t" className={a.blockTitle}>
            Échanges du dossier
          </h3>
          <ul className={a.notes}>
            {(d.notes ?? []).map((n) => (
              <li key={n.id} data-from={n.from}>
                <strong>{n.from === "celeste" ? "Céleste" : n.from === "couple" ? d.couple : vendor?.name}</strong>
                <span>{n.text}</span>
                <small>
                  {formatDay(n.at)} à {formatTime(n.at)}
                </small>
              </li>
            ))}
          </ul>
          {!closed && (
            <form
              className={a.decision}
              onSubmit={(e) => {
                e.preventDefault();
                if (!reply.trim()) return;
                addNote(d.id, "celeste", reply);
                setReply("");
              }}
            >
              <label className="field">
                Message aux deux parties
                <textarea rows={2} value={reply} onChange={(e) => setReply(e.target.value)} />
              </label>
              <button type="submit" className="btn btn-sm btn-outline" disabled={!reply.trim()}>
                Envoyer
              </button>
            </form>
          )}
        </section>
      )}

      {!closed && (
        <section className={a.block} aria-labelledby="act-t">
          <h3 id="act-t" className={a.blockTitle}>
            Actions
          </h3>
          <div className={a.actions}>
            {!d.frozen && (
              <button type="button" className="btn btn-sm btn-outline" onClick={() => ask({ action: "Reversement gelé", target: `${d.ref} · ${vendor?.name} · ${euros(d.amount)}`, confirm: "Geler", hint: "Seulement si les fonds ne sont pas encore libérés et si le cadre PSP et juridique le permet." }, set({ frozen: true, step: Math.max(d.step, 2) }))}>
                Geler le reversement
              </button>
            )}
            {!atResolution && (
              <button type="button" className="btn btn-sm" onClick={() => ask({ action: "Litige : étape franchie", target: `${d.ref} · ${DISPUTE_STEPS[nextStep]}`, confirm: "Valider l'étape" }, set({ step: nextStep }))}>
                Passer à « {DISPUTE_STEPS[nextStep]} »
              </button>
            )}
          </div>
          {atResolution && (
            <form
              className={a.decision}
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                ask({ action: `Litige clos : ${decision.toLowerCase()}`, target: `${d.ref} · ${d.couple} et ${vendor?.name}`, confirm: "Clore le dossier", danger: decision !== "Rejet" }, set({ step: DISPUTE_STEPS.length - 1, decision: { kind: decision, note: note.trim(), at: stamp() } }));
              }}
            >
              <label className="field">
                Décision
                <select value={decision} onChange={(e) => setDecision(e.target.value as DisputeDecision)}>
                  {DECISIONS.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Résolution communiquée aux deux parties
                <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Par exemple : remboursement de 30 % au couple, accepté par le prestataire." />
              </label>
              <button type="submit" className="btn btn-sm" disabled={!note.trim()}>
                Proposer et clore
              </button>
            </form>
          )}
        </section>
      )}

      {d.decision && (
        <section className={a.block}>
          <h3 className={a.blockTitle}>Décision</h3>
          <p>
            <strong>{d.decision.kind}</strong> · {d.decision.note}
          </p>
        </section>
      )}
    </article>
  );
}

/* ---------- Avis signalés (§24) ---------- */

function Reviews({ admin }: { admin: Admin }) {
  const ask = useAsk();
  const { pro, update: updatePro } = usePro();
  // Signalements venus de l'espace prestataire : la décision est renvoyée au prestataire.
  const fromPro = pro && !pro.account ? Object.entries(pro.reports ?? {}).map(([i, rep]) => {
    const r = getVendor(PRO_SLUG)!.reviews[Number(i)];
    return { id: `pro-${i}`, index: Number(i), vendorSlug: PRO_SLUG, author: r.author, rating: r.rating, text: r.text, reason: rep.reason, verifiedBooking: true, status: rep.status };
  }) : [];
  const list = [...fromPro, ...admin.reviews];
  const set = (id: string, status: "Conservé" | "Retiré") => (x: Admin) => {
    const own = fromPro.find((r) => r.id === id);
    if (own) {
      updatePro((p) => ({ ...p, reports: { ...(p.reports ?? {}), [own.index]: { ...p.reports![own.index], status, decidedAt: stamp() } } }));
      return x;
    }
    return { ...x, reviews: x.reviews.map((r) => (r.id === id ? { ...r, status } : r)) };
  };
  return (
    <section className={styles.card} aria-labelledby="rv-t">
      <h2 id="rv-t" className={styles.sectionTitle}>
        Avis signalés par les prestataires
      </h2>
      <p className={styles.rowMeta}>Un prestataire peut répondre ou signaler un avis, jamais le supprimer lui-même. Seuls les couples avec une réservation éligible publient des avis.</p>
      <ul className={styles.list}>
        {list.map((r) => (
          <li key={r.id} className={a.reviewRow}>
            <div className={a.caseTop}>
              <strong>
                {r.author} · {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)} · {getVendor(r.vendorSlug)?.name}
              </strong>
              <StatusChip status={r.status} />
            </div>
            <p>« {r.text} »</p>
            <p className={styles.rowMeta}>
              Motif du signalement : {r.reason}. Réservation vérifiée : {r.verifiedBooking ? "oui" : "non"}.
            </p>
            {r.status === "Signalé" && (
              <div className={a.actions}>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => ask({ action: "Avis conservé", target: `${r.author} sur ${getVendor(r.vendorSlug)?.name}`, confirm: "Conserver" }, set(r.id, "Conservé"))}>
                  Conserver
                </button>
                <button type="button" className={`btn btn-sm ${a.danger}`} onClick={() => ask({ action: "Avis retiré", target: `${r.author} sur ${getVendor(r.vendorSlug)?.name}`, confirm: "Retirer l'avis", danger: true, hint: "Retrait réservé aux avis contraires aux règles (injure, hors sujet, faux avis). Un avis négatif mais factuel reste publié." }, set(r.id, "Retiré"))}>
                  Retirer
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Tickets ---------- */

function Tickets({ admin }: { admin: Admin }) {
  const { update } = useAdmin();
  return (
    <section className={styles.card} aria-labelledby="tk-t">
      <h2 id="tk-t" className={styles.sectionTitle}>
        Demandes des utilisateurs
      </h2>
      <ul className={styles.list}>
        {admin.tickets.map((t) => (
          <li key={t.id} className={styles.row}>
            <span className={a.dot} aria-hidden="true" />
            <div>
              <p className={styles.rowTitle}>{t.subject}</p>
              <p className={styles.rowMeta}>
                {t.from} · {t.role} · {shortWhen(t.at)}
              </p>
            </div>
            {t.status === "Ouvert" ? (
              <button type="button" className="btn btn-sm btn-outline" onClick={() => update((x) => ({ ...x, tickets: x.tickets.map((y) => (y.id === t.id ? { ...y, status: "Résolu" } : y)) }))}>
                Marquer résolu
              </button>
            ) : (
              <StatusChip status="Résolu" />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
