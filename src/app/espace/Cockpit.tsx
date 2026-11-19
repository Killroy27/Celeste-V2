"use client";

import Image from "next/image";
import Link from "next/link";
import { getCategory } from "@/lib/content";
import { budgetFor, daysUntil, euros, formatDate, isBookedStatus, priorityActions, progressFor, recommendationFor, tasksFor, timelineFor, useWedding } from "@/lib/wedding";
import { ProfileNudge } from "./ProfileNudge";
import { DateBadge, StatusChip } from "./ui";
import styles from "./espace.module.css";
import c from "./cockpit.module.css";

// Accueil connecté : « Que dois-je faire maintenant ? » (CDC §5.2). Pas de tableau de bord rempli de chiffres.
export function Cockpit() {
  const { wedding: w } = useWedding();
  if (!w) return null;

  // La checklist est calculée une seule fois et partagée par les blocs du cockpit.
  const now = new Date();
  const tasks = tasksFor(w);
  const days = daysUntil(w.date, now);
  const actions = priorityActions(w, now, tasks);
  const progress = progressFor(w, tasks);
  const budget = budgetFor(w);
  const upcoming = timelineFor(w, now, tasks).slice(0, 4);
  const reco = recommendationFor(w, now);
  const booked = w.vendors.filter((v) => isBookedStatus(v.status)).length;

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <p className={styles.eyebrow}>
            Bonjour {w.names.filter(Boolean).join(" & ")}
          </p>
          <h1 className={styles.pageTitle}>Que faire maintenant ?</h1>
        </div>
        <div className={c.countdown}>
          <span className={c.days}>{days > 0 ? `J-${days}` : days === 0 ? "Jour J" : "C'est fait !"}</span>
          <span className={styles.small}>{formatDate(w.date)}</span>
        </div>
      </header>

      <ProfileNudge />

      <div className={styles.grid}>
        {/* Trois actions au maximum (§5.2) */}
        <section className={`${styles.card} ${styles.span7}`} aria-labelledby="prio-t">
          <div className={styles.cardHead}>
            <h2 id="prio-t" className={styles.sectionTitle}>
              Vos priorités
            </h2>
            <span className={styles.small}>{actions.length} sur 3 maximum</span>
          </div>
          {actions.length ? (
            <ol className={c.actions}>
              {actions.map((a, i) => (
                <li key={a.id} className={c.action}>
                  <span className={c.num}>{i + 1}</span>
                  <div>
                    <p className={styles.rowTitle}>{a.title}</p>
                    <p className={styles.rowMeta}>{a.detail}</p>
                  </div>
                  <Link href={a.href} className="btn btn-sm btn-outline">
                    {a.cta}
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <div className={styles.empty}>
              <p>Rien d&apos;urgent : tout est à jour. Profitez-en pour parcourir les inspirations.</p>
            </div>
          )}
        </section>

        {/* Progression et budget synthétique */}
        <section className={`${styles.card} ${styles.span5}`} aria-labelledby="prog-t">
          <h2 id="prog-t" className={styles.sectionTitle}>
            Votre préparation
          </h2>
          <div className={c.progress}>
            <span className={c.percent}>{progress} %</span>
            <div className={styles.bar} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Progression de la préparation">
              <i style={{ width: `${progress}%` }} />
            </div>
            <p className={styles.small}>
              {tasks.filter((t) => t.done).length} tâches sur {tasks.length} · {booked} prestataires réservés sur {w.vendors.length}
            </p>
          </div>
          <div className={c.budget}>
            <div className={styles.cardHead}>
              <h3 className={styles.rowTitle}>Budget</h3>
              <Link href="/espace/mariage/budget" className={styles.more}>
                Détail
              </Link>
            </div>
            <div className={styles.bar} aria-hidden="true">
              <i style={{ width: `${budget.total ? Math.min(100, (budget.engaged / budget.total) * 100) : 0}%` }} />
            </div>
            <dl className={c.budgetFigures}>
              <div>
                <dt>Engagé</dt>
                <dd>
                  {euros(budget.engaged)} <span>sur {euros(budget.total)}</span>
                </dd>
              </div>
              <div>
                <dt>Reste à payer</dt>
                <dd>{euros(budget.toPay)}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Prochains rendez-vous, visites et paiements : la même source que le planning (§15.3) */}
        <section className={`${styles.card} ${styles.span7}`} aria-labelledby="next-t">
          <div className={styles.cardHead}>
            <h2 id="next-t" className={styles.sectionTitle}>
              À venir
            </h2>
            <Link href="/espace/mariage/planning" className={styles.more}>
              Tout le planning
            </Link>
          </div>
          {upcoming.length ? (
            <ul className={styles.list}>
              {upcoming.map((it) => (
                <li key={it.id} className={styles.row}>
                  <DateBadge iso={it.date} />
                  <div>
                    <p className={styles.rowTitle}>{it.title}</p>
                    <p className={styles.rowMeta}>{it.detail}</p>
                  </div>
                  {it.status && <StatusChip status={it.status} />}
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.empty}>
              <p>Aucun rendez-vous ni paiement prévu. Demandez une visite ou une dégustation depuis une fiche prestataire.</p>
            </div>
          )}
        </section>

        {/* Recommandation Céleste contextualisée (§5.2) et raccourci Best Match (§8) */}
        {reco && (
          <section className={`${styles.card} ${styles.span5} ${c.reco}`} aria-labelledby="reco-t">
            <div className={c.recoMedia}>
              <Image src={getCategory(reco.category)?.cover ?? "/photos/hero.jpg"} alt="" fill sizes="(max-width: 1100px) 100vw, 440px" style={{ objectFit: "cover" }} />
            </div>
            <p className={styles.eyebrow}>La recommandation Céleste</p>
            <h2 id="reco-t" className={styles.sectionTitle}>
              {reco.title}
            </h2>
            <p className={styles.rowMeta}>{reco.text}</p>
            <div className={c.recoActions}>
              <Link href="/matchs" className="btn btn-signature btn-sm">
                ✦ Voir mes matchs
              </Link>
              <Link href={`/prestataires/${reco.category}`} className={styles.more}>
                Parcourir
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
