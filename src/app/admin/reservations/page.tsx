"use client";

import { useState } from "react";
import { marketBookings } from "@/lib/admin";
import { getVendor } from "@/lib/content";
import { euros, formatDate } from "@/lib/format";
import { usePro } from "@/lib/pro";
import { useWedding } from "@/lib/wedding";
import { StatusChip } from "../../espace/ui";
import styles from "../../espace/espace.module.css";
import { Guard } from "../AdminShell";
import a from "../admin.module.css";

const FILTERS = ["Toutes", "Confirmées", "À finaliser"] as const;

// Réservations (CDC §20.1, §30.3) : toutes les réservations, offre acceptée ou acompte réglé.
export default function AdminReservations() {
  const { wedding } = useWedding();
  const { pro } = usePro();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Toutes");
  const all = marketBookings(wedding, pro);
  const list = all.filter((b) => filter === "Toutes" || (filter === "Confirmées" ? b.status === "Confirmée" : b.status === "Acceptée"));

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Réservations</h1>
          <p className={styles.lead}>Offres acceptées et réservations confirmées, avec l&apos;état des paiements.</p>
        </div>
      </header>
      <Guard section="reservations">
        <section className={styles.card} aria-label="Réservations">
          <div className={a.toolbar}>
            <div className={a.chips} role="group" aria-label="Filtrer">
              {FILTERS.map((f) => (
                <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          {list.length ? (
            <div className={a.scrollX}>
              <table className={a.grid}>
                <thead>
                  <tr>
                    <th scope="col">Couple</th>
                    <th scope="col">Prestataire</th>
                    <th scope="col">Mariage</th>
                    <th scope="col" className={a.num}>
                      Montant
                    </th>
                    <th scope="col" className={a.num}>
                      Réglé
                    </th>
                    <th scope="col">Statut</th>
                    <th scope="col">Origine</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((b) => (
                    <tr key={b.id}>
                      <td>{b.couple}</td>
                      <td>{getVendor(b.vendorSlug)?.name}</td>
                      <td>{formatDate(b.date)}</td>
                      <td className={a.num}>{euros(b.total)}</td>
                      <td className={a.num}>{euros(b.payments.filter((p) => p.paid).reduce((s, p) => s + p.amount, 0))}</td>
                      <td>
                        <StatusChip status={b.status === "Confirmée" ? "Réservation confirmée" : "Acceptée"} />
                      </td>
                      <td className={a.muted}>{b.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.rowMeta}>Aucune réservation. Ouvrez l&apos;espace couple ou l&apos;espace prestataire de démonstration pour en créer.</p>
          )}
        </section>
      </Guard>
    </>
  );
}
