"use client";

import Link from "next/link";
import { euros, formatDate, formatDay, isoDate } from "@/lib/format";
import { dealName, dealPayments, useDeals } from "@/lib/pro";
import { DateBadge, StatusChip } from "../../espace/ui";
import styles from "../../espace/espace.module.css";

// Paiements (CDC §14, §16.1). On affiche ce que les couples ont réglé et ce qui est attendu.
// Délai de reversement (cible J+72 h, §14.2) et commission (§21) dépendent de validations juridiques et
// fiscales (§32) : aucun chiffre n'est affiché tant qu'ils ne sont pas confirmés.
export function Paiements() {
  const { deals } = useDeals();
  const today = isoDate();
  const rows = deals.flatMap((d) => dealPayments(d).map((p) => ({ p, d }))).sort((a, b) => b.p.due.localeCompare(a.p.due));
  const received = rows.filter((r) => r.p.paid);
  const expected = rows.filter((r) => !r.p.paid).sort((a, b) => a.p.due.localeCompare(b.p.due));
  const sum = (list: typeof rows) => list.reduce((s, r) => s + r.p.amount, 0);
  const past = deals.filter((d) => d.w.date < today && dealPayments(d).some((p) => p.paid));

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Paiements</h1>
          <p className={styles.lead}>Ce que vos couples ont réglé via Céleste, et ce qui arrive.</p>
        </div>
      </header>

      <div className={styles.grid}>
        <section className={`${styles.card} ${styles.span12}`} aria-label="Synthèse">
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{euros(sum(received))}</span>
              <span className={styles.statLabel}>Réglés par les couples</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{euros(sum(expected))}</span>
              <span className={styles.statLabel}>Échéances à venir</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{expected[0] ? formatDay(expected[0].p.due) : "Aucune"}</span>
              <span className={styles.statLabel}>Prochaine échéance</span>
            </div>
          </div>
          <p className={styles.rowMeta} style={{ marginTop: 14 }}>
            Les sommes réglées par les couples vous sont reversées après la prestation. Le délai exact de reversement et la commission Céleste sont en cours de validation : ils seront indiqués ici avant le lancement.
          </p>
        </section>

        <section className={`${styles.card} ${styles.span7}`} aria-labelledby="exp-t">
          <div className={styles.cardHead}>
            <h2 id="exp-t" className={styles.sectionTitle}>
              Échéances à venir
            </h2>
          </div>
          {expected.length ? (
            <ul className={styles.list}>
              {expected.map(({ p, d }) => (
                <li key={p.id} className={styles.row}>
                  <DateBadge iso={p.due} />
                  <div>
                    <p className={styles.rowTitle}>
                      {euros(p.amount)} · <Link href={`/espace-pro/messages?d=${d.id}`}>{dealName(d)}</Link>
                    </p>
                    <p className={styles.rowMeta}>
                      {p.label} · mariage le {formatDate(d.w.date)}
                    </p>
                  </div>
                  <StatusChip status={p.due < today ? "En retard" : "À venir"} />
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.rowMeta}>Aucune échéance à venir.</p>
          )}
        </section>

        <section className={`${styles.card} ${styles.span5}`} aria-labelledby="rev-t">
          <div className={styles.cardHead}>
            <h2 id="rev-t" className={styles.sectionTitle}>
              Prestations réalisées
            </h2>
          </div>
          <p className={styles.rowMeta}>Mariages passés dont le reversement suit la prestation.</p>
          {past.length ? (
            <ul className={styles.list}>
              {past.map((d) => (
                <li key={d.id} className={styles.row}>
                  <DateBadge iso={d.w.date} />
                  <div>
                    <p className={styles.rowTitle}>{dealName(d)}</p>
                    <p className={styles.rowMeta}>{euros(dealPayments(d).filter((p) => p.paid).reduce((s, p) => s + p.amount, 0))} réglés par le couple</p>
                  </div>
                  <StatusChip status="Terminé" />
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.rowMeta}>Aucune pour l&apos;instant.</p>
          )}
        </section>

        <section className={`${styles.card} ${styles.span12}`} aria-labelledby="hist-t">
          <div className={styles.cardHead}>
            <h2 id="hist-t" className={styles.sectionTitle}>
              Paiements reçus
            </h2>
          </div>
          {received.length ? (
            <ul className={styles.list}>
              {received.map(({ p, d }) => (
                <li key={p.id} className={styles.row}>
                  <DateBadge iso={(p.paidAt ?? p.due).slice(0, 10)} />
                  <div>
                    <p className={styles.rowTitle}>
                      {euros(p.amount)} · {dealName(d)}
                    </p>
                    <p className={styles.rowMeta}>
                      {p.label}
                      {p.method ? ` · ${p.method}` : ""}
                    </p>
                  </div>
                  <StatusChip status="Encaissé" />
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.rowMeta}>Aucun paiement reçu pour l&apos;instant.</p>
          )}
        </section>
      </div>
    </>
  );
}
