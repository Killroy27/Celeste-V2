"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { DEMO, HOME, ROLE_LABEL, setPasswordAndSignIn, signIn, signInDemo, signUpCouple, useSession, type Role } from "@/lib/session";
import styles from "./connexion.module.css";

type View = "connexion" | "inscription";

// Retour après connexion : uniquement une page du site (jamais une adresse externe).
const safeNext = (v: string | null) => (v && v.startsWith("/") && !v.startsWith("//") ? v : null);

// Photo de la colonne de droite, selon le profil choisi.
const PHOTO: Record<Role | "choix", { src: string; pos: string }> = {
  choix: { src: "/photos/field.jpg", pos: "50% 35%" },
  couple: { src: "/photos/kente.jpg", pos: "50% 30%" },
  pro: { src: "/photos/photog.jpg", pos: "50% 40%" },
  admin: { src: "/photos/chateau.jpg", pos: "50% 50%" },
};

const CHOICES: { role: Role; title: string; text: string }[] = [
  { role: "couple", title: "Céleste pour les couples", text: "Préparez votre mariage : prestataires, budget, messages et réservations au même endroit." },
  { role: "pro", title: "Céleste pour les professionnels", text: "Recevez des couples compatibles, envoyez vos offres et encaissez vos réservations." },
];

const Arrow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Back = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

// Connexion en deux temps (benchmark Fresha) : on choisit d'abord son profil, puis on se connecte ou on crée son compte.
export function SignIn() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("suite"));
  const asked = params.get("role");
  const [role, setRole] = useState<Role | null>(asked === "couple" || asked === "pro" || asked === "admin" ? asked : params.get("vue") === "inscription" ? "couple" : null);
  const [view, setView] = useState<View>(params.get("vue") === "inscription" && asked !== "admin" ? "inscription" : "connexion");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [choosePwd, setChoosePwd] = useState<string | null>(null); // e-mail d'un compte sans mot de passe
  const [showPwd, setShowPwd] = useState(false);
  const { session, ready, signOut } = useSession();

  const go = (r: Role) => router.push(next ?? HOME[r]);
  const reset = () => {
    setError(null);
    setInfo(null);
    setChoosePwd(null);
  };
  const pick = (r: Role | null) => {
    setRole(r);
    setView("connexion");
    reset();
  };

  const photo = PHOTO[session && ready ? session.role : (role ?? "choix")];

  let body: React.ReactNode;

  if (ready && session) {
    body = (
      <div className={styles.content}>
        <h1 className={styles.title}>Vous êtes connecté</h1>
        <div className={styles.who}>
          <strong>{session.name}</strong>
          <span>
            {ROLE_LABEL[session.role]} · {session.email}
          </span>
        </div>
        <Link href={next ?? HOME[session.role]} className="btn btn-block">
          {session.role === "couple" ? "Ouvrir mon espace mariage" : session.role === "pro" ? "Ouvrir mon espace prestataire" : "Ouvrir le back-office"}
        </Link>
        <button type="button" className={styles.textBtn} onClick={signOut}>
          Se déconnecter pour changer de compte
        </button>
      </div>
    );
  } else if (!role) {
    // Étape 1 : le profil.
    body = (
      <div className={styles.content}>
        <h1 className={styles.title}>S&apos;inscrire ou se connecter</h1>
        <p className={styles.lead}>Explorer la marketplace ne demande aucun compte. Il sert à retrouver votre espace, vos messages et vos réservations.</p>
        <div className={styles.choices}>
          {CHOICES.map((c) => (
            <button key={c.role} type="button" className={styles.choice} onClick={() => pick(c.role)}>
              <span>
                <strong>{c.title}</strong>
                <small>{c.text}</small>
              </span>
              <Arrow />
            </button>
          ))}
        </div>
      </div>
    );
  } else {
    // Étape 2 : se connecter ou créer son compte, pour le profil choisi.
    body = (
      <div className={styles.content}>
        <p className={styles.kicker}>{role === "admin" ? "Équipe Céleste" : role === "couple" ? "Céleste pour les couples" : "Céleste pour les professionnels"}</p>
        <h1 className={styles.title}>{role === "admin" ? "Accès équipe" : choosePwd ? "Choisissez un mot de passe" : view === "connexion" ? "Bon retour" : role === "couple" ? "Créer votre espace" : "Créer votre compte"}</h1>
        {role === "admin" && <p className={styles.lead}>Réservé aux membres de l&apos;équipe, avec des droits selon leur rôle.</p>}

        {role !== "admin" && !choosePwd && (
          <div className={styles.tabs} role="tablist" aria-label="Connexion ou inscription">
            {(["connexion", "inscription"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => {
                  setView(v);
                  reset();
                }}
              >
                {v === "connexion" ? "Se connecter" : "Créer un compte"}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {info && (
          <p className={styles.info} role="status">
            {info}
          </p>
        )}

        {choosePwd ? (
          // Compte créé sans mot de passe (en écrivant à un prestataire) : il le choisit à la première connexion.
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const pwd = String(f.get("pwd") ?? "");
              if (pwd.length < 8) return setError("Le mot de passe doit compter au moins 8 caractères.");
              if (pwd !== String(f.get("pwd2") ?? "")) return setError("Les deux mots de passe ne correspondent pas.");
              const r = setPasswordAndSignIn(role, choosePwd, pwd);
              if (r.ok) go(r.role);
              else setError(r.error);
            }}
          >
            <p className={styles.muted}>{choosePwd}</p>
            <label className="field">
              Nouveau mot de passe
              <input name="pwd" type="password" autoComplete="new-password" minLength={8} required autoFocus />
            </label>
            <label className="field">
              Confirmez le mot de passe
              <input name="pwd2" type="password" autoComplete="new-password" minLength={8} required />
            </label>
            <button type="submit" className="btn btn-block">
              Enregistrer et me connecter
            </button>
            <button type="button" className={styles.textBtn} onClick={reset}>
              Utiliser une autre adresse
            </button>
          </form>
        ) : view === "connexion" || role === "admin" ? (
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              reset();
              const f = new FormData(e.currentTarget);
              const email = String(f.get("email") ?? "");
              const r = signIn(role, email, String(f.get("pwd") ?? ""));
              if (r.ok) return go(r.role);
              setError(r.error);
              if (r.needsPassword) setChoosePwd(email.trim().toLowerCase());
            }}
          >
            <label className="field">
              E-mail
              <input name="email" type="email" autoComplete="email" required autoFocus />
            </label>
            <label className="field">
              Mot de passe
              <span className={styles.pwd}>
                <input name="pwd" type={showPwd ? "text" : "password"} autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPwd((s) => !s)} aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                  {showPwd ? "Masquer" : "Afficher"}
                </button>
              </span>
            </label>
            <button
              type="button"
              className={styles.forgot}
              onClick={() => {
                setError(null);
                setInfo("Prototype : en production, un lien de réinitialisation vous serait envoyé par e-mail. Ici, utilisez un compte de démonstration ou créez un compte.");
              }}
            >
              Mot de passe oublié ?
            </button>
            <button type="submit" className="btn btn-block">
              Se connecter
            </button>
          </form>
        ) : role === "couple" ? (
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              reset();
              const f = new FormData(e.currentTarget);
              const pwd = String(f.get("pwd") ?? "");
              if (pwd.length < 8) return setError("Le mot de passe doit compter au moins 8 caractères.");
              const r = signUpCouple({ firstName: String(f.get("prenom") ?? ""), partner: String(f.get("partenaire") ?? ""), email: String(f.get("email") ?? ""), pwd });
              if (r.ok) go(r.role);
              else setError(r.error);
            }}
          >
            <div className={styles.row2}>
              <label className="field">
                Votre prénom
                <input name="prenom" autoComplete="given-name" required autoFocus />
              </label>
              <label className="field">
                Prénom de votre partenaire
                <input name="partenaire" placeholder="Facultatif" />
              </label>
            </div>
            <label className="field">
              E-mail
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label className="field">
              Mot de passe (8 caractères minimum)
              <input name="pwd" type="password" autoComplete="new-password" minLength={8} required />
            </label>
            <label className={styles.consent}>
              <input type="checkbox" required />
              <span>
                J&apos;accepte les{" "}
                <Link href="/cgu" target="_blank">
                  conditions générales
                </Link>{" "}
                et la{" "}
                <Link href="/confidentialite" target="_blank">
                  politique de confidentialité
                </Link>
                .
              </span>
            </label>
            <button type="submit" className="btn btn-block">
              Créer notre espace
            </button>
            <p className={styles.muted}>Un seul compte pour vous deux : un projet, un budget, un historique.</p>
          </form>
        ) : (
          <div className={styles.form}>
            <p className={styles.lead}>L&apos;inscription présente votre activité (métier, entreprise, ville). Elle prend deux minutes, sur la page dédiée aux professionnels.</p>
            <Link href="/devenir-prestataire#inscription" className="btn btn-block">
              Créer mon compte prestataire
            </Link>
          </div>
        )}

        <div className={styles.demo}>
          <span className={styles.demoTitle}>ou</span>
          <button
            type="button"
            className={styles.demoBtn}
            onClick={() => {
              signInDemo(role);
              go(role);
            }}
          >
            <span>
              <strong>Explorer avec le compte de démonstration</strong>
              <small>{DEMO[role].name}</small>
            </span>
            <Arrow />
          </button>
        </div>
        <p className={styles.note}>Prototype : la connexion est simulée dans ce navigateur, sans serveur. Ne saisissez pas un vrai mot de passe.</p>
      </div>
    );
  }

  return (
    <div className={styles.split} data-espace="connexion">
      <div className={styles.left}>
        <div className={styles.top}>
          {role && !(ready && session) ? (
            <button type="button" className={styles.back} onClick={() => pick(null)} aria-label="Revenir au choix du profil">
              <Back />
            </button>
          ) : (
            <Link href="/" className={styles.back} aria-label="Retour au site">
              <Back />
            </Link>
          )}
          <Link href="/" className={styles.brand} aria-label="Céleste, accueil">
            <Image src="/brand/monogram.png" alt="" width={26} height={27} />
            <span>Céleste</span>
          </Link>
          <span className={styles.topSpacer} />
        </div>

        {body}

        <nav className={styles.footer} aria-label="Liens utiles">
          <Link href="/contact">Aide et contact</Link>
          {role === "admin" ? (
            <button type="button" onClick={() => pick(null)}>
              Vous êtes un couple ou un prestataire ?
            </button>
          ) : (
            <button type="button" onClick={() => pick("admin")}>
              Accès équipe Céleste
            </button>
          )}
        </nav>
      </div>

      <div className={styles.photo} aria-hidden="true">
        <Image key={photo.src} src={photo.src} alt="" fill priority sizes="50vw" style={{ objectFit: "cover", objectPosition: photo.pos }} />
      </div>
    </div>
  );
}
