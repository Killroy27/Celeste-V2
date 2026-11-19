"use client";

import Link from "next/link";
import { formatDate, formatDay, vendorName, useWedding, type DocKind } from "@/lib/wedding";
import { StatusChip } from "../../ui";
import styles from "../../espace.module.css";

const KINDS: DocKind[] = ["Contrat", "Devis", "Facture"];

// Documents (CDC §5.3, §13.1) : chaque réservation dépose ses documents ici, sans ressaisie.
export function Documents() {
  const { wedding: w } = useWedding();
  if (!w) return null;

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Documents</h1>
          <p className={styles.lead}>Offres, contrats et factures, rangés automatiquement à chaque étape.</p>
        </div>
      </header>

      {w.documents.length ? (
        <div className={styles.grid}>
          {KINDS.map((kind) => {
            const docs = w.documents.filter((d) => d.kind === kind).sort((a, b) => b.date.localeCompare(a.date));
            return (
              <section key={kind} className={`${styles.card} ${styles.span12}`} aria-labelledby={`doc-${kind}`}>
                <div className={styles.cardHead}>
                  <h2 id={`doc-${kind}`} className={styles.sectionTitle}>
                    {kind === "Devis" ? "Offres reçues" : `${kind}s`}
                  </h2>
                  <span className={styles.small}>{docs.length}</span>
                </div>
                {docs.length ? (
                  <ul className={styles.list}>
                    {docs.map((d) => (
                      <li key={d.id} className={styles.row}>
                        <span className={styles.rowDate} aria-hidden="true">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                            <path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" />
                          </svg>
                        </span>
                        <div>
                          <p className={styles.rowTitle}>{d.label}</p>
                          <p className={styles.rowMeta}>
                            {vendorName(d.vendorSlug)} · {formatDate(d.date)}
                            {d.signedBy && ` · signé par ${d.signedBy}${d.signedAt ? ` le ${formatDay(d.signedAt)}` : ""}`}
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {/* La signature se fait dans le parcours de réservation, contrat sous les yeux (§13.1). */}
                          {d.status === "À signer" && (
                            <Link href={`/espace/reservation/${d.vendorSlug}`} className="btn btn-sm">
                              Lire et signer
                            </Link>
                          )}
                          <StatusChip status={d.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.rowMeta}>Aucun document de ce type pour l&apos;instant.</p>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>Vos offres, contrats et factures apparaîtront ici dès votre première réservation.</p>
          <Link href="/decouvrir" className="btn btn-sm">
            Découvrir les prestataires
          </Link>
        </div>
      )}
    </>
  );
}
