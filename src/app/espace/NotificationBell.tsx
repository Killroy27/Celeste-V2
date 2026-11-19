"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatDay, formatTime, isoDate } from "@/lib/format";
import type { Notif } from "@/lib/notifications";
import styles from "./espace.module.css";

const when = (iso: string) => (iso.slice(0, 10) === isoDate() ? formatTime(iso) : formatDay(iso));

// Centre de notifications in-app (CDC §25), commun au couple et au prestataire.
export function NotificationBell({ items, readAt, seen, onSeen, onMarkRead, prefsHref }: { items: Notif[]; readAt: string; seen: string[]; onSeen: (id: string) => void; onMarkRead: () => void; prefsHref: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isNew = (n: Notif) => n.at > readAt && !seen.includes(n.id);
  const unread = items.filter(isNew);
  const earlier = items.filter((n) => !isNew(n)).slice(0, 12);

  // Fermeture au clic extérieur et avec Échap.
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const row = (n: Notif, fresh: boolean) => (
    <li key={n.id}>
      <Link
        href={n.href}
        className={styles.notif}
        data-fresh={fresh}
        onClick={() => {
          setOpen(false);
          if (fresh) onSeen(n.id);
        }}
      >
        <span className={styles.notifDot} aria-hidden="true" />
        <span className={styles.notifText}>
          <strong>{n.title}</strong>
          {n.detail && <span>{n.detail}</span>}
        </span>
        <time dateTime={n.at}>{when(n.at)}</time>
      </Link>
    </li>
  );

  return (
    <div className={styles.bellWrap} ref={ref}>
      <button type="button" className={styles.bell} aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((x) => !x)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        <span className="visually-hidden">Notifications{unread.length ? `, ${unread.length} nouvelle${unread.length > 1 ? "s" : ""}` : ""}</span>
        {unread.length > 0 && (
          <span className={styles.bellBadge} aria-hidden="true">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>
      {open && (
        <div className={styles.notifPanel} role="dialog" aria-label="Notifications">
          <div className={styles.notifHead}>
            <strong>Notifications</strong>
            {unread.length > 0 && (
              <button type="button" className={styles.linkBtn} onClick={onMarkRead}>
                Tout marquer comme lu
              </button>
            )}
          </div>
          <div className={styles.notifBody}>
            {unread.length > 0 && (
              <>
                <p className={styles.notifGroup}>Nouveau</p>
                <ul className={styles.notifList}>{unread.map((n) => row(n, true))}</ul>
              </>
            )}
            {earlier.length > 0 && (
              <>
                <p className={styles.notifGroup}>Plus tôt</p>
                <ul className={styles.notifList}>{earlier.map((n) => row(n, false))}</ul>
              </>
            )}
            {!items.length && <p className={styles.notifEmpty}>Aucune notification pour l&apos;instant. Messages, offres, rendez-vous et paiements apparaîtront ici.</p>}
          </div>
          <Link href={prefsHref} className={styles.notifFoot} onClick={() => setOpen(false)}>
            Préférences de notification
          </Link>
        </div>
      )}
    </div>
  );
}
