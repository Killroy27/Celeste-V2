"use client";

import { useState } from "react";
import { DISPUTE_MOTIFS, DISPUTE_STEPS, useDisputes, type Dispute } from "@/lib/disputes";
import { euros, formatDay, formatTime } from "@/lib/format";
import { Modal, StatusChip } from "./ui";
import styles from "./espace.module.css";

type Side = "couple" | "prestataire";

// Ouvrir un litige depuis une réservation (CDC §23, étape 16), côté couple ou prestataire.
export function DisputeOpen({ side, couple, coupleEmail, vendorSlug, vendorName, amount, evidence }: { side: Side; couple: string; coupleEmail?: string; vendorSlug: string; vendorName: string; amount: number; evidence: string[] }) {
  const { open } = useDisputes();
  const [show, setShow] = useState(false);
  const [motif, setMotif] = useState<string>(DISPUTE_MOTIFS[0]);
  const [text, setText] = useState("");
  const [value, setValue] = useState(String(amount));
  const [kept, setKept] = useState<string[]>(evidence);
  const [files, setFiles] = useState<string[]>([]);
  const other = side === "couple" ? vendorName : couple;
  const ready = text.trim().length >= 20;

  return (
    <>
      <button type="button" className={styles.linkBtn} onClick={() => setShow(true)}>
        Signaler un problème
      </button>
      <Modal open={show} onClose={() => setShow(false)} labelledBy="dispute-t">
        <form
          className={styles.dialogForm}
          onSubmit={(e) => {
            e.preventDefault();
            if (!ready) return;
            open(
              { couple, coupleEmail, vendorSlug, amount: Math.max(0, Math.round(Number(value) || 0)), motif: `${motif} : ${text.trim()}`, openedBy: side, evidence: [...kept, ...files.map((f) => `Justificatif : ${f}`)] },
              text,
            );
            setShow(false);
          }}
        >
          <h2 id="dispute-t" className={styles.sectionTitle}>
            Signaler un problème avec {other}
          </h2>
          <p className={styles.rowMeta}>Un message à {other} règle souvent la situation. Si ce n&apos;est pas le cas, Céleste ouvre un dossier de médiation et accompagne les deux parties.</p>
          <label className="field">
            Motif
            <select value={motif} onChange={(e) => setMotif(e.target.value)}>
              {DISPUTE_MOTIFS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Ce qui s&apos;est passé
            <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Les faits, les dates, ce que vous attendez comme solution…" />
          </label>
          <label className="field">
            Montant concerné (€)
            <input type="number" min={0} step={10} value={value} onChange={(e) => setValue(e.target.value)} />
          </label>
          <fieldset className={styles.evidence}>
            <legend>Preuves jointes au dossier</legend>
            {evidence.map((ev) => (
              <label key={ev}>
                <input type="checkbox" checked={kept.includes(ev)} onChange={(e) => setKept((k) => (e.target.checked ? [...k, ev] : k.filter((x) => x !== ev)))} />
                {ev}
              </label>
            ))}
            {files.map((f) => (
              <span key={f} className={styles.small}>
                Justificatif : {f}
              </span>
            ))}
            {/* Prototype : seuls les noms des fichiers sont gardés. */}
            <label className={styles.linkBtn}>
              Ajouter un justificatif ou une photo
              <input type="file" multiple hidden onChange={(e) => setFiles((f) => [...new Set([...f, ...[...(e.target.files ?? [])].map((x) => x.name)])])} />
            </label>
          </fieldset>
          <p className={styles.small}>Objectif interne de Céleste : une première prise en charge sous 2 jours ouvrés. Chaque partie dispose ensuite de 5 jours ouvrés pour apporter ses éléments.</p>
          <div className={styles.dialogActions}>
            <button type="submit" className="btn" disabled={!ready}>
              Ouvrir le dossier
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShow(false)}>
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// Suivi d'un dossier par une partie : étape, échanges avec Céleste, ajout d'une précision, décision.
export function DisputeFollow({ d, side, otherName }: { d: Dispute; side: Side; otherName: string }) {
  const { addNote } = useDisputes();
  const [text, setText] = useState("");
  const closed = d.step === DISPUTE_STEPS.length - 1;
  const author = (from: string) => (from === "celeste" ? "Céleste" : from === side ? "Vous" : otherName);

  return (
    <div className={styles.dispute}>
      <div className={styles.disputeHead}>
        <strong>
          Dossier {d.ref} · {euros(d.amount)}
        </strong>
        <StatusChip status={DISPUTE_STEPS[d.step]} />
      </div>
      <p className={styles.rowMeta}>
        {closed ? "Dossier clos." : `Étape ${d.step + 1} sur ${DISPUTE_STEPS.length}.`} Ouvert le {formatDay(d.openedAt)} par {d.openedBy === side ? "vous" : otherName}.
        {d.frozen && !d.decision ? " Le reversement au prestataire est suspendu pendant la médiation." : ""}
      </p>
      {d.decision && (
        <p className={styles.disputeDecision}>
          <strong>Décision : {d.decision.kind}.</strong> {d.decision.note}
        </p>
      )}
      {(d.notes?.length ?? 0) > 0 && (
        <ul className={styles.disputeNotes}>
          {d.notes!.map((n) => (
            <li key={n.id} data-from={n.from}>
              <strong>{author(n.from)}</strong>
              <span>{n.text}</span>
              <small>
                {formatDay(n.at)} à {formatTime(n.at)}
              </small>
            </li>
          ))}
        </ul>
      )}
      {!closed && (
        <form
          className={styles.disputeReply}
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            addNote(d.id, side, text);
            setText("");
          }}
        >
          <label className="visually-hidden" htmlFor={`note-${d.id}`}>
            Ajouter une précision au dossier
          </label>
          <textarea id={`note-${d.id}`} rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ajouter une précision ou un élément…" />
          <button type="submit" className="btn btn-sm btn-outline" disabled={!text.trim()}>
            Envoyer
          </button>
        </form>
      )}
    </div>
  );
}
