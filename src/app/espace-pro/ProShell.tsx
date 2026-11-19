"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { vendorUnread } from "@/lib/deal";
import { useDisputes } from "@/lib/disputes";
import { stamp } from "@/lib/format";
import { defaultReadAt, proNotifications } from "@/lib/notifications";
import { PRO_SLUG, proStatus, publishChecks, useDeals, usePro } from "@/lib/pro";
import { signInDemo, useSession } from "@/lib/session";
import { SignInGate } from "@/components/SignInGate";
import { NotificationBell } from "../espace/NotificationBell";
import styles from "../espace/espace.module.css";

// Navigation du prestataire (CDC §16.1) : orientée activité réelle, six entrées.
const NAV = [
  { href: "/espace-pro", label: "Accueil", icon: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { href: "/espace-pro/opportunites", label: "Opportunités", icon: "M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" },
  { href: "/espace-pro/messages", label: "Messages", icon: "M4 5h16v11H8l-4 4z" },
  { href: "/espace-pro/activite", label: "Mon activité", icon: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
  { href: "/espace-pro/profil", label: "Mon profil", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" },
  { href: "/espace-pro/paiements", label: "Paiements", icon: "M3 6h18v12H3zM3 10h18M7 15h3" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function ProShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { pro, ready, update } = usePro();
  // Espace réservé au compte prestataire connecté (CDC §2, §26).
  const { session, ready: sessionReady } = useSession();
  const allowed = session?.role === "pro";
  const [confirmDemo, setConfirmDemo] = useState(false);
  const { disputes } = useDisputes();
  const fiche = pro?.account ? "/espace-pro/profil?vue=fiche" : `/prestataire/${PRO_SLUG}`;
  const { deals } = useDeals();
  const notifs = pro ? proNotifications(pro, deals, disputes, PRO_SLUG) : [];
  const active = (href: string) => (href === "/espace-pro" ? pathname === "/espace-pro" : pathname.startsWith(href));
  const counts: Record<string, number> = {
    "/espace-pro/opportunites": pro?.opportunities.filter((o) => o.status === "nouvelle" && o.slots.taken < o.slots.max).length ?? 0,
    "/espace-pro/messages": deals.reduce((s, d) => s + vendorUnread(d.conv), 0),
  };
  const badge = (href: string) =>
    counts[href] ? (
      <span className={styles.navBadge}>
        {counts[href]}
        <span className="visually-hidden"> {href.endsWith("messages") ? "non lus" : "nouvelles"}</span>
      </span>
    ) : null;

  return (
    <div className={styles.shell} data-espace="pro">
      <aside className={styles.side}>
        <Link href="/" className={styles.brand} aria-label="Céleste, retour au site">
          <Image src="/brand/monogram.png" alt="" width={28} height={29} />
          <span>
            Céleste <small style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-3)" }}>Pro</small>
          </span>
        </Link>
        <nav aria-label="Espace prestataire">
          <ul className={styles.nav}>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className={styles.navLink} aria-current={active(n.href) ? "page" : undefined}>
                  <Icon d={n.icon} />
                  <span>{n.label}</span>
                  {badge(n.href)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* « Vous débutez ? » (benchmark Airbnb) : tant que la fiche n'est pas publiée, l'étape suivante reste à portée. */}
        {allowed && pro?.account && !proStatus(pro).published && <StartCard checks={publishChecks(pro)} />}
        <Link href={fiche} className={`btn btn-outline btn-sm ${styles.sideCta}`}>
          {pro?.account ? "Aperçu de ma fiche" : "Voir ma fiche publique"}
        </Link>
      </aside>

      <div className={styles.main}>
        {!ready || !sessionReady ? (
          <div className={styles.loading} aria-busy="true" />
        ) : !allowed ? (
          <SignInGate role="pro" />
        ) : !pro ? (
          <Welcome onStart={() => signInDemo("pro")} />
        ) : (
          <>
            <div className={styles.topbar}>
              <NotificationBell
                items={notifs}
                readAt={pro.notifReadAt ?? defaultReadAt()}
                seen={pro.notifSeen ?? []}
                onSeen={(id) => update((x) => ({ ...x, notifSeen: [...(x.notifSeen ?? []), id] }))}
                onMarkRead={() => update((x) => ({ ...x, notifReadAt: stamp(), notifSeen: [] }))}
                prefsHref="/espace-pro/profil?vue=notifications"
              />
            </div>
            {pro.account ? (
              <p className={styles.demo}>
                Votre compte prestataire est enregistré sur cet appareil, en attendant les comptes Céleste.{" "}
                {confirmDemo ? (
                  <>
                    Vous serez déconnecté de votre compte pour ouvrir la démonstration.{" "}
                    <button type="button" className="link-underline" onClick={() => signInDemo("pro")}>
                      Confirmer
                    </button>{" "}
                    <button type="button" className="link-underline" onClick={() => setConfirmDemo(false)}>
                      Annuler
                    </button>
                  </>
                ) : (
                  <button type="button" className="link-underline" onClick={() => setConfirmDemo(true)}>
                    Ouvrir plutôt l&apos;espace de démonstration Studio Aube
                  </button>
                )}
              </p>
            ) : (
              <p className={styles.demo}>
                Espace prestataire de démonstration (Studio Aube). La conversation avec votre couple de démonstration est partagée avec l&apos;espace couple : ouvrez-les dans deux onglets pour voir l&apos;un répondre à l&apos;autre.
              </p>
            )}
            {children}
          </>
        )}
      </div>

      <nav className={styles.tabbar} style={{ gridTemplateColumns: "repeat(6, 1fr)" }} aria-label="Espace prestataire">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={styles.tab} aria-current={active(n.href) ? "page" : undefined}>
            <Icon d={n.icon} />
            <span>{n.label.replace("Mon ", "")}</span>
            {badge(n.href)}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <section className={styles.welcome}>
      <Image src="/icons/camera.png" alt="" width={112} height={112} />
      <h1 className={styles.pageTitle}>Votre espace professionnel</h1>
      <p className={styles.lead}>
        Demandes à traiter, offres, visites, réservations, calendrier et paiements : tout ce qui peut vous faire gagner ou perdre une réservation, au même endroit.
      </p>
      <div className={styles.welcomeActions}>
        <Link href="/devenir-prestataire#inscription" className="btn">
          Créer mon compte prestataire
        </Link>
        <button type="button" className="btn btn-outline" onClick={onStart}>
          Voir l&apos;espace de démonstration
        </button>
      </div>
      <p className={styles.small}>L&apos;inscription est ouverte à tout professionnel. La démonstration montre un espace actif, au nom de Studio Aube, photographe. Les données restent sur cet appareil.</p>
    </section>
  );
}

function StartCard({ checks }: { checks: { id: string; label: string; ok: boolean; href: string }[] }) {
  const next = checks.find((c) => !c.ok);
  const done = checks.filter((c) => c.ok).length;
  return (
    <div className={styles.startCard}>
      <strong>Vous débutez ?</strong>
      <span className={styles.small}>
        {next ? `${checks.length - done} étape${checks.length - done > 1 ? "s" : ""} avant de publier votre fiche` : "Tout est prêt : publiez votre fiche"}
      </span>
      <div className={styles.bar} role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={checks.length} aria-label="Préparation de la fiche">
        <i style={{ width: `${Math.round((done / checks.length) * 100)}%` }} />
      </div>
      <Link href={next?.href ?? "/espace-pro"} className={styles.startLink}>
        {next ? next.label : "Publier ma fiche"}
      </Link>
    </div>
  );
}
