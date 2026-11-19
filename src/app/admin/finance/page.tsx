"use client";

import { marketBookings, useAdmin } from "@/lib/admin";
import { getVendor } from "@/lib/content";
import { useDisputes } from "@/lib/disputes";
import { euros, formatDate, formatDay, formatTime, isoDate } from "@/lib/format";
import { usePro } from "@/lib/pro";
import { useWedding } from "@/lib/wedding";
import { StatusChip } from "../../espace/ui";
import styles from "../../espace/espace.module.css";
import { Guard, useAsk } from "../AdminShell";
import a from "../admin.module.css";

// Finance (CDC §20.4) : paiements des couples, échecs, reversements, remboursements, gels liés aux litiges.
// Commission (§21.1), frais de service couple (§21.2), frais PSP (§21.3) et délai de reversement (§14.2)
// restent « à valider » : le front ne les calcule pas tant que juriste et expert-comptable n'ont pas tranché (§32).
export default function AdminFinance() {
  const { admin } = useAdmin();
  const { wedding } = useWedding();
  const { pro } = usePro();
  const ask = useAsk();
  const { disputes } = useDisputes();
  if (!admin) return null;
  const today = isoDate();
  const bookings = marketBookings(wedding, pro);
  const ledger = bookings.flatMap((b) => b.payments.map((p) => ({ p, b }))).sort((x, y) => y.p.due.localeCompare(x.p.due));
  const paid = ledger.filter((r) => r.p.paid).reduce((s, r) => s + r.p.amount, 0);
  const due = ledger.filter((r) => !r.p.paid).reduce((s, r) => s + r.p.amount, 0);
  const frozen = disputes.filter((d) => d.frozen && !d.decision);
  const refunds = disputes.filter((d) => d.decision && (d.decision.kind === "Remboursement total" || d.decision.kind === "Remboursement partiel"));
  const past = bookings.filter((b) => b.status === "Confirmée" && b.date < today);

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Finance</h1>
          <p className={styles.lead}>Encaissements, échéances, échecs, reversements et remboursements.</p>
        </div>
      </header>
      <Guard section="finance">
        <section className={a.kpis} aria-label="Synthèse financière">
          <div className={styles.stat}>
            <span className={styles.statValue}>{euros(paid)}</span>
            <span className={styles.statLabel}>Réglé par les couples</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{euros(due)}</span>
            <span className={styles.statLabel}>Échéances à venir</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{admin.failed.filter((f) => f.status === "Échoué").length}</span>
            <span className={styles.statLabel}>Paiements échoués</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{frozen.length}</span>
            <span className={styles.statLabel}>Reversements gelés (litige)</span>
          </div>
        </section>

        <div className={styles.grid} style={{ marginTop: 20 }}>
          <section className={`${styles.card} ${styles.span7}`} aria-labelledby="fail-t">
            <div className={styles.cardHead}>
              <h2 id="fail-t" className={styles.sectionTitle}>
                Paiements échoués
              </h2>
            </div>
            <ul className={styles.list}>
              {admin.failed.map((f) => (
                <li key={f.id} className={styles.row}>
                  <span className={`${a.dot} ${f.status === "Échoué" ? a.dotUrgent : ""}`} aria-hidden="true" />
                  <div>
                    <p className={styles.rowTitle}>
                      {f.couple} · {euros(f.amount)}
                    </p>
                    <p className={styles.rowMeta}>
                      {getVendor(f.vendorSlug)?.name} · {f.reason} · {formatDay(f.at)} à {formatTime(f.at)}
                    </p>
                    {f.status === "Échoué" && (
                      <button
                        type="button"
                        className={a.textBtn}
                        onClick={() => ask({ action: "Relance de paiement envoyée", target: `${f.couple} · ${euros(f.amount)}`, confirm: "Envoyer la relance" }, (x) => ({ ...x, failed: x.failed.map((y) => (y.id === f.id ? { ...y, status: "Relancé" } : y)) }))}
                      >
                        Relancer le couple
                      </button>
                    )}
                  </div>
                  <StatusChip status={f.status === "Échoué" ? "Paiement échoué" : "Relancé"} />
                </li>
              ))}
            </ul>
          </section>

          <section className={`${styles.card} ${styles.span5}`} aria-labelledby="rules-t">
            <h2 id="rules-t" className={styles.sectionTitle}>
              Frais et reversements
            </h2>
            <ul className={a.rules}>
              <li>
                <strong>Commission prestataire</strong>
                <span>À valider · référence 7 % des montants encaissés, structure juridique et fiscale en cours</span>
              </li>
              <li>
                <strong>Frais de service couple</strong>
                <span>À confirmer par la direction · non affichés</span>
              </li>
              <li>
                <strong>Frais du prestataire de paiement</strong>
                <span>Suivis séparément, hors commission</span>
              </li>
              <li>
                <strong>Délai de reversement</strong>
                <span>Cible J+72 h après l&apos;événement, sous réserve du PSP et du cadre juridique</span>
              </li>
            </ul>
            <p className={styles.small}>Non paramétrable tant que les validations du §32 ne sont pas faites.</p>
          </section>

          <section className={`${styles.card} ${a.half}`} aria-labelledby="pay-t">
            <h2 id="pay-t" className={styles.sectionTitle}>
              Reversements
            </h2>
            {past.length || frozen.length ? (
              <ul className={styles.list}>
                {frozen.map((d) => (
                  <li key={d.id} className={styles.row}>
                    <span className={`${a.dot} ${a.dotUrgent}`} aria-hidden="true" />
                    <div>
                      <p className={styles.rowTitle}>{getVendor(d.vendorSlug)?.name}</p>
                      <p className={styles.rowMeta}>
                        {euros(d.amount)} · litige {d.ref} avec {d.couple}
                      </p>
                    </div>
                    <StatusChip status="Gelé" />
                  </li>
                ))}
                {past.map((b) => (
                  <li key={b.id} className={styles.row}>
                    <span className={a.dot} aria-hidden="true" />
                    <div>
                      <p className={styles.rowTitle}>{getVendor(b.vendorSlug)?.name}</p>
                      <p className={styles.rowMeta}>
                        {euros(b.total)} · mariage du {formatDate(b.date)} avec {b.couple}
                      </p>
                    </div>
                    <StatusChip status="À programmer" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.rowMeta}>Aucun reversement à traiter.</p>
            )}
          </section>

          <section className={`${styles.card} ${a.half}`} aria-labelledby="ref-t">
            <h2 id="ref-t" className={styles.sectionTitle}>
              Remboursements
            </h2>
            {refunds.length ? (
              <ul className={styles.list}>
                {refunds.map((d) => (
                  <li key={d.id} className={styles.row}>
                    <span className={a.dot} aria-hidden="true" />
                    <div>
                      <p className={styles.rowTitle}>
                        {d.couple} · {d.decision!.kind}
                      </p>
                      <p className={styles.rowMeta}>
                        Litige {d.ref} · {d.decision!.note}
                      </p>
                    </div>
                    <StatusChip status="À exécuter" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.rowMeta}>Aucun remboursement décidé.</p>
            )}
          </section>

          <section className={`${styles.card} ${styles.span12}`} aria-labelledby="ledger-t">
            <h2 id="ledger-t" className={styles.sectionTitle}>
              Paiements des couples
            </h2>
            {ledger.length ? (
              <div className={a.scrollX}>
                <table className={a.grid}>
                  <thead>
                    <tr>
                      <th scope="col">Échéance</th>
                      <th scope="col">Couple</th>
                      <th scope="col">Prestataire</th>
                      <th scope="col">Libellé</th>
                      <th scope="col" className={a.num}>
                        Montant
                      </th>
                      <th scope="col">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map(({ p, b }) => (
                      <tr key={p.id}>
                        <td>{formatDay(p.due)}</td>
                        <td>{b.couple}</td>
                        <td>{getVendor(b.vendorSlug)?.name}</td>
                        <td className={a.muted}>
                          {p.label}
                          {p.method ? ` · ${p.method}` : ""}
                        </td>
                        <td className={a.num}>{euros(p.amount)}</td>
                        <td>
                          <StatusChip status={p.paid ? "Payé" : p.due < today ? "En retard" : "Paiement à venir"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.rowMeta}>Aucun paiement sur cet appareil.</p>
            )}
          </section>
        </div>
      </Guard>
    </>
  );
}
