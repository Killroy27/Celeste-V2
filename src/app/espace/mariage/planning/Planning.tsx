"use client";

import { useState } from "react";
import { answerSlot as answer } from "@/lib/deal";
import { formatDay, formatTime, isoDate, tasksFor, timelineFor, useWedding, type Task } from "@/lib/wedding";
import { DateBadge, StatusChip } from "../../ui";
import styles from "../../espace.module.css";
import p from "./planning.module.css";

// Planning : agenda (une seule source pour rendez-vous, paiements et tâches, CDC §15.3)
// et checklist générée selon le projet, modifiable par le couple (§15.2).
export function Planning() {
  const { wedding: w, update, newId } = useWedding();
  const [label, setLabel] = useState("");
  const [due, setDue] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  if (!w) return null;

  const today = isoDate();
  const tasks = tasksFor(w);
  const agenda = timelineFor(w, new Date(), tasks);
  const todo = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const removedCount = Object.values(w.taskState).filter((s) => s.removed).length;

  // Visite / rendez-vous (§12) : le couple accepte le créneau alternatif ou en redemande un.
  // La réponse part aussi dans la conversation, comme si elle avait été donnée depuis la messagerie.
  const answerSlot = (id: string, accept: boolean, chosen?: string) => update((x) => answer(x, id, accept, new Date(), chosen));

  const setTask = (t: Task, patch: { done?: boolean; removed?: boolean; label?: string }) =>
    update((x) =>
      t.generated
        ? { ...x, taskState: { ...x.taskState, [t.id]: { ...x.taskState[t.id], ...patch } } }
        : patch.removed
          ? { ...x, customTasks: x.customTasks.filter((c) => c.id !== t.id) }
          : { ...x, customTasks: x.customTasks.map((c) => (c.id === t.id ? { ...c, ...patch } : c)) },
    );

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    update((x) => ({ ...x, customTasks: [...x.customTasks, { id: newId(), label: label.trim(), due: due || x.date, done: false }] }));
    setLabel("");
    setDue("");
  };

  const restore = () =>
    update((x) => ({ ...x, taskState: Object.fromEntries(Object.entries(x.taskState).map(([k, v]) => [k, { ...v, removed: false }])) }));

  const renderTask = (t: Task) => {
    const late = !t.done && t.due < today;
    return (
      <li key={t.id} className={p.task}>
        <input type="checkbox" className={p.check} checked={t.done} onChange={() => setTask(t, { done: !t.done })} aria-label={`${t.done ? "Décocher" : "Cocher"} : ${t.label}`} />
        <div>
          {editing === t.id ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const v = new FormData(e.currentTarget).get("label")?.toString().trim();
                if (v) setTask(t, { label: v });
                setEditing(null);
              }}
            >
              <input name="label" defaultValue={t.label} className={p.rename} autoFocus onBlur={(e) => e.currentTarget.form?.requestSubmit()} aria-label="Nouveau libellé" />
            </form>
          ) : (
            <p className={`${styles.rowTitle} ${t.done ? p.doneLabel : ""}`}>{t.label}</p>
          )}
          <p className={styles.rowMeta}>
            {t.done ? "Fait" : `Avant le ${formatDay(t.due)}`}
            {t.generated ? " · proposée par Céleste" : " · ajoutée par vous"}
          </p>
        </div>
        <div className={p.taskActions}>
          {late && <StatusChip status="En retard" />}
          {t.important && !t.done && !late && <span className={`${styles.status} ${styles.sActive}`}>Importante</span>}
          <button type="button" className={styles.iconBtn} onClick={() => setEditing(t.id)} aria-label={`Renommer : ${t.label}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4" />
            </svg>
          </button>
          <button type="button" className={styles.iconBtn} onClick={() => setTask(t, { removed: true })} aria-label={`Supprimer : ${t.label}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className={styles.grid}>
      <section className={`${styles.card} ${styles.span7}`} aria-labelledby="todo-t">
        <div className={styles.cardHead}>
          <h1 id="todo-t" className={styles.sectionTitle}>
            Checklist
          </h1>
          <span className={styles.small}>
            {done.length} sur {tasks.length} faites
          </span>
        </div>
        <p className={styles.rowMeta}>
          Céleste propose ces tâches selon votre date, votre cérémonie, vos {w.guests} invités et vos réservations. Ajoutez, renommez ou retirez ce que vous voulez.
        </p>

        <form className={styles.inline} onSubmit={add}>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nouvelle tâche, par exemple : choisir les alliances" aria-label="Nouvelle tâche" />
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Échéance" />
          <button type="submit" className="btn btn-sm">
            Ajouter
          </button>
        </form>

        {todo.length ? (
          <ul className={p.tasks}>
            {todo.map(renderTask)}
          </ul>
        ) : (
          <div className={styles.empty} style={{ marginTop: 16 }}>
            <p>Toutes les tâches sont faites. Il ne reste qu&apos;à profiter.</p>
          </div>
        )}

        {done.length > 0 && (
          <details className={p.doneGroup}>
            <summary>Tâches faites ({done.length})</summary>
            <ul className={p.tasks}>
              {done.map(renderTask)}
            </ul>
          </details>
        )}
        {removedCount > 0 && (
          <button type="button" className={`${styles.more} ${p.restore}`} onClick={restore}>
            Rétablir les {removedCount} tâches Céleste retirées
          </button>
        )}
      </section>

      <section className={`${styles.card} ${styles.span5}`} aria-labelledby="agenda-t">
        <div className={styles.cardHead}>
          <h2 id="agenda-t" className={styles.sectionTitle}>
            Agenda
          </h2>
          <span className={styles.small}>Rendez-vous, paiements, tâches clés</span>
        </div>
        {agenda.length ? (
          <ul className={styles.list}>
            {agenda.map((it) => (
              <li key={it.id} className={styles.row} style={{ alignItems: "start" }}>
                <DateBadge iso={it.date} />
                <div>
                  <p className={styles.rowTitle}>{it.title}</p>
                  <p className={styles.rowMeta}>{it.detail}</p>
                  {it.status && (
                    <div style={{ marginTop: 8 }}>
                      <StatusChip status={it.status} />
                    </div>
                  )}
                  {it.status === "Créneau alternatif proposé" && (
                    <div className={p.slotActions}>
                      {(() => {
                        const alts = w.appointments.find((x) => x.id === it.id)?.alternatives ?? [];
                        return alts.length > 1 ? (
                          alts.map((alt) => (
                            <button key={alt} type="button" className="btn btn-sm" onClick={() => answerSlot(it.id, true, alt)}>
                              {formatDay(alt)} à {formatTime(alt)}
                            </button>
                          ))
                        ) : (
                          <button type="button" className="btn btn-sm" onClick={() => answerSlot(it.id, true)}>
                            Accepter ce créneau
                          </button>
                        );
                      })()}
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => answerSlot(it.id, false)}>
                        Demander un autre créneau
                      </button>
                    </div>
                  )}
                </div>
                <span />
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <p>Rien de prévu pour l&apos;instant. Vos visites, dégustations et échéances apparaîtront ici automatiquement.</p>
          </div>
        )}
      </section>
    </div>
  );
}
