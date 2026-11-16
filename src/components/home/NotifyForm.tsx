"use client";

import { useState } from "react";
import styles from "./Sections.module.css";

// Champ e-mail et bouton dans une seule pilule, bordure dorée au focus.
// L'envoi réel sera branché sur l'API.
export function NotifyForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p className={styles.notifyDone} role="status">
        <span>✓</span> C&apos;est noté. On vous écrit le jour de la sortie, et c&apos;est tout.
      </p>
    );
  }

  return (
    <form
      className={styles.notify}
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <label className="visually-hidden" htmlFor="notify-email">
        Votre e-mail
      </label>
      <input id="notify-email" type="email" name="email" autoComplete="email" placeholder="Votre adresse e-mail" required />
      <button type="submit">Me prévenir</button>
    </form>
  );
}
