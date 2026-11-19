"use client";

import { useState } from "react";
import { isoDate } from "@/lib/format";
import p from "./pro.module.css";

const MAX = 3;

// Proposer un ou plusieurs créneaux alternatifs (CDC §12) : le couple choisit celui qui lui convient.
export function SlotProposer({ defaultDate, onPropose, onCancel }: { defaultDate: string; onPropose: (alts: string[]) => void; onCancel: () => void }) {
  const [rows, setRows] = useState([{ date: defaultDate, time: "18:00" }]);
  const set = (i: number, patch: Partial<{ date: string; time: string }>) => setRows((r) => r.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  return (
    <form
      className={p.slots}
      onSubmit={(e) => {
        e.preventDefault();
        onPropose([...new Set(rows.filter((r) => r.date && r.time).map((r) => `${r.date}T${r.time}`))]);
      }}
    >
      {rows.map((r, i) => (
        <div key={i} className={p.altForm}>
          <input type="date" required min={isoDate()} value={r.date} onChange={(e) => set(i, { date: e.target.value })} aria-label={`Date du créneau ${i + 1}`} />
          <input type="time" required step={900} value={r.time} onChange={(e) => set(i, { time: e.target.value })} aria-label={`Heure du créneau ${i + 1}`} />
          {rows.length > 1 && (
            <button type="button" className={p.textBtn} onClick={() => setRows((x) => x.filter((_, k) => k !== i))} aria-label={`Retirer le créneau ${i + 1}`}>
              Retirer
            </button>
          )}
        </div>
      ))}
      <div className={p.rdvActions}>
        {rows.length < MAX && (
          <button type="button" className={p.textBtn} onClick={() => setRows((x) => [...x, { date: x[x.length - 1].date, time: "11:00" }])}>
            Ajouter un créneau
          </button>
        )}
        <button type="submit" className="btn btn-sm">
          Proposer {rows.length > 1 ? `ces ${rows.length} créneaux` : "ce créneau"}
        </button>
        <button type="button" className={p.textBtn} onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
}
