"use client";

import { useMemo, useState } from "react";
import { addDays, isoDate, parseDate } from "@/lib/format";
import styles from "./SlotPicker.module.css";

const HOURS = ["10:00", "11:00", "14:00", "15:00", "16:30", "18:00"];
const weekday = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
const month = new Intl.DateTimeFormat("fr-FR", { month: "short" });
const hourLabel = (h: string) => (h.endsWith(":00") ? `${Number(h.slice(0, 2))} h` : `${Number(h.slice(0, 2))} h ${h.slice(3)}`);

// Choix d'un créneau en pastilles (benchmark Airbnb/Fresha) : une bande de jours, puis les heures.
// « Autre date » et « Autre heure » ouvrent les champs natifs pour les cas hors liste.
// Les valeurs partent dans le formulaire parent via deux champs cachés (dateName, timeName).
export function SlotPicker({ dateName, timeName, days = 14, defaultTime = "15:00", dateLabel = "Jour" }: { dateName: string; timeName: string; days?: number; defaultTime?: string; dateLabel?: string }) {
  const tomorrow = useMemo(() => addDays(isoDate(), 1), []);
  const strip = useMemo(() => Array.from({ length: days }, (_, i) => addDays(tomorrow, i)), [tomorrow, days]);
  const [date, setDate] = useState(tomorrow);
  const [otherDate, setOtherDate] = useState(false);
  const [time, setTime] = useState(defaultTime);
  const [otherTime, setOtherTime] = useState(!HOURS.includes(defaultTime));

  return (
    <div className={styles.picker}>
      <input type="hidden" name={dateName} value={date} />
      <input type="hidden" name={timeName} value={time} />

      <span className={styles.label} id={`${dateName}-l`}>
        {dateLabel}
      </span>
      <div className={styles.days} role="radiogroup" aria-labelledby={`${dateName}-l`}>
        {strip.map((d) => {
          const day = parseDate(d);
          const on = !otherDate && date === d;
          return (
            <button key={d} type="button" role="radio" aria-checked={on} className={styles.day} onClick={() => {
                setOtherDate(false);
                setDate(d);
              }}>
              <small>{weekday.format(day)}</small>
              <strong>{day.getDate()}</strong>
              <small>{month.format(day)}</small>
            </button>
          );
        })}
        <button type="button" role="radio" aria-checked={otherDate} className={`${styles.day} ${styles.other}`} onClick={() => setOtherDate(true)}>
          Autre
          <br />
          date
        </button>
      </div>
      {otherDate && (
        <input
          type="date"
          className={styles.native}
          aria-label="Choisir une autre date"
          min={tomorrow}
          value={date}
          required
          autoFocus
          onChange={(e) => e.target.value && setDate(e.target.value)}
        />
      )}

      <span className={styles.label} id={`${timeName}-l`}>
        Heure
      </span>
      <div className={styles.hours} role="radiogroup" aria-labelledby={`${timeName}-l`}>
        {HOURS.map((h) => (
          <button key={h} type="button" role="radio" aria-checked={!otherTime && time === h} className={styles.hour} onClick={() => {
              setOtherTime(false);
              setTime(h);
            }}>
            {hourLabel(h)}
          </button>
        ))}
        <button type="button" role="radio" aria-checked={otherTime} className={styles.hour} onClick={() => setOtherTime(true)}>
          Autre heure
        </button>
      </div>
      {otherTime && (
        <input type="time" className={styles.native} aria-label="Choisir une autre heure" step={900} value={time} required onChange={(e) => e.target.value && setTime(e.target.value)} />
      )}
    </div>
  );
}
