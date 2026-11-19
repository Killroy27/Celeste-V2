"use client";

import { useState } from "react";
import { zones } from "@/lib/match";
import { COUPLE_KINDS } from "@/lib/notifications";
import { NotificationPrefs } from "../NotificationPrefs";
import { ProfileNudge } from "../ProfileNudge";
import { useWedding, type Ceremony, type Wedding } from "@/lib/wedding";
import styles from "../espace.module.css";
import p from "./profil.module.css";

const CEREMONIES: { value: Ceremony; label: string }[] = [
  { value: "civile", label: "Civile uniquement" },
  { value: "religieuse", label: "Religieuse" },
  { value: "laique", label: "Laïque" },
];

// Profil du couple : un seul compte pour le projet, avec les deux prénoms (CDC §2).
// Date, invités, budget et zone sont saisis ici une seule fois et réutilisés partout (§3).
export function Profil() {
  const { wedding: w, update, reset } = useWedding();
  const [saved, setSaved] = useState(false);
  if (!w) return null;

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    // 0 est une valeur valide : on ne retombe sur l'ancienne valeur que si le champ est vide ou illisible.
    const num = (k: string, fallback: number) => {
      const n = Number(String(f.get(k) ?? "").replace(",", "."));
      return String(f.get(k) ?? "").trim() !== "" && Number.isFinite(n) ? Math.max(0, Math.round(n)) : fallback;
    };
    update((x) => ({
      ...x,
      names: [String(f.get("name1") || x.names[0]), String(f.get("name2") || x.names[1])],
      email: String(f.get("email") || x.email),
      date: String(f.get("date") || x.date),
      guests: num("guests", x.guests),
      budget: num("budget", x.budget),
      zone: String(f.get("zone") || x.zone),
      ceremony: (f.get("ceremony") as Ceremony) || x.ceremony,
      estimated: [], // date et invités enregistrés depuis le profil : confirmés par le couple
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Export des données (§26) : le couple récupère tout son projet dans un fichier lisible.
  const exportData = (data: Wedding) => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "celeste-mon-mariage.json";
    a.click();
    // Révocation différée : certains navigateurs lancent le téléchargement de façon asynchrone.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Profil</h1>
          <p className={styles.lead}>Un seul espace pour vous deux : un projet, un budget, un historique.</p>
        </div>
      </header>

      <ProfileNudge inPage />

      <div className={styles.grid}>
        <form className={`${styles.card} ${styles.span8} ${p.form}`} onSubmit={save} aria-labelledby="mariage-t">
          <h2 id="mariage-t" className={styles.sectionTitle}>
            Votre mariage
          </h2>
          <p className={styles.rowMeta}>Ces informations alimentent votre budget, votre checklist et le Best Match : modifiez-les ici, tout se met à jour.</p>
          <div className={p.fields}>
            <label className="field">
              Prénom
              <input name="name1" defaultValue={w.names[0]} autoComplete="given-name" required />
            </label>
            <label className="field">
              Prénom de votre partenaire
              <input id="profil-name2" name="name2" defaultValue={w.names[1]} required />
            </label>
            <label className={`field ${p.wide}`}>
              E-mail du compte
              <input name="email" type="email" defaultValue={w.email} autoComplete="email" required />
            </label>
            <label className="field">
              Date du mariage
              <input id="profil-date" name="date" type="date" defaultValue={w.date} required />
            </label>
            <label className="field">
              Région
              <select name="zone" defaultValue={w.zone}>
                {zones.map((z) => (
                  <option key={z.value} value={z.value}>
                    {z.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Nombre d&apos;invités
              <input id="profil-guests" name="guests" type="number" min={1} step={1} defaultValue={w.guests} required />
            </label>
            <label className="field">
              Budget global (€)
              <input id="profil-budget" name="budget" type="number" min={0} step={1} defaultValue={w.budget} required />
            </label>
          </div>
          <fieldset className={p.ceremony}>
            <legend>Cérémonie</legend>
            {CEREMONIES.map((c) => (
              <label key={c.value} className="chip">
                <input type="radio" name="ceremony" value={c.value} defaultChecked={w.ceremony === c.value} className="visually-hidden" />
                {c.label}
              </label>
            ))}
          </fieldset>
          <div className={p.actions}>
            <button type="submit" className="btn">
              Enregistrer
            </button>
            <span role="status" className={styles.small}>
              {saved ? "Enregistré : budget, checklist et Best Match sont à jour." : ""}
            </span>
          </div>
        </form>

        <NotificationPrefs kinds={COUPLE_KINDS} emailOff={w.emailOff ?? []} email={w.email} onChange={(next) => update((x) => ({ ...x, emailOff: next }))} />

        <section className={`${styles.card} ${styles.span4}`} aria-labelledby="data-t">
          <h2 id="data-t" className={styles.sectionTitle}>
            Vos données
          </h2>
          <p className={styles.rowMeta} style={{ marginTop: 8 }}>
            Récupérez tout votre projet dans un fichier, ou effacez votre espace de cet appareil.
          </p>
          <div className={p.dataActions}>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => exportData(w)}>
              Exporter mes données
            </button>
            <button
              type="button"
              className={p.danger}
              onClick={() => {
                if (window.confirm("Effacer votre espace mariage de cet appareil ? Cette action est définitive.")) reset();
              }}
            >
              Supprimer mon espace
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
