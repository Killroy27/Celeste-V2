"use client";

import { useState } from "react";
import { offerChanges, type Offer, type OfferLine } from "@/lib/deal";
import { euros } from "@/lib/format";
import type { Pro } from "@/lib/pro";
import { DATE_HOLD_HOURS, OFFER_VALIDITY_DAYS } from "@/lib/settings";
import styles from "../espace/espace.module.css";
import p from "./pro.module.css";

const uid = () => Math.random().toString(36).slice(2, 8);
const signed = (n: number) => `${n < 0 ? "−" : "+"}${euros(Math.abs(n))}`;

export type OfferDraft = { name: string; lines: OfferLine[] };

type Props = {
  pro: Pro;
  initial: OfferDraft;
  previous?: Offer;
  renewal?: boolean; // offre expirée, refusée ou retirée : la renvoyer à l'identique est permis
  request?: string; // demande du couple à laquelle on répond (adaptation, besoin)
  coupleBudget?: number;
  submitLabel: string;
  onSend: (draft: OfferDraft, note: string, hold: boolean) => void;
  onCancel: () => void;
};

// Création ou révision d'offre (CDC §11.3, §16.4) : on part d'une formule du catalogue, on ajuste le contenu
// (durée, options, niveau de service) et chaque ligne garde un prix clair. Le couple voit ce qui a changé.
export function OfferBuilder({ pro, initial, previous, renewal, request, coupleBudget, submitLabel, onSend, onCancel }: Props) {
  const [name, setName] = useState(initial.name);
  const [lines, setLines] = useState<OfferLine[]>(initial.lines.map((l) => ({ ...l })));
  const [note, setNote] = useState("");
  const [hold, setHold] = useState(!!previous);
  const total = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  const clean = lines.filter((l) => l.label.trim()).map((l) => ({ ...l, label: l.label.trim(), amount: Math.max(0, Math.round(Number(l.amount) || 0)) }));
  const changes = previous ? offerChanges(previous, { lines: clean }) : [];
  const flagsChanged = !!previous && clean.some((l) => !!l.removable !== !!previous.lines.find((x) => x.key === l.key)?.removable);
  const ready = !!name.trim() && clean.length > 0 && (!previous || renewal || changes.length > 0 || flagsChanged || name.trim() !== previous.name);

  const setLine = (key: string, patch: Partial<OfferLine>) =>
    setLines((ls) =>
      ls.map((l) => {
        if (l.key !== key) return l;
        const next = { ...l, ...patch };
        // Une ligne modifiée perd sa variante courte, qui ne correspondrait plus.
        if (("label" in patch || "amount" in patch) && next.reduced) delete next.reduced;
        return next;
      }),
    );

  const fromFormula = (id: string) => {
    const f = pro.formulas.find((x) => x.id === id);
    if (!f) return;
    setName(f.name);
    setLines(f.includes.map((label, i) => ({ key: uid(), label, amount: i === 0 ? (f.price ?? 0) : 0 })));
  };

  return (
    <form
      className={p.builder}
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) onSend({ name: name.trim(), lines: clean }, note, hold);
      }}
    >
      {request && (
        <div className={p.request}>
          <p className={p.kind}>Demande du couple</p>
          <p>{request}</p>
          {coupleBudget ? <p className={styles.rowMeta}>Budget indiqué : {euros(coupleBudget)}</p> : null}
        </div>
      )}

      <div className={p.builderTop}>
        <label className="field">
          Nom de l&apos;offre
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="field">
          Partir d&apos;une formule
          <select value="" onChange={(e) => fromFormula(e.target.value)}>
            <option value="">Choisir dans le catalogue…</option>
            {pro.formulas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} · {f.price ? `dès ${euros(f.price)}` : "sur devis"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className={p.lineList}>
        <legend>Contenu et prix</legend>
        {lines.map((l) => (
          <div key={l.key} className={p.lineRow}>
            <label className="visually-hidden" htmlFor={`l-${l.key}`}>
              Élément
            </label>
            <input id={`l-${l.key}`} value={l.label} onChange={(e) => setLine(l.key, { label: e.target.value })} placeholder="Élément de la prestation" />
            <label className={p.amount}>
              <span className="visually-hidden">Prix de {l.label || "l'élément"}</span>
              <input type="number" inputMode="numeric" min={0} step={10} value={l.amount} onChange={(e) => setLine(l.key, { amount: Number(e.target.value) })} />
              <span aria-hidden="true">€</span>
            </label>
            <label className={p.optional}>
              <input type="checkbox" checked={!!l.removable} onChange={(e) => setLine(l.key, { removable: e.target.checked })} />
              Option
            </label>
            <button type="button" className={styles.iconBtn} onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} aria-label={`Retirer ${l.label || "cette ligne"}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {l.reduced && <p className={p.reducedHint}>Variante plus courte proposée au couple : {l.reduced.label} ({euros(l.reduced.amount)})</p>}
          </div>
        ))}
        <div className={p.lineAdd}>
          <button type="button" className={p.textBtn} onClick={() => setLines((ls) => [...ls, { key: uid(), label: "", amount: 0 }])}>
            Ajouter une ligne
          </button>
          <select
            value=""
            aria-label="Ajouter une option du catalogue"
            onChange={(e) => {
              const o = pro.options.find((x) => x.id === e.target.value);
              if (o) setLines((ls) => [...ls, { key: uid(), label: o.label, amount: o.price, removable: true }]);
            }}
          >
            <option value="">Ajouter une option du catalogue…</option>
            {pro.options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label} · {euros(o.price)}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <p className={p.builderTotal}>
        <span>Total</span>
        <strong>{euros(total)}</strong>
      </p>
      {coupleBudget ? (
        <p className={styles.rowMeta}>{total <= coupleBudget ? `Dans le budget indiqué (${euros(coupleBudget)}).` : `${euros(total - coupleBudget)} au-dessus du budget indiqué : adaptez la durée ou les options plutôt que vos prix.`}</p>
      ) : null}

      {previous && (
        <div className={p.diff}>
          <p className={p.kind}>Ce que verra le couple par rapport à la version {previous.version}</p>
          {changes.length ? (
            <ul>
              {changes.map((c) => (
                <li key={c.label + c.kind}>
                  <span>{c.kind === "retire" ? `${c.label} : retiré` : c.kind === "ajoute" ? `${c.label} : ajouté` : c.to === c.label ? `${c.label} : prix ajusté` : `${c.label} → ${c.to}`}</span>
                  <span>{signed(c.delta)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.rowMeta}>Aucun changement pour l&apos;instant.</p>
          )}
        </div>
      )}

      <label className="field">
        Message au couple (facultatif)
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ce que j'ai ajusté, et pourquoi…" />
      </label>
      <label className={p.optional}>
        <input type="checkbox" checked={hold} onChange={(e) => setHold(e.target.checked)} />
        Bloquer la date {DATE_HOLD_HOURS} h pour ce couple, le temps qu&apos;il décide
      </label>
      <p className={styles.small}>L&apos;offre reste valable {OFFER_VALIDITY_DAYS} jours. Les versions précédentes restent consultables par le couple.</p>

      <div className={p.builderActions}>
        <button type="submit" className="btn" disabled={!ready}>
          {submitLabel}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
}
