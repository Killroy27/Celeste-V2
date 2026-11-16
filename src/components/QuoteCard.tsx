"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { priceLabel, type Vendor } from "@/lib/content";
import styles from "./QuoteCard.module.css";

// Carte de demande de devis, collée à droite sur ordinateur, en barre basse sur mobile.
export function QuoteCard({ vendor: v }: { vendor: Vendor }) {
  const [sent, setSent] = useState(false);
  const needsGuests = ["lieux", "traiteurs", "patisserie"].includes(v.category);

  return (
    <>
      <div id="devis" className={styles.card}>
        {sent ? (
          <div className={styles.done} role="status">
            <Image src="/icons/envelope-seal.png" alt="" width={88} height={88} />
            <h2 className="h3">Demande envoyée à {v.name}</h2>
            <p className="muted">Vous recevrez un devis détaillé dans votre messagerie Céleste, en général en {v.responseTime}.</p>
            <Link href="/decouvrir" className="btn btn-sm btn-outline">
              Comparer avec d&apos;autres prestataires
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className={styles.price}>
              <span>dès</span> <strong>{priceLabel(v)}</strong>
            </div>
            <div className={styles.fields}>
              <label className="field">
                Date du mariage
                <input type="date" name="date" required />
              </label>
              {needsGuests && (
                <label className="field">
                  Nombre d&apos;invités
                  <input type="number" name="invites" min={2} max={1000} placeholder="120" required />
                </label>
              )}
              <label className="field">
                Formule
                <select name="formule" defaultValue={v.packages[1]?.name}>
                  {v.packages.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} · {p.price.toLocaleString("fr-FR")} €
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Votre message
                <textarea name="message" placeholder={`Bonjour ${v.name}, nous nous marions…`} required />
              </label>
            </div>
            <button type="submit" className="btn btn-block">
              Demander un devis gratuit
            </button>
            <p className={styles.note}>Gratuit et sans engagement · Réponse en {v.responseTime}</p>
          </form>
        )}
      </div>

      {!sent && (
        <div className={styles.mobileBar}>
          <span>
            dès <strong>{priceLabel(v)}</strong>
          </span>
          <a href="#devis" className="btn btn-sm">
            Demander un devis
          </a>
        </div>
      )}
    </>
  );
}
