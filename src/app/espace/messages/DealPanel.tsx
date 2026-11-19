"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { scheduleFor } from "@/lib/booking";
import { getVendor } from "@/lib/content";
import {
  acceptOffer,
  adaptLines,
  canAnswer,
  conversationOf,
  declineOffer,
  latestOffer,
  OFFER_LABEL,
  offerChanges,
  offerOf,
  offerStatus,
  offerTotal,
  requestAdaptation,
  vendorFirstName,
  type Offer,
} from "@/lib/deal";
import { euros, formatTime, formatWeekday, formatDay, stamp } from "@/lib/format";
import { MAX_INSTALLMENTS } from "@/lib/settings";
import { budgetFor, useWedding, type Wedding } from "@/lib/wedding";
import { Modal, StatusChip } from "../ui";
import styles from "../espace.module.css";
import m from "./messages.module.css";

type Props = {
  w: Wedding;
  slug: string;
  viewing: string | null;
  onView: (offerId: string | null) => void;
  onClose: () => void;
  onPropose: () => void;
  autoAdapt: boolean;
};

const signed = (n: number) => `${n < 0 ? "−" : "+"}${euros(Math.abs(n))}`;

// Deal Room (CDC §11) : l'offre en cours, son historique de versions et les réponses possibles
// (accepter, indiquer son budget, demander une adaptation, décliner), à côté de la conversation.
export function DealPanel({ w, slug, viewing, onView, onClose, onPropose, autoAdapt }: Props) {
  const { update } = useWedding();
  const [adaptOpen, setAdaptOpen] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);
  const auto = useRef(false);
  const conv = conversationOf(w, slug);
  const v = getVendor(slug)!;
  const first = vendorFirstName(slug);
  const latest = latestOffer(conv);
  const shown = conv?.offers.find((o) => o.id === viewing) ?? offerOf(w, slug)?.offer;
  const status = shown ? offerStatus(w, slug, shown) : null;
  const answerable = shown ? canAnswer(w, slug, shown) : false;
  const previous = shown ? conv?.offers.find((o) => o.version === shown.version - 1) : undefined;
  const changes = shown && previous ? offerChanges(previous, shown) : [];
  const versions = [...(conv?.offers ?? [])].sort((a, b) => b.version - a.version);
  const appointments = w.appointments.filter((a) => a.vendorSlug === slug).sort((a, b) => a.date.localeCompare(b.date));
  const holdActive = shown?.holdUntil && answerable && shown.holdUntil > stamp();

  // Arrivée depuis « Demander une adaptation » (Mes prestataires) : la fenêtre s'ouvre directement.
  useEffect(() => {
    if (autoAdapt && !auto.current && latest && canAnswer(w, slug, latest)) {
      auto.current = true;
      onView(null);
      setAdaptOpen(true);
    }
  }, [autoAdapt, latest, w, slug, onView]);

  return (
    <aside className={m.deal} aria-labelledby="deal-t">
      <div className={m.dealHead}>
        <div>
          <p className={styles.eyebrow}>Deal Room</p>
          <h2 id="deal-t" className={styles.sectionTitle}>
            {shown ? "Offre" : "Offre et rendez-vous"}
          </h2>
        </div>
        <button type="button" className={`${styles.iconBtn} ${m.dealClose}`} onClick={onClose} aria-label="Fermer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {!shown ? (
        <div className={styles.empty}>
          <Image src="/icons/price-tag.png" alt="" width={64} height={64} />
          <p>Pas encore d&apos;offre. Décrivez votre besoin dans la conversation : {first} vous enverra une proposition détaillée, ajustable selon votre budget.</p>
        </div>
      ) : (
        <section className={m.offer} aria-label={`Offre version ${shown.version}`}>
          <div className={m.offerTop}>
            <span className={m.cardEyebrow}>
              Version {shown.version}
              {latest && shown.id !== latest.id && ` · remplacée par la version ${latest.version}`}
            </span>
            <StatusChip status={latest && shown.id !== latest.id && shown.status !== "acceptee" ? "Remplacée" : OFFER_LABEL[status!]} />
          </div>
          <h3 className={m.offerName}>{shown.name}</h3>
          <p className={styles.rowMeta}>
            Reçue le {formatDay(shown.sentAt)}
            {answerable && ` · valable jusqu'au ${formatDay(shown.validUntil)}`}
          </p>

          {holdActive && (
            <p className={m.hold}>
              {first} bloque votre date jusqu&apos;au {formatWeekday(shown.holdUntil!)} à {formatTime(shown.holdUntil!)}, le temps que vous décidiez.
            </p>
          )}

          <ul className={m.lines}>
            {shown.lines.map((l) => (
              <li key={l.key}>
                <span>{l.label}</span>
                <span>{l.amount ? euros(l.amount) : "Inclus"}</span>
              </li>
            ))}
          </ul>
          <p className={m.total}>
            <span>Total</span>
            <strong>{euros(offerTotal(shown))}</strong>
          </p>

          {changes.length > 0 && (
            <div className={m.changes}>
              <p className={m.changesTitle}>Ce qui a changé depuis la version {previous!.version}</p>
              <ul>
                {changes.map((c) => (
                  <li key={c.label}>
                    <span>{c.kind === "retire" ? `${c.label} : retiré` : c.kind === "ajoute" ? `${c.label} : ajouté` : c.to === c.label ? `${c.label} : prix ajusté` : `${c.label} → ${c.to}`}</span>
                    <span>{signed(c.delta)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {answerable ? (
            <div className={m.offerActions}>
              <button type="button" className="btn btn-block" onClick={() => setAcceptOpen(true)}>
                Accepter l&apos;offre
              </button>
              <button type="button" className="btn btn-outline btn-block" onClick={() => setAdaptOpen(true)}>
                Adapter à notre budget
              </button>
              {confirmDecline ? (
                <div className={m.decline} role="group" aria-label="Confirmer le refus">
                  <span>Décliner la version {shown.version} ?</span>
                  <button
                    type="button"
                    className={m.textBtn}
                    onClick={() => {
                      update((x) => declineOffer(x, slug, shown.id));
                      setConfirmDecline(false);
                    }}
                  >
                    Oui, décliner
                  </button>
                  <button type="button" className={m.textBtn} onClick={() => setConfirmDecline(false)}>
                    Annuler
                  </button>
                </div>
              ) : (
                <button type="button" className={m.textBtn} onClick={() => setConfirmDecline(true)}>
                  Décliner l&apos;offre
                </button>
              )}
            </div>
          ) : status === "acceptee" ? (
            // Offre acceptée, réservation pas encore confirmée : une seule suite possible (§13.1).
            <div className={m.offerActions}>
              <p className={m.frozenNote}>Version figée : c&apos;est elle qui fait foi pour le contrat. Signez-le et réglez l&apos;acompte pour confirmer la réservation.</p>
              <Link href={`/espace/reservation/${slug}`} className="btn btn-block">
                Finaliser la réservation
              </Link>
            </div>
          ) : status === "confirmee" ? (
            <div className={m.frozen}>
              <p>Réservation confirmée. Cette version figée fait foi pour le contrat.</p>
              <div className={m.frozenLinks}>
                <Link href="/espace/mariage/documents" className={styles.more}>
                  Voir le contrat
                </Link>
                <Link href="/espace/mariage/budget" className={styles.more}>
                  Voir l&apos;échéancier
                </Link>
              </div>
            </div>
          ) : (status === "expiree" || status === "refusee") && shown.id === latest?.id ? (
            <div className={m.frozen}>
              <p>{status === "expiree" ? `Cette offre a expiré le ${formatDay(shown.validUntil)}.` : "Vous avez décliné cette offre."}</p>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => update((x) => requestAdaptation(x, slug, { drop: [] }))}>
                Demander une offre à jour
              </button>
            </div>
          ) : shown.id !== latest?.id ? (
            <button type="button" className={m.textBtn} onClick={() => onView(latest!.id)}>
              Voir la version {latest!.version}, la plus récente
            </button>
          ) : null}
        </section>
      )}

      {versions.length > 1 && (
        <section className={m.dealBlock} aria-labelledby="versions-t">
          <h3 id="versions-t" className={m.blockTitle}>
            Toutes les versions
          </h3>
          <ul className={m.versions}>
            {versions.map((o) => (
              <li key={o.id}>
                <button type="button" className={m.version} aria-pressed={o.id === shown?.id} onClick={() => onView(o.id)}>
                  <span>
                    <strong>Version {o.version}</strong> · {o.name}
                  </span>
                  <span>{euros(offerTotal(o))}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={m.dealBlock} aria-labelledby="rdv-list-t">
        <h3 id="rdv-list-t" className={m.blockTitle}>
          Rendez-vous
        </h3>
        {appointments.length ? (
          <ul className={m.rdvList}>
            {appointments.map((a) => (
              <li key={a.id}>
                <span>
                  <strong>{a.kind}</strong>
                  <small>
                    {formatWeekday(a.date)} à {formatTime(a.date)}
                  </small>
                </span>
                <StatusChip status={a.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.rowMeta}>Aucun rendez-vous pour l&apos;instant.</p>
        )}
        <button type="button" className={m.textBtn} onClick={onPropose}>
          Proposer un rendez-vous
        </button>
      </section>

      <section className={m.dealBlock}>
        <Link href={`/prestataire/${slug}`} className={m.vendorLink}>
          <span className={m.avatar}>
            <Image src={v.photo} alt="" fill sizes="44px" style={{ objectFit: "cover", objectPosition: v.pos }} />
          </span>
          <span>
            <strong>{v.name}</strong>
            <small>
              ★ {v.rating} · {v.reviewsCount} avis · {v.area}
            </small>
          </span>
        </Link>
      </section>

      {latest && <AdaptDialog open={adaptOpen} onClose={() => setAdaptOpen(false)} w={w} slug={slug} offer={latest} />}
      {shown && answerable && <AcceptDialog open={acceptOpen} onClose={() => setAcceptOpen(false)} w={w} slug={slug} offer={shown} />}
    </aside>
  );
}

/* ---------- Adapter l'offre (§11.3) ---------- */

function AdaptDialog({ open, onClose, w, slug, offer }: { open: boolean; onClose: () => void; w: Wedding; slug: string; offer: Offer }) {
  const { update } = useWedding();
  const [target, setTarget] = useState("");
  const [drop, setDrop] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const first = vendorFirstName(slug);
  const category = getVendor(slug)?.category;
  // Le budget prévu pour ce poste vient du projet : rien à ressaisir (§3).
  const planned = budgetFor(w).lines.find((l) => l.category === category && l.planned > 0)?.planned;
  const adjustable = offer.lines.filter((l) => l.reduced || l.removable);
  const goal = target ? Math.max(0, Math.round(Number(target))) : undefined;
  const preview = adaptLines(offer.lines, { target: goal, drop });
  const total = offerTotal(offer);
  const ready = !!goal || drop.length > 0 || note.trim().length > 0;

  const close = () => {
    setTarget("");
    setDrop([]);
    setNote("");
    onClose();
  };

  return (
    <Modal open={open} onClose={close} labelledBy="adapt-t">
      <form
        className={m.dialog}
        onSubmit={(e) => {
          e.preventDefault();
          if (!ready) return;
          update((x) => requestAdaptation(x, slug, { target: goal, drop, note }));
          close();
        }}
      >
        <h2 id="adapt-t" className={styles.sectionTitle}>
          Adapter l&apos;offre à votre budget
        </h2>
        <p className={styles.rowMeta}>
          Plutôt qu&apos;une remise, {first} peut ajuster la durée, les options ou le niveau de service. Le prix de chaque élément reste clair.
        </p>

        <label className="field">
          Votre budget pour ce poste
          <span className={m.euroInput}>
            <input type="number" inputMode="numeric" min={0} step={10} value={target} onChange={(e) => setTarget(e.target.value)} placeholder={String(total)} />
            <span aria-hidden="true">€</span>
          </span>
        </label>
        {planned !== undefined && (
          <p className={m.hint}>
            Prévu dans votre budget : {euros(planned)}.{" "}
            <button type="button" className={m.textBtn} onClick={() => setTarget(String(Math.round(planned / 10) * 10))}>
              Utiliser ce montant
            </button>
          </p>
        )}

        {adjustable.length > 0 && (
          <fieldset className={m.fieldset}>
            <legend>Ce dont vous pourriez vous passer</legend>
            {adjustable.map((l) => (
              <label key={l.key} className={m.check}>
                <input type="checkbox" checked={drop.includes(l.key)} onChange={(e) => setDrop((d) => (e.target.checked ? [...d, l.key] : d.filter((k) => k !== l.key)))} />
                <span>
                  {l.reduced ? (
                    <>
                      {l.label}
                      <small>Version plus courte : {l.reduced.label}</small>
                    </>
                  ) : (
                    l.label
                  )}
                </span>
                <span className={m.delta}>{signed(l.reduced ? l.reduced.amount - l.amount : -l.amount)}</span>
              </label>
            ))}
          </fieldset>
        )}

        <label className="field">
          Un mot pour {first} (facultatif)
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ce qui compte le plus pour nous, c'est…" />
        </label>

        {(goal || drop.length > 0) && (
          <div className={m.estimate} role="status">
            <p>
              Estimation : <strong>{euros(preview.total)}</strong> au lieu de {euros(total)}
            </p>
            <small>
              {preview.reachable
                ? `${first} confirmera en vous envoyant une nouvelle version de l'offre.`
                : `En allégeant ce qui peut l'être, l'offre ne descend pas sous ${euros(preview.total)}. ${first} vous dira ce qui est possible.`}
            </small>
          </div>
        )}

        <div className={m.dialogActions}>
          <button type="submit" className="btn" disabled={!ready}>
            Envoyer à {first}
          </button>
          <button type="button" className="btn btn-outline" onClick={close}>
            Annuler
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Récapitulatif figé avant acceptation (§13.1) ---------- */

function AcceptDialog({ open, onClose, w, slug, offer }: { open: boolean; onClose: () => void; w: Wedding; slug: string; offer: Offer }) {
  const { update } = useWedding();
  const router = useRouter();
  const total = offerTotal(offer);
  const deposit = scheduleFor(w.date, total)[0];
  return (
    <Modal open={open} onClose={onClose} labelledBy="accept-t">
      <div className={m.dialog}>
        <h2 id="accept-t" className={styles.sectionTitle}>
          Accepter la version {offer.version}
        </h2>
        <p className={styles.rowMeta}>Récapitulatif figé : c&apos;est exactement cette version qui servira au contrat et à la réservation.</p>
        <div className={m.recap}>
          <p className={m.recapName}>
            {offer.name} · {getVendor(slug)?.name}
          </p>
          <ul className={m.lines}>
            {offer.lines.map((l) => (
              <li key={l.key}>
                <span>{l.label}</span>
                <span>{l.amount ? euros(l.amount) : "Inclus"}</span>
              </li>
            ))}
          </ul>
          <p className={m.total}>
            <span>Total</span>
            <strong>{euros(total)}</strong>
          </p>
        </div>
        <ol className={m.next}>
          <li>Le contrat est généré à partir de cette version. Vous le signez en ligne.</li>
          <li>
            Vous choisissez de payer en une fois ({euros(total)}), ou de régler un acompte de {euros(deposit.amount)} puis le solde en 1 à {MAX_INSTALLMENTS} échéances.
          </li>
          <li>Dès le premier paiement, la réservation est confirmée et vos documents sont rangés dans Mon mariage.</li>
        </ol>
        <div className={m.dialogActions}>
          <button
            type="button"
            className="btn"
            onClick={() => {
              const ok = canAnswer(w, slug, offer);
              if (ok) update((x) => acceptOffer(x, slug, offer.id));
              onClose();
              if (ok) router.push(`/espace/reservation/${slug}`);
            }}
          >
            Confirmer et accepter
          </button>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Revenir à l&apos;offre
          </button>
        </div>
      </div>
    </Modal>
  );
}
