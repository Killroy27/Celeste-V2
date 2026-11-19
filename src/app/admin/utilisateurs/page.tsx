"use client";

import { coupleNames, offerOf } from "@/lib/deal";
import { formatDate } from "@/lib/format";
import { PRO_SLUG, usePro } from "@/lib/pro";
import { isBookedStatus, useWedding, type Wedding } from "@/lib/wedding";
import { useAdmin } from "@/lib/admin";
import styles from "../../espace/espace.module.css";
import { Guard, useAsk } from "../AdminShell";
import a from "../admin.module.css";

type Row = { id: string; name: string; email: string; date: string; vendors: number; booked: number; source: string };

// Utilisateurs (CDC §20.1, §26) : les couples, leur avancement, et les demandes liées aux données personnelles.
export default function AdminUsers() {
  const { wedding } = useWedding();
  const { pro } = usePro();
  const { admin } = useAdmin();
  const ask = useAsk();
  const row = (id: string, w: Wedding, source: string, onlyPro = false): Row => ({
    id,
    name: coupleNames(w),
    email: w.email,
    date: w.date,
    vendors: onlyPro ? 1 : w.conversations.length,
    booked: onlyPro ? (offerOf(w, PRO_SLUG)?.status === "confirmee" ? 1 : 0) : w.vendors.filter((v) => isBookedStatus(v.status)).length,
    source,
  });
  const rows: Row[] = [...(wedding ? [row("couple", wedding, "Espace couple")] : []), ...(pro?.clients.map((c) => row(c.id, c.w, "Client de Studio Aube", true)) ?? [])];

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Utilisateurs</h1>
          <p className={styles.lead}>Les couples et l&apos;avancement de leur projet.</p>
        </div>
      </header>
      <Guard section="utilisateurs">
        <section className={styles.card} aria-label="Couples">
          {rows.length ? (
            <div className={a.scrollX}>
              <table className={a.grid}>
                <thead>
                  <tr>
                    <th scope="col">Couple</th>
                    <th scope="col">E-mail</th>
                    <th scope="col">Mariage</th>
                    <th scope="col" className={a.num}>
                      Prestataires contactés
                    </th>
                    <th scope="col" className={a.num}>
                      Réservés
                    </th>
                    <th scope="col">Origine</th>
                    <th scope="col">
                      <span className="visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td className={a.muted}>{r.email}</td>
                      <td>{formatDate(r.date)}</td>
                      <td className={a.num}>{r.vendors}</td>
                      <td className={a.num}>{r.booked}</td>
                      <td className={a.muted}>{r.source}</td>
                      <td>
                        <button type="button" className={a.textBtn} onClick={() => ask({ action: "Export des données personnelles", target: r.name, confirm: "Préparer l'export", hint: "Export transmis à l'utilisateur, selon les obligations applicables (§26)." })}>
                          Exporter les données
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.rowMeta}>Aucun couple sur cet appareil. Ouvrez l&apos;espace couple ou l&apos;espace prestataire de démonstration.</p>
          )}
          {admin && <p className={styles.small} style={{ marginTop: 12 }}>Les demandes d&apos;export ou de suppression arrivent aussi par le support.</p>}
        </section>
      </Guard>
    </>
  );
}
