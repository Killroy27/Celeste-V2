"use client";

import { useEffect, useRef, useState } from "react";
import { checkCard, REFUSED_TEST_CARD, type CardError, type CardInput } from "@/lib/booking";
import c from "./card.module.css";

const groups = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

const expiryMask = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

// Paiement par carte, simulé (CDC §13.1, étape 13). En production : formulaire hébergé par le prestataire
// de paiement, confirmation par webhook sécurisé (§26) ; aucun numéro de carte n'est gardé ici.
export function CardForm({ submitLabel, onPaid }: { submitLabel: string; onPaid: (last4: string) => void }) {
  const [card, setCard] = useState<CardInput>({ number: "", expiry: "", cvc: "", name: "" });
  const [error, setError] = useState<CardError | { field: null; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Fenêtre fermée ou page quittée pendant l'autorisation : le paiement n'aboutit pas.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const set = (k: keyof CardInput, v: string) => {
    setCard((x) => ({ ...x, [k]: v }));
    if (error?.field === k) setError(null);
  };
  const invalid = (k: keyof CardInput) => (error?.field === k ? { "aria-invalid": true, "aria-describedby": "card-error" } : {});

  return (
    <form
      className={c.form}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (busy) return;
        const problem = checkCard(card);
        if (problem) return setError(problem);
        setError(null);
        setBusy(true);
        const digits = card.number.replace(/\D/g, "");
        // Délai d'autorisation bancaire simulé, puis réponse : refus pour la carte de test dédiée.
        timer.current = setTimeout(() => {
          timer.current = null;
          setBusy(false);
          if (digits === REFUSED_TEST_CARD) {
            setError({ field: null, message: "Paiement refusé par votre banque. Aucun montant n'a été débité. Vérifiez vos informations ou essayez une autre carte." });
            return;
          }
          onPaid(digits.slice(-4));
        }, 1400);
      }}
    >
      <label className="field">
        Nom sur la carte
        <input autoComplete="cc-name" value={card.name} onChange={(e) => set("name", e.target.value)} {...invalid("name")} />
      </label>
      <label className="field">
        Numéro de carte
        <input inputMode="numeric" autoComplete="cc-number" placeholder="1234 1234 1234 1234" value={card.number} onChange={(e) => set("number", groups(e.target.value))} {...invalid("number")} />
      </label>
      <div className={c.row}>
        <label className="field">
          Expiration
          <input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={card.expiry} onChange={(e) => set("expiry", expiryMask(e.target.value))} {...invalid("expiry")} />
        </label>
        <label className="field">
          Code de sécurité
          <input inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} value={card.cvc} onChange={(e) => set("cvc", e.target.value.replace(/\D/g, ""))} {...invalid("cvc")} />
        </label>
      </div>

      {error && (
        <p id="card-error" className={c.error} role="alert">
          {error.message}
        </p>
      )}

      <button type="submit" className="btn btn-block" disabled={busy} aria-busy={busy}>
        {busy ? "Paiement en cours…" : submitLabel}
      </button>
      <p className={c.note}>
        Paiement simulé : aucune carte n&apos;est débitée. Toute carte valide est acceptée, par exemple 4242 4242 4242 4242 ; la carte 4000 0000 0000 0002 simule un refus.
      </p>
    </form>
  );
}
