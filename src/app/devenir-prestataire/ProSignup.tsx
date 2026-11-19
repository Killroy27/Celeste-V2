"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { categories } from "@/lib/content";
import { newPro, usePro } from "@/lib/pro";
import { registerPro } from "@/lib/session";
import styles from "./page.module.css";

// Inscription ouverte (CDC §16.2) : le compte est créé immédiatement, sans validation préalable.
// La publication de la fiche et les statuts de confiance viennent ensuite, depuis l'espace prestataire.
export function ProSignup() {
  const router = useRouter();
  const { create } = usePro();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className={styles.signup}
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const get = (k: string) => String(f.get(k) ?? "").trim();
        if (get("password").length < 8) return setError("Le mot de passe doit compter au moins 8 caractères.");
        // Compte et session créés, puis l'espace prestataire du compte (CDC §16.2 : inscription immédiate).
        const r = registerPro({ email: get("email"), name: get("nom"), company: get("entreprise"), pwd: get("password") });
        if (!r.ok) return setError(r.error);
        create(newPro({ name: get("nom"), company: get("entreprise"), category: get("metier"), email: get("email"), phone: get("tel"), city: get("ville") || "Paris" }));
        router.push("/espace-pro");
      }}
    >
      <div className={styles.row2}>
        <label className="field">
          Prénom et nom
          <input name="nom" autoComplete="name" required />
        </label>
        <label className="field">
          Entreprise
          <input name="entreprise" autoComplete="organization" required />
        </label>
      </div>
      <div className={styles.row2}>
        <label className="field">
          Métier
          <select name="metier" required defaultValue="">
            <option value="" disabled>
              Choisir…
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.plural}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Ville
          <input name="ville" autoComplete="address-level2" placeholder="Paris" />
        </label>
      </div>
      <div className={styles.row2}>
        <label className="field">
          E-mail professionnel
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label className="field">
          Téléphone
          <input type="tel" name="tel" autoComplete="tel" required />
        </label>
      </div>
      <label className="field">
        Mot de passe
        <input type="password" name="password" autoComplete="new-password" minLength={8} required aria-describedby={error ? "signup-error" : undefined} onChange={() => setError(null)} />
      </label>
      <label className={styles.consent}>
        <input type="checkbox" required />
        <span>
          J&apos;accepte les <Link href="/cgu">conditions d&apos;utilisation</Link> de Céleste.
        </span>
      </label>
      {error && (
        <p id="signup-error" className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-block">
        Créer mon compte
      </button>
      <p className={styles.signupNote}>
        Votre compte est créé tout de suite. Vous complétez ensuite votre fiche et envoyez vos justificatifs : la fiche est publiée quand elle est complète, le badge Vérifié arrive après contrôle.
      </p>
    </form>
  );
}
