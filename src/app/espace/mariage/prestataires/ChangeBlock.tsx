"use client";

import { useState } from "react";
import { coupleNames, offerOf, sendMessage } from "@/lib/deal";
import { useDisputes } from "@/lib/disputes";
import { formatDate, formatDay, isoDate, stamp } from "@/lib/format";
import { useWedding, vendorName, type Wedding } from "@/lib/wedding";
import { Modal } from "../../ui";
import styles from "../../espace.module.css";
import s from "./prestataires.module.css";

type Kind = "report" | "annulation" | "force-majeure";

const KINDS: { id: Kind; label: string; text: string }[] = [
  { id: "report", label: "Reporter la date", text: "Le mariage change de date : le prestataire vous dit s'il est disponible à la nouvelle date." },
  { id: "annulation", label: "Annuler la réservation", text: "Les conditions d'annulation sont celles de votre contrat." },
  { id: "force-majeure", label: "Force majeure", text: "Un événement grave et indépendant de votre volonté : Céleste ouvre un dossier et cherche d'abord une solution de report." },
];

// Annulation, report, force majeure (CDC §14.3, §14.4). Le barème n'est pas encore validé juridiquement :
// aucun montant de remboursement n'est calculé ni promis ici, le contrat fait foi.
export function ChangeBlock({ w, slug }: { w: Wedding; slug: string }) {
  const { update } = useWedding();
  const { open: openDispute } = useDisputes();
  const [show, setShow] = useState(false);
  const [kind, setKind] = useState<Kind>("report");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const name = vendorName(slug);
  const sent = (w.requests ?? []).filter((r) => r.vendorSlug === slug);
  const ready = reason.trim().length >= 10 && (kind !== "report" || !!date);

  return (
    <section className={s.block}>
      <h3 className={s.blockTitle}>Annuler ou reporter</h3>
      {sent.map((r) => (
        <p key={r.id} className={styles.rowMeta}>
          {r.kind === "report" ? `Report au ${formatDate(r.newDate!)} demandé` : r.kind === "annulation" ? "Annulation demandée" : "Force majeure signalée, dossier ouvert"} le {formatDay(r.at)}. La réponse de {name} arrive dans la conversation.
        </p>
      ))}
      <button type="button" className={styles.linkBtn} onClick={() => setShow(true)}>
        Demander une annulation ou un report
      </button>
      <Modal open={show} onClose={() => setShow(false)} labelledBy="change-t">
        <form
          className={styles.dialogForm}
          onSubmit={(e) => {
            e.preventDefault();
            if (!ready) return;
            const text =
              kind === "report"
                ? `Nous devons reporter notre mariage au ${formatDate(date)}. Seriez-vous disponible à cette date ? ${reason.trim()}`
                : kind === "annulation"
                  ? `Nous souhaitons annuler notre réservation. ${reason.trim()}`
                  : `Nous faisons face à un cas de force majeure. ${reason.trim()}`;
            update((x) => ({
              ...sendMessage(x, slug, { text }),
              requests: [...(x.requests ?? []), { id: Math.random().toString(36).slice(2, 10), vendorSlug: slug, kind, reason: reason.trim(), newDate: kind === "report" ? date : undefined, at: stamp() }],
            }));
            if (kind === "force-majeure") {
              const offer = offerOf(w, slug);
              openDispute(
                { couple: coupleNames(w), coupleEmail: w.email, vendorSlug: slug, amount: offer?.total ?? 0, motif: `Force majeure : ${reason.trim()}`, openedBy: "couple", evidence: [...(offer ? [`Offre « ${offer.offer.name} », version ${offer.offer.version} acceptée`] : []), "Contrat signé"] },
                `Force majeure : ${reason.trim()} Nous privilégions un report si c'est possible.`,
              );
            }
            setShow(false);
            setReason("");
          }}
        >
          <h2 id="change-t" className={styles.sectionTitle}>
            Annuler ou reporter avec {name}
          </h2>
          <fieldset className={s.kinds}>
            <legend className="visually-hidden">Type de demande</legend>
            {KINDS.map((k) => (
              <label key={k.id} className={s.kind} data-checked={kind === k.id}>
                <input type="radio" name="kind" checked={kind === k.id} onChange={() => setKind(k.id)} />
                <span>
                  <strong>{k.label}</strong>
                  <small>{k.text}</small>
                </span>
              </label>
            ))}
          </fieldset>
          {kind === "report" && (
            <label className="field">
              Nouvelle date du mariage
              <input type="date" min={isoDate()} value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>
          )}
          <label className="field">
            {kind === "force-majeure" ? "Ce qui se passe" : "Un mot pour expliquer"}
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
          <p className={s.notice}>
            Le contrat signé fixe les conditions d&apos;annulation et de remboursement. Le barème Céleste est en cours de validation : aucun montant n&apos;est calculé à cette étape.
          </p>
          <div className={styles.dialogActions}>
            <button type="submit" className="btn" disabled={!ready}>
              Envoyer la demande
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShow(false)}>
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
