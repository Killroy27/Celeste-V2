"use client";

import Link from "next/link";
import { useState } from "react";
import { needsSignature, payInstallment } from "@/lib/booking";
import { DEPOSIT_RATE, MAX_INSTALLMENTS } from "@/lib/settings";
import { budgetFor, daysUntil, euros, formatDay, vendorName, VENDOR_STATUSES, useWedding, type Payment } from "@/lib/wedding";
import { CardForm } from "../../CardForm";
import { DateBadge, Modal, StatusChip } from "../../ui";
import { Meter, MeterLegend } from "./Meter";
import styles from "../../espace.module.css";
import b from "./budget.module.css";

const EXPENSE_CATEGORIES = ["Tenues", "Bijoux", "Papeterie", "Cadeaux invités", "Voyage de noces", "Autre"];

// Budget central (CDC §15.1) : total, par poste, engagé, payé, reste à payer, dépenses hors Céleste.
// Chiffres calculés depuis le projet : accepter une offre ou régler une échéance met le budget à jour (§3).
export function Budget() {
  const { wedding: w, update, newId } = useWedding();
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [paying, setPaying] = useState<Payment | null>(null);
  const [paidId, setPaidId] = useState<string | null>(null);
  if (!w) return null;

  const budget = budgetFor(w);
  const over = budget.engaged > budget.total;
  const payments = [...w.payments].sort((x, y) => x.due.localeCompare(y.due));

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Math.round(Number(amount.replace(",", ".")));
    if (!label.trim() || !(value > 0)) return;
    update((x) => ({ ...x, expenses: [...x.expenses, { id: newId(), label: label.trim(), category, amount: value, paid: false }] }));
    setLabel("");
    setAmount("");
  };

  const statusOf = (l: { status?: string }) => VENDOR_STATUSES.find((s) => s.value === l.status)?.label;

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Budget</h1>
          <p className={styles.lead}>Vos réservations Céleste et vos dépenses faites ailleurs, au même endroit.</p>
        </div>
      </header>

      {/* Synthèse : chiffres clés + une barre « meter » sur le budget total */}
      <section className={`${styles.card} ${b.summary}`} aria-labelledby="sum-t">
        <h2 id="sum-t" className="visually-hidden">
          Synthèse du budget
        </h2>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Budget total</span>
            <span className={styles.statValue}>{euros(budget.total)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Engagé</span>
            <span className={styles.statValue}>{euros(budget.engaged)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Payé</span>
            <span className={styles.statValue}>{euros(budget.paid)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Reste à payer</span>
            <span className={styles.statValue}>{euros(budget.toPay)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>{over ? "Dépassement" : "Encore disponible"}</span>
            <span className={styles.statValue}>{euros(Math.abs(budget.available))}</span>
          </div>
        </div>
        <Meter
          size="lg"
          max={budget.total}
          label={`Budget de ${euros(budget.total)} : ${euros(budget.paid)} payés, ${euros(budget.toPay)} engagés restant à payer, ${euros(Math.max(0, budget.available))} disponibles.`}
          segments={[
            { label: "Payé", value: budget.paid, tone: "paid" },
            { label: "Engagé, reste à payer", value: budget.toPay, tone: "engaged" },
          ]}
        />
        <MeterLegend />
        {over && (
          <p className={b.overrun} role="status">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 3 2 21h20zM12 10v5M12 18v.5" />
            </svg>
            Vos engagements dépassent le budget de {euros(budget.engaged - budget.total)}. Ajustez le budget dans votre profil, ou demandez une offre adaptée à un prestataire.
          </p>
        )}
      </section>

      <div className={styles.grid} style={{ marginTop: 20 }}>
        {/* Par poste : une barre par prestataire, rapportée au montant prévu */}
        <section className={`${styles.card} ${styles.span12}`} aria-labelledby="lines-t">
          <div className={styles.cardHead}>
            <h2 id="lines-t" className={styles.sectionTitle}>
              Par poste
            </h2>
            <span className={styles.small}>Prévu : part indicative de votre budget pour chaque métier</span>
          </div>
          <ul className={b.lines}>
            {budget.lines.map((l) => {
              const exceed = l.engaged - l.planned;
              return (
                <li key={l.key} className={b.line}>
                  <div className={b.lineName}>
                    <strong>{l.label}</strong>
                    {statusOf(l) && <StatusChip status={statusOf(l)!} />}
                  </div>
                  <Meter
                    max={l.planned}
                    label={`${l.label} : ${euros(l.paid)} payés, ${euros(l.engaged)} engagés pour ${euros(l.planned)} prévus.`}
                    segments={[
                      { label: "Payé", value: l.paid, tone: "paid" },
                      { label: "Engagé, reste à payer", value: l.engaged - l.paid, tone: "engaged" },
                    ]}
                  />
                  <p className={b.figures}>
                    <strong>{l.engaged ? euros(l.engaged) : "Rien d'engagé"}</strong>
                    {exceed > 0 ? `${euros(exceed)} au-dessus des ${euros(l.planned)} prévus` : `sur ${euros(l.planned)} prévus`}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Dépenses hors Céleste (§15.1) */}
        <section className={`${styles.card} ${styles.span7}`} aria-labelledby="ext-t">
          <div className={styles.cardHead}>
            <h2 id="ext-t" className={styles.sectionTitle}>
              Dépenses hors Céleste
            </h2>
          </div>
          <p className={styles.rowMeta}>Robe, alliances, voyage de noces… Ajoutez-les pour que votre budget reste réaliste.</p>
          {budget.externalLines.length ? (
            <ul className={b.lines} style={{ marginTop: 8 }}>
              {w.expenses.map((e) => (
                <li key={e.id} className={b.line} style={{ gridTemplateColumns: "1fr auto" }}>
                  <div className={b.lineName}>
                    <strong>{e.label}</strong>
                    <span className={styles.small}>{e.category}</span>
                  </div>
                  <div>
                    <p className={b.figures}>
                      <strong>{euros(e.amount)}</strong>
                    </p>
                    <div className={b.lineActions}>
                      <label>
                        <input
                          type="checkbox"
                          checked={e.paid}
                          onChange={() => update((x) => ({ ...x, expenses: x.expenses.map((y) => (y.id === e.id ? { ...y, paid: !y.paid } : y)) }))}
                        />
                        Payé
                      </label>
                      <button type="button" className={styles.iconBtn} onClick={() => update((x) => ({ ...x, expenses: x.expenses.filter((y) => y.id !== e.id) }))} aria-label={`Supprimer : ${e.label}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                          <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.empty} style={{ marginTop: 12 }}>
              <p>Aucune dépense ajoutée. Une robe achetée ailleurs ? Ajoutez-la ci-dessous.</p>
            </div>
          )}
          <form className={styles.inline} onSubmit={addExpense}>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Dépense, par exemple : robe" aria-label="Libellé de la dépense" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Catégorie">
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="Montant en €" aria-label="Montant en euros" style={{ flexBasis: 120 }} />
            <button type="submit" className="btn btn-sm">
              Ajouter
            </button>
          </form>
        </section>

        {/* Échéancier : paiement en une fois ou acompte puis 1 à 3 échéances (§14.1) */}
        <section className={`${styles.card} ${styles.span5}`} aria-labelledby="pay-t">
          <div className={styles.cardHead}>
            <h2 id="pay-t" className={styles.sectionTitle}>
              Échéancier
            </h2>
          </div>
          <p className={styles.rowMeta}>
            Par défaut : paiement en une fois, ou {Math.round(DEPOSIT_RATE * 100)} % d&apos;acompte puis le solde en 1 à {MAX_INSTALLMENTS} échéances.
          </p>
          {payments.length ? (
            <ul className={styles.list} style={{ marginTop: 8 }}>
              {payments.map((p) => {
                const late = !p.paid && daysUntil(p.due) < 0;
                return (
                  <li key={p.id} className={styles.row}>
                    <DateBadge iso={p.due} />
                    <div>
                      <p className={styles.rowTitle}>
                        {euros(p.amount)} · {vendorName(p.vendorSlug)}
                      </p>
                      <p className={styles.rowMeta}>
                        {p.label} · {p.paid ? `réglé` : `avant le ${formatDay(p.due)}`}
                      </p>
                      {!p.paid && needsSignature(w, p.vendorSlug) ? (
                        <Link href={`/espace/reservation/${p.vendorSlug}`} className={b.payAction}>
                          Signer le contrat avant de payer
                        </Link>
                      ) : !p.paid && (
                        <button
                          type="button"
                          className={b.payAction}
                          onClick={() => {
                            setPaidId(null);
                            setPaying(p);
                          }}
                        >
                          Payer maintenant
                        </button>
                      )}
                    </div>
                    <StatusChip status={p.paid ? "Payé" : late ? "En retard" : "Paiement à venir"} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className={styles.empty} style={{ marginTop: 12 }}>
              <p>Aucun paiement prévu. L&apos;échéancier se remplit quand vous réservez un prestataire.</p>
            </div>
          )}
        </section>

        {/* Vue tableau : chaque valeur lisible sans survol (méthode dataviz, accessibilité) */}
        <section className={`${styles.card} ${styles.span12}`}>
          <details className={b.tableView}>
            <summary>Voir le budget en tableau</summary>
            <table className={b.table}>
              <thead>
                <tr>
                  <th scope="col">Poste</th>
                  <th scope="col">Prévu</th>
                  <th scope="col">Engagé</th>
                  <th scope="col">Payé</th>
                  <th scope="col">Reste à payer</th>
                </tr>
              </thead>
              <tbody>
                {[...budget.lines, ...budget.externalLines].map((l) => (
                  <tr key={l.key}>
                    <th scope="row" style={{ fontWeight: 400, fontSize: 14, color: "var(--ink)" }}>
                      {l.label}
                      {l.external ? " (hors Céleste)" : ""}
                    </th>
                    <td>{euros(l.planned)}</td>
                    <td>{euros(l.engaged)}</td>
                    <td>{euros(l.paid)}</td>
                    <td>{euros(l.engaged - l.paid)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td>{euros(budget.total)}</td>
                  <td>{euros(budget.engaged)}</td>
                  <td>{euros(budget.paid)}</td>
                  <td>{euros(budget.toPay)}</td>
                </tr>
              </tfoot>
            </table>
          </details>
        </section>
      </div>

      {/* Règlement d'une échéance (§14.1), même formulaire que la réservation. */}
      <Modal open={!!paying} onClose={() => setPaying(null)} labelledBy="paydlg-t">
        {paying && (
          <div className={b.payDialog}>
            <h2 id="paydlg-t" className={styles.sectionTitle}>
              {paidId ? "Paiement effectué" : `Régler ${paying.label.toLowerCase()}`}
            </h2>
            <p className={styles.rowMeta}>
              {vendorName(paying.vendorSlug)} · {euros(paying.amount)}
              {paidId ? ". La facture est dans vos documents." : `, à régler avant le ${formatDay(paying.due)}.`}
            </p>
            {paidId ? (
              <button type="button" className="btn btn-block" onClick={() => setPaying(null)}>
                Fermer
              </button>
            ) : (
              <CardForm
                submitLabel={`Payer ${euros(paying.amount)}`}
                onPaid={(last4) => {
                  update((x) => payInstallment(x, paying.id, last4));
                  setPaidId(paying.id);
                }}
              />
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
