"use client";

import Link from "next/link";
import { getVendor, vendors } from "@/lib/content";
import { DISPUTE_STEPS, marketBookings, openDisputes, useAdmin, vendorState } from "@/lib/admin";
import { coupleNames } from "@/lib/deal";
import { useDisputes } from "@/lib/disputes";
import { addDays, euros, formatDay, formatTime, isoDate, shortWhen } from "@/lib/format";
import { usePro } from "@/lib/pro";
import { useWedding } from "@/lib/wedding";
import { StatusChip } from "../espace/ui";
import styles from "../espace/espace.module.css";
import a from "./admin.module.css";

type Todo = { id: string; kind: string; title: string; detail: string; href: string; urgent?: boolean };

// Dashboard (CDC §20.2) : les chiffres, mais d'abord ce qui demande une intervention.
export function AdminDashboard() {
  const { admin } = useAdmin();
  const { wedding } = useWedding();
  const { pro } = usePro();
  const { disputes: allDisputes } = useDisputes();
  if (!admin) return null;
  const bookings = marketBookings(wedding, pro);
  const confirmed = bookings.filter((b) => b.status === "Confirmée");
  const today = isoDate();
  const soon = addDays(today, 30);
  const pendingPayments = bookings.flatMap((b) => b.payments).filter((p) => !p.paid && p.due <= soon);
  const couples = new Set([...(wedding ? [coupleNames(wedding)] : []), ...(pro?.clients.map((c) => coupleNames(c.w)) ?? []), ...allDisputes.map((d) => d.couple), ...admin.failed.map((f) => f.couple)]);
  const toVerify = Object.keys(admin.cases).filter((s) => vendorState(admin, s) === "À vérifier");
  const active = vendors.filter((v) => vendorState(admin, v.slug) !== "Suspendu").length;
  const disputes = openDisputes(allDisputes);

  const todos: Todo[] = [
    ...admin.failed.filter((f) => f.status === "Échoué").map((f) => ({ id: f.id, kind: "Paiement échoué", title: `${f.couple} · ${euros(f.amount)}`, detail: `${getVendor(f.vendorSlug)?.name} · ${f.reason}`, href: "/admin/finance", urgent: true })),
    ...disputes.map((d) => ({ id: d.id, kind: "Litige", title: `${d.ref} · ${d.couple} et ${getVendor(d.vendorSlug)?.name}`, detail: `Étape : ${DISPUTE_STEPS[d.step]}`, href: `/admin/support?vue=litiges&id=${d.id}`, urgent: d.step < 2 })),
    ...toVerify.slice(0, 4).map((s) => ({ id: s, kind: "Profil à vérifier", title: getVendor(s)?.name ?? s, detail: `${admin.cases[s].docs.filter((d) => d.status === "À vérifier").length} document(s) à contrôler`, href: `/admin/prestataires?p=${s}` })),
    ...admin.reviews.filter((r) => r.status === "Signalé").map((r) => ({ id: r.id, kind: "Avis signalé", title: `${r.author} sur ${getVendor(r.vendorSlug)?.name}`, detail: r.reason, href: "/admin/support?vue=avis" })),
    ...(pro && !pro.account
      ? Object.entries(pro.reports ?? {})
          .filter(([, r]) => r.status === "Signalé")
          .map(([i, r]) => ({ id: `pro-${i}`, kind: "Avis signalé", title: `Avis signalé par Studio Aube`, detail: r.reason, href: "/admin/support?vue=avis" }))
      : []),
    ...admin.tickets.filter((t) => t.status === "Ouvert").map((t) => ({ id: t.id, kind: `Support · ${t.role}`, title: t.subject, detail: `${t.from} · ${shortWhen(t.at)}`, href: "/admin/support?vue=tickets" })),
  ];

  const kpis = [
    { label: "Couples actifs", value: String(couples.size) },
    { label: "Prestataires actifs", value: String(active) },
    { label: "Réservations confirmées", value: String(confirmed.length) },
    { label: "Volume d'affaires", value: euros(confirmed.reduce((s, b) => s + b.total, 0)) },
    { label: "Commissions", value: "À valider", note: "Taux et base en cours de validation (§21, §32)" },
    { label: "Paiements sous 30 jours", value: String(pendingPayments.length) },
    { label: "Litiges ouverts", value: String(disputes.length) },
    { label: "Profils à vérifier", value: String(toVerify.length) },
  ];

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <p className={styles.eyebrow}>Back-office</p>
          <h1 className={styles.pageTitle}>Dashboard</h1>
        </div>
      </header>

      <section className={a.kpis} aria-label="Indicateurs">
        {kpis.map((k) => (
          <div key={k.label} className={styles.stat}>
            <span className={styles.statValue}>{k.value}</span>
            <span className={styles.statLabel}>{k.label}</span>
            {k.note && <span className={a.kpiNote}>{k.note}</span>}
          </div>
        ))}
      </section>

      <div className={styles.grid} style={{ marginTop: 20 }}>
        <section className={`${styles.card} ${styles.span8}`} aria-labelledby="todo-t">
          <div className={styles.cardHead}>
            <h2 id="todo-t" className={styles.sectionTitle}>
              Interventions à traiter
            </h2>
            <span className={styles.small}>{todos.length}</span>
          </div>
          {todos.length ? (
            <ul className={styles.list}>
              {todos.map((t) => (
                <li key={t.kind + t.id} className={styles.row}>
                  <span className={`${a.dot} ${t.urgent ? a.dotUrgent : ""}`} aria-hidden="true" />
                  <div>
                    <p className={a.kind}>
                      {t.kind}
                      {t.urgent && " · prioritaire"}
                    </p>
                    <p className={styles.rowTitle}>{t.title}</p>
                    <p className={styles.rowMeta}>{t.detail}</p>
                  </div>
                  <Link href={t.href} className="btn btn-sm btn-outline">
                    Traiter
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.empty}>
              <p>Rien à traiter pour l&apos;instant.</p>
            </div>
          )}
        </section>

        <section className={`${styles.card} ${styles.span4}`} aria-labelledby="audit-t">
          <div className={styles.cardHead}>
            <h2 id="audit-t" className={styles.sectionTitle}>
              Dernières actions
            </h2>
            <Link href="/admin/parametres?vue=audit" className={styles.more}>
              Journal
            </Link>
          </div>
          <ul className={a.audit}>
            {admin.audit.slice(0, 6).map((e) => (
              <li key={e.id}>
                <strong>{e.action}</strong>
                <span>{e.target}</span>
                <small>
                  {formatDay(e.at)} à {formatTime(e.at)} · {e.role}
                </small>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${styles.card} ${styles.span12}`} aria-labelledby="book-t">
          <div className={styles.cardHead}>
            <h2 id="book-t" className={styles.sectionTitle}>
              Réservations récentes
            </h2>
            <Link href="/admin/reservations" className={styles.more}>
              Toutes
            </Link>
          </div>
          {bookings.length ? (
            <ul className={styles.list}>
              {bookings.slice(0, 5).map((b) => (
                <li key={b.id} className={styles.row}>
                  <span className={a.dot} aria-hidden="true" />
                  <div>
                    <p className={styles.rowTitle}>
                      {b.couple} · {getVendor(b.vendorSlug)?.name}
                    </p>
                    <p className={styles.rowMeta}>
                      {euros(b.total)} · mariage le {formatDay(b.date)} · {b.source}
                    </p>
                  </div>
                  <StatusChip status={b.status === "Confirmée" ? "Réservation confirmée" : "Acceptée"} />
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.rowMeta}>Ouvrez l&apos;espace couple ou l&apos;espace prestataire de démonstration pour voir des réservations.</p>
          )}
          <p className={styles.small} style={{ marginTop: 12 }}>
            Mise à jour au {formatDay(today)}.
          </p>
        </section>
      </div>
    </>
  );
}
