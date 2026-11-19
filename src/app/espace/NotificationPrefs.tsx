"use client";

import { NOTIF_LABELS, type NotifKind } from "@/lib/notifications";
import styles from "./espace.module.css";

// Préférences de notification (CDC §25) : l'in-app reste toujours actif ; l'e-mail se règle par type.
export function NotificationPrefs({ kinds, emailOff, onChange, email }: { kinds: NotifKind[]; emailOff: string[]; onChange: (next: string[]) => void; email: string }) {
  return (
    <section id="notifications" className={`${styles.card} ${styles.span12}`} aria-labelledby="notif-prefs-t">
      <div className={styles.cardHead}>
        <h2 id="notif-prefs-t" className={styles.sectionTitle}>
          Notifications
        </h2>
      </div>
      <p className={styles.rowMeta}>
        Tout reste visible dans Céleste, sous la cloche. Choisissez ce que vous recevez aussi par e-mail{email ? ` (${email})` : ""}.
      </p>
      <ul className={styles.prefs}>
        {kinds.map((k) => {
          const on = !emailOff.includes(k);
          return (
            <li key={k}>
              <span>{NOTIF_LABELS[k]}</span>
              <label className={styles.prefToggle}>
                <input type="checkbox" role="switch" checked={on} onChange={(e) => onChange(e.target.checked ? emailOff.filter((x) => x !== k) : [...emailOff, k])} />
                <span>E-mail</span>
              </label>
            </li>
          );
        })}
      </ul>
      <p className={styles.small}>Démonstration : aucun e-mail n&apos;est envoyé, les préférences sont enregistrées pour le futur envoi.</p>
    </section>
  );
}
