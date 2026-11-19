"use client";

import Link from "next/link";
import { isOpen, latestOffer, offerStatus, vendorUnread } from "@/lib/deal";
import { addDays, daysUntil, euros, formatDate, formatDay, formatTime, isoDate } from "@/lib/format";
import { dealAppointments, dealName, dealOffer, dealPayments, isBooking, isVerified, PRO_SLUG, proIdentity, profileCompletion, selectCriteria, useDeals } from "@/lib/pro";
import { openDisputeList, useDisputes } from "@/lib/disputes";
import { Onboarding } from "./Onboarding";
import { DateBadge, StatusChip } from "../espace/ui";
import styles from "../espace/espace.module.css";
import p from "./pro.module.css";

type Todo = { id: string; kind: string; title: string; detail: string; href: string; cta: string; date?: string };

// Tableau de bord (CDC §16.3) : pas de décor, ce qui peut faire gagner ou perdre une réservation.
export function Dashboard() {
  const { deals, pro } = useDeals();
  const { disputes } = useDisputes();
  if (!pro) return null;
  const today = isoDate();
  const first = proIdentity(pro).firstName;

  const todos: Todo[] = [];
  // Demandes à traiter : nouvelles opportunités, demandes d'adaptation, messages sans réponse.
  for (const o of pro.opportunities.filter((x) => x.status === "nouvelle" && x.slots.taken < x.slots.max)) {
    todos.push({ id: o.id, kind: "Opportunité", title: `${o.names.join(" & ")} · ${o.compat} % compatible`, detail: `${formatDate(o.date)} · ${o.zone} · ${o.slots.max - o.slots.taken} place${o.slots.max - o.slots.taken > 1 ? "s" : ""} de réponse restante${o.slots.max - o.slots.taken > 1 ? "s" : ""}`, href: `/espace-pro/opportunites?o=${o.id}`, cta: "Répondre" });
  }
  for (const d of deals) {
    const o = latestOffer(d.conv);
    const unread = vendorUnread(d.conv);
    if (o && offerStatus(d.w, PRO_SLUG, o) === "en-discussion") todos.push({ id: `adapt-${d.id}`, kind: "Adaptation demandée", title: `${dealName(d)} demandent une adaptation`, detail: `${o.name}, version ${o.version}`, href: `/espace-pro/messages?d=${d.id}`, cta: "Réviser l'offre" });
    // Un rendez-vous à confirmer suffit : il est listé plus bas, inutile de doubler avec le message.
    else if (unread && !dealAppointments(d).some((a) => a.status === "Demandée")) todos.push({ id: `msg-${d.id}`, kind: "Message", title: `${dealName(d)} attendent votre réponse`, detail: `${unread} message${unread > 1 ? "s" : ""} non lu${unread > 1 ? "s" : ""}`, href: `/espace-pro/messages?d=${d.id}`, cta: "Répondre" });
  }
  // Disponibilités à confirmer : demandes de visite ou de rendez-vous.
  for (const d of deals)
    for (const a of dealAppointments(d).filter((x) => x.status === "Demandée"))
      todos.push({ id: a.id, kind: "Disponibilité à confirmer", title: `${a.kind} demandé par ${dealName(d)}`, detail: `${formatDay(a.date)} à ${formatTime(a.date)}`, href: `/espace-pro/activite?vue=visites`, cta: "Confirmer", date: a.date });
  // Offres à relancer : sans réponse depuis 3 jours, ou qui expirent bientôt.
  for (const d of deals) {
    const o = dealOffer(d);
    if (!o || !isOpen(o.status) || o.status === "en-discussion") continue;
    const stale = o.offer.sentAt.slice(0, 10) <= addDays(today, -3);
    const expiring = o.offer.validUntil <= addDays(today, 3);
    if (stale || expiring) todos.push({ id: `relance-${d.id}`, kind: "Offre à relancer", title: `${dealName(d)} n'ont pas encore répondu`, detail: `${o.offer.name} · ${euros(o.total)} · valable jusqu'au ${formatDay(o.offer.validUntil)}`, href: `/espace-pro/messages?d=${d.id}`, cta: "Relancer" });
  }

  const bookings = deals.filter(isBooking);
  const upcoming = bookings.filter((d) => d.w.date >= today).sort((a, b) => a.w.date.localeCompare(b.w.date));
  const payments = deals.flatMap((d) => dealPayments(d).map((x) => ({ ...x, deal: d })));
  const received = payments.filter((x) => x.paid).reduce((s, x) => s + x.amount, 0);
  const expected = payments.filter((x) => !x.paid).reduce((s, x) => s + x.amount, 0);
  const nextPayment = payments.filter((x) => !x.paid).sort((a, b) => a.due.localeCompare(b.due))[0];
  const completion = profileCompletion(pro);
  const criteria = selectCriteria(pro, pro.account ? 0 : openDisputeList(disputes).filter((d) => d.vendorSlug === PRO_SLUG).length);
  const select = criteria.every((c) => c.ok);

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <p className={styles.eyebrow}>Bonjour {first}</p>
          <h1 className={styles.pageTitle}>À traiter aujourd&apos;hui</h1>
        </div>
      </header>

      <div className={styles.grid}>
        {pro.account && (
          <div className={styles.span12}>
            <Onboarding pro={pro} />
          </div>
        )}
        <section className={`${styles.card} ${styles.span12}`} aria-labelledby="todo-t">
          <div className={styles.cardHead}>
            <h2 id="todo-t" className={styles.sectionTitle}>
              Ce qui peut vous faire gagner ou perdre une réservation
            </h2>
            <span className={styles.small}>{todos.length} action{todos.length > 1 ? "s" : ""}</span>
          </div>
          {todos.length ? (
            <ul className={styles.list}>
              {todos.map((t) => (
                <li key={t.id} className={styles.row}>
                  {t.date ? <DateBadge iso={t.date} /> : <span className={p.kindDot} aria-hidden="true" />}
                  <div>
                    <p className={p.kind}>{t.kind}</p>
                    <p className={styles.rowTitle}>{t.title}</p>
                    <p className={styles.rowMeta}>{t.detail}</p>
                  </div>
                  <Link href={t.href} className="btn btn-sm btn-outline">
                    {t.cta}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.empty}>
              <p>Tout est à jour. Les nouvelles demandes et opportunités apparaîtront ici.</p>
            </div>
          )}
        </section>

        <section className={`${styles.card} ${styles.span7}`} aria-labelledby="book-t">
          <div className={styles.cardHead}>
            <h2 id="book-t" className={styles.sectionTitle}>
              Réservations à venir
            </h2>
            <Link href="/espace-pro/activite?vue=reservations" className={styles.more}>
              Toutes
            </Link>
          </div>
          {upcoming.length ? (
            <ul className={styles.list}>
              {upcoming.slice(0, 4).map((d) => {
                const o = dealOffer(d);
                return (
                  <li key={d.id} className={styles.row}>
                    <DateBadge iso={d.w.date} />
                    <div>
                      <p className={styles.rowTitle}>{dealName(d)}</p>
                      <p className={styles.rowMeta}>
                        {o?.offer.name} · {euros(o?.total ?? 0)} · J-{daysUntil(d.w.date)}
                      </p>
                    </div>
                    <StatusChip status="Réservation confirmée" />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.rowMeta}>Aucune réservation à venir.</p>
          )}
        </section>

        <section className={`${styles.card} ${styles.span5}`} aria-labelledby="money-t">
          <div className={styles.cardHead}>
            <h2 id="money-t" className={styles.sectionTitle}>
              Paiements
            </h2>
            <Link href="/espace-pro/paiements" className={styles.more}>
              Détail
            </Link>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{euros(received)}</span>
              <span className={styles.statLabel}>Réglés par vos couples</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{euros(expected)}</span>
              <span className={styles.statLabel}>À venir</span>
            </div>
          </div>
          {nextPayment && (
            <p className={styles.rowMeta} style={{ marginTop: 12 }}>
              Prochaine échéance : {euros(nextPayment.amount)} de {dealName(nextPayment.deal)}, le {formatDay(nextPayment.due)}.
            </p>
          )}
        </section>

        <section className={`${styles.card} ${styles.span5}`} aria-labelledby="profile-t">
          <div className={styles.cardHead}>
            <h2 id="profile-t" className={styles.sectionTitle}>
              Profil à compléter
            </h2>
            <span className={styles.small}>{completion.percent} %</span>
          </div>
          <div className={styles.bar} role="img" aria-label={`Profil complété à ${completion.percent} %`}>
            <i style={{ width: `${completion.percent}%` }} />
          </div>
          <ul className={p.checks}>
            {completion.checks
              .filter((c) => !c.ok)
              .map((c) => (
                <li key={c.label}>{c.label}</li>
              ))}
          </ul>
          <Link href="/espace-pro/profil" className={styles.more}>
            Compléter mon profil
          </Link>
        </section>

        <section className={`${styles.card} ${styles.span7}`} aria-labelledby="trust-t">
          <div className={styles.cardHead}>
            <h2 id="trust-t" className={styles.sectionTitle}>
              Confiance
            </h2>
            <Link href="/espace-pro/profil?vue=confiance" className={styles.more}>
              Voir le détail
            </Link>
          </div>
          <div className={p.trust}>
            <div>
              <StatusChip status={isVerified(pro) ? "Vérifié" : "Vérification en cours"} />
              <p className={styles.rowMeta}>Identité et existence professionnelle confirmées. Ce statut ne garantit pas la qualité de la prestation.</p>
            </div>
            <div>
              {select ? <span className={p.select}>
                  <i aria-hidden="true">◆</i> Céleste Select
                </span> : <StatusChip status="Select : en progression" />}
              <p className={styles.rowMeta}>
                {select ? "Vous remplissez tous les critères de performance. Select ne s'achète pas : il se mérite." : `${criteria.filter((c) => c.ok).length} critères remplis sur ${criteria.length}.`}
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
