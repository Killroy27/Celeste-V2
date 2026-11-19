"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { hasPending, nextPendingAt, resolvePending, totalUnread } from "@/lib/deal";
import { useDisputes } from "@/lib/disputes";
import { stamp } from "@/lib/format";
import { coupleNotifications, defaultReadAt } from "@/lib/notifications";
import { NotificationBell } from "./NotificationBell";
import { newWedding, useWedding } from "@/lib/wedding";
import { useSession } from "@/lib/session";
import { SignInGate } from "@/components/SignInGate";
import styles from "./espace.module.css";

// Navigation principale du couple : cinq entrées seulement (CDC §5.1).
const NAV = [
  { href: "/espace", label: "Accueil", icon: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { href: "/decouvrir", label: "Découvrir", icon: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.35-4.35" },
  { href: "/espace/mariage", label: "Mon mariage", icon: "M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z" },
  { href: "/espace/messages", label: "Messages", icon: "M4 5h16v11H8l-4 4z" },
  { href: "/espace/profil", label: "Profil", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function EspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { wedding, ready, create, update } = useWedding();
  // Espace réservé au compte couple connecté (CDC §2, §26).
  const { session, ready: sessionReady } = useSession();
  const allowed = session?.role === "couple";
  const active = (href: string) => (href === "/espace" ? pathname === "/espace" : pathname.startsWith(href));
  // Réservation et paiement : en-tête réduit au logo, sans menu ni onglets, pour ne pas distraire (benchmark Airbnb).
  const focus = pathname.startsWith("/espace/reservation/");
  const unread = wedding ? totalUnread(wedding) : 0;
  const { disputes } = useDisputes();
  const notifs = wedding ? coupleNotifications(wedding, disputes) : [];

  // Réponses des prestataires (simulées) : appliquées à l'heure prévue, quelle que soit la page ouverte.
  useEffect(() => {
    if (!wedding || !hasPending(wedding)) return;
    const t = setTimeout(() => update((x) => resolvePending(x, Date.now())), Math.max(0, nextPendingAt(wedding) - Date.now()));
    return () => clearTimeout(t);
  }, [wedding, update]);

  // Nouveaux messages (§25) : pastille sur l'entrée « Messages ».
  const badge = (href: string) =>
    href === "/espace/messages" && unread > 0 ? (
      <span className={styles.navBadge}>
        {unread}
        <span className="visually-hidden"> non lu{unread > 1 ? "s" : ""}</span>
      </span>
    ) : null;

  return (
    <div className={styles.shell} data-espace="couple" data-focus={focus || undefined}>
      {focus && (
        <header className={styles.focusBar}>
          <Link href="/espace" className={styles.brand} aria-label="Céleste, retour à mon espace">
            <Image src="/brand/monogram.png" alt="" width={28} height={29} />
            <span>Céleste</span>
          </Link>
          <span className={styles.focusSafe}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 017 0v3" />
            </svg>
            Paiement via Céleste
          </span>
        </header>
      )}
      <aside className={styles.side} hidden={focus}>
        <Link href="/" className={styles.brand} aria-label="Céleste, retour au site">
          <Image src="/brand/monogram.png" alt="" width={28} height={29} />
          <span>Céleste</span>
        </Link>
        <nav aria-label="Espace couple">
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
        {/* Accès permanent au Best Match depuis le cockpit connecté (CDC §8). */}
        <Link href="/matchs" className={`btn btn-signature btn-sm ${styles.sideCta}`}>
          ✦ Refaire mon Best Match
        </Link>
      </aside>

      <div className={styles.main}>
        {!ready || !sessionReady ? (
          <div className={styles.loading} aria-busy="true" />
        ) : !allowed ? (
          <SignInGate role="couple" />
        ) : !wedding ? (
          <Welcome onStart={() => create(newWedding({ firstName: session.name.split(" & ")[0] ?? "", email: session.email }))} />
        ) : (
          <>
            <div className={styles.topbar} hidden={focus}>
              <NotificationBell
                items={notifs}
                readAt={wedding.notifReadAt ?? defaultReadAt()}
                seen={wedding.notifSeen ?? []}
                onSeen={(id) => update((x) => ({ ...x, notifSeen: [...(x.notifSeen ?? []), id] }))}
                onMarkRead={() => update((x) => ({ ...x, notifReadAt: stamp(), notifSeen: [] }))}
                prefsHref="/espace/profil#notifications"
              />
            </div>
            {wedding.demo && (
              <p className={styles.demo}>
                Espace de démonstration : les données sont fictives et restent sur cet appareil, en attendant les comptes Céleste.
              </p>
            )}
            {children}
          </>
        )}
      </div>

      {/* Mobile : barre d'onglets en bas, actions fréquentes à portée de pouce (CDC §27). */}
      <nav className={styles.tabbar} aria-label="Espace couple" hidden={focus}>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={styles.tab} aria-current={active(n.href) ? "page" : undefined}>
            <Icon d={n.icon} />
            <span>{n.label}</span>
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
      <Image src="/icons/planner-notebook.png" alt="" width={112} height={112} />
      <h1 className={styles.pageTitle}>Votre espace mariage</h1>
      <p className={styles.lead}>
        Planning, budget, prestataires et documents au même endroit. Céleste reprend votre Wedding DNA : vous ne saisissez rien deux fois.
      </p>
      <div className={styles.welcomeActions}>
        <button type="button" className="btn" onClick={onStart}>
          Ouvrir mon espace
        </button>
        <Link href="/matchs" className="btn btn-outline">
          Commencer par mon Wedding DNA
        </Link>
      </div>
    </section>
  );
}
