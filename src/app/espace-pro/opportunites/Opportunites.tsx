"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { euros, formatDate, shortWhen } from "@/lib/format";
import { answerOpportunity, dayStatus, startingDraft, useDeals, type Opportunity } from "@/lib/pro";
import { Modal, StatusChip } from "../../espace/ui";
import styles from "../../espace/espace.module.css";
import { OfferBuilder } from "../OfferBuilder";
import p from "../pro.module.css";

const statusLabel = (o: Opportunity) => (o.status === "repondue" ? "Répondue" : o.status === "declinee" ? "Déclinée" : o.slots.taken >= o.slots.max ? "Places complètes" : "Nouvelle");

// Opportunités commerciales (CDC §19) : Céleste propose les demandes compatibles ; le nombre de
// prestataires autorisés à répondre est limité, et la réponse est une offre structurée.
export function Opportunites() {
  const { pro, updatePro, deals } = useDeals();
  const params = useSearchParams();
  const router = useRouter();
  const [answering, setAnswering] = useState<string | null>(null);
  if (!pro) return null;
  const selectedId = params.get("o") ?? pro.opportunities.find((o) => o.status === "nouvelle")?.id ?? pro.opportunities[0]?.id;
  const selected = pro.opportunities.find((o) => o.id === selectedId);
  const target = pro.opportunities.find((o) => o.id === answering);


  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Opportunités</h1>
          <p className={styles.lead}>Des couples dont le projet correspond à votre profil. Quelques réponses pertinentes valent mieux que des dizaines de messages.</p>
        </div>
      </header>

      {!pro.opportunities.length && (
        <div className={styles.empty}>
          <p>
            {pro.account && !pro.account.published
              ? "Publiez votre fiche pour recevoir des opportunités : Céleste vous propose les couples dont le projet correspond à votre offre, votre zone et vos disponibilités."
              : "Aucune opportunité pour l'instant. Dès qu'un couple compatible avec votre profil cherche votre métier, sa demande arrive ici."}
          </p>
          <Link href="/espace-pro" className="btn btn-sm">
            Revenir à l&apos;accueil
          </Link>
        </div>
      )}
      <div className={p.split}>
        <ul className={p.oppList} aria-label="Opportunités">
          {pro.opportunities.map((o) => (
            <li key={o.id}>
              <Link href={`/espace-pro/opportunites?o=${o.id}`} className={p.oppItem} aria-current={o.id === selectedId ? "true" : undefined} scroll={false}>
                <span className={p.oppTop}>
                  <strong>{o.names.join(" & ")}</strong>
                  <span className={p.score}>✦ {o.compat} %</span>
                </span>
                <span className={styles.rowMeta}>
                  {formatDate(o.date)} · {o.zone} · {euros(o.budget)}
                </span>
                <span className={p.oppBottom}>
                  <StatusChip status={statusLabel(o)} />
                  <time dateTime={o.receivedAt}>{shortWhen(o.receivedAt)}</time>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {selected && (
          <article className={`${styles.card} ${p.oppDetail}`} aria-labelledby="opp-t">
            <div className={p.oppHead}>
              <div>
                <p className={styles.eyebrow}>Demande transmise par Céleste</p>
                <h2 id="opp-t" className={styles.sectionTitle}>
                  {selected.names.join(" & ")}
                </h2>
              </div>
              <span className={p.scoreLg}>✦ {selected.compat} % compatible</span>
            </div>

            <dl className={p.facts}>
              <div>
                <dt>Date</dt>
                <dd>{formatDate(selected.date)}</dd>
              </div>
              <div>
                <dt>Zone</dt>
                <dd>{selected.zone}</dd>
              </div>
              <div>
                <dt>Invités</dt>
                <dd>{selected.guests}</dd>
              </div>
              <div>
                <dt>Budget photo</dt>
                <dd>{euros(selected.budget)}</dd>
              </div>
              <div>
                <dt>Style</dt>
                <dd>{selected.style}</dd>
              </div>
              <div>
                <dt>Votre disponibilité</dt>
                <dd>
                  <StatusChip status={dayStatus(pro, deals, selected.date).status} />
                </dd>
              </div>
            </dl>

            <div className={p.need}>
              <p className={p.kind}>Résumé du besoin</p>
              <p>{selected.need}</p>
            </div>

            <p className={styles.rowMeta}>
              {selected.slots.max} prestataires au maximum peuvent répondre · {selected.slots.taken} réponse{selected.slots.taken > 1 ? "s" : ""} déjà envoyée{selected.slots.taken > 1 ? "s" : ""}.
            </p>

            {selected.status === "repondue" ? (
              <div className={styles.empty}>
                <p>Vous avez répondu avec une offre. La suite se passe dans la conversation.</p>
                <Link href={`/espace-pro/messages?d=${selected.clientId}`} className="btn btn-sm">
                  Ouvrir la conversation
                </Link>
              </div>
            ) : selected.status === "declinee" ? (
              <p className={styles.rowMeta}>Vous avez décliné cette opportunité.</p>
            ) : selected.slots.taken >= selected.slots.max ? (
              <div className={styles.empty}>
                <p>Toutes les places de réponse sont prises : le couple a déjà assez de propositions. Les prochaines opportunités compatibles arriveront ici.</p>
              </div>
            ) : (
              <div className={p.oppActions}>
                <button type="button" className="btn" onClick={() => setAnswering(selected.id)}>
                  Proposer une offre
                </button>
                <button type="button" className={p.textBtn} onClick={() => updatePro((x) => ({ ...x, opportunities: x.opportunities.map((o) => (o.id === selected.id ? { ...o, status: "declinee" } : o)) }))}>
                  Décliner
                </button>
              </div>
            )}
          </article>
        )}
      </div>

      <Modal open={!!target} onClose={() => setAnswering(null)} labelledBy="answer-t" className={p.wide}>
        {target && (
          <div className={p.dialog}>
            <h2 id="answer-t" className={styles.sectionTitle}>
              Votre offre pour {target.names.join(" & ")}
            </h2>
            <OfferBuilder
              pro={pro}
              initial={startingDraft(pro, target.budget)}
              request={target.need}
              coupleBudget={target.budget}
              submitLabel="Envoyer l'offre"
              onCancel={() => setAnswering(null)}
              onSend={(draft, note, hold) => {
                let clientId: string | null = null;
                updatePro((x) => {
                  const r = answerOpportunity(x, target.id, draft, note, hold);
                  clientId = r.clientId;
                  return r.pro;
                });
                setAnswering(null);
                if (clientId) router.push(`/espace-pro/messages?d=${clientId}`);
              }}
            />
          </div>
        )}
      </Modal>
    </>
  );
}
