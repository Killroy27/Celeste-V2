"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HOME, ROLE_LABEL, signInDemo, signOut, useSession, type Role } from "@/lib/session";
import styles from "@/app/espace/espace.module.css";

const COPY: Record<Role, { icon: string; title: string; text: string; signup?: { label: string; href: string } }> = {
  couple: {
    icon: "/icons/planner-notebook.png",
    title: "Votre espace mariage",
    text: "Connectez-vous pour retrouver votre projet : planning, budget, prestataires, messages et réservations.",
    signup: { label: "Créer notre espace", href: "/connexion?vue=inscription" },
  },
  pro: {
    icon: "/icons/calendar.png",
    title: "Votre espace prestataire",
    text: "Connectez-vous pour répondre aux couples, gérer vos offres, vos disponibilités et vos paiements.",
    signup: { label: "Créer mon compte prestataire", href: "/devenir-prestataire#inscription" },
  },
  admin: {
    icon: "/icons/shield-lock.png",
    title: "Back-office Céleste",
    text: "Accès réservé à l'équipe Céleste, avec des droits selon le rôle de chacun.",
  },
};

// Écran affiché à la place d'un espace quand personne n'est connecté avec le bon rôle (CDC §2, §26).
export function SignInGate({ role }: { role: Role }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useSession();
  const c = COPY[role];
  const suite = encodeURIComponent(pathname);
  const signInHref = `/connexion?role=${role}&suite=${suite}`;

  return (
    <section className={styles.welcome} aria-labelledby="gate-t">
      <Image src={c.icon} alt="" width={104} height={104} />
      <h1 id="gate-t" className={styles.pageTitle}>
        {c.title}
      </h1>
      {session ? (
        <p className={styles.lead}>
          Vous êtes connecté en tant que {ROLE_LABEL[session.role].toLowerCase()} ({session.name}). Cet espace demande un compte {ROLE_LABEL[role].toLowerCase()}.
        </p>
      ) : (
        <p className={styles.lead}>{c.text}</p>
      )}
      <div className={styles.welcomeActions}>
        {session ? (
          <>
            <button
              type="button"
              className="btn"
              onClick={() => {
                signOut();
                router.push(signInHref);
              }}
            >
              Changer de compte
            </button>
            <Link href={HOME[session.role]} className="btn btn-outline">
              Retour à mon espace
            </Link>
          </>
        ) : (
          <>
            <Link href={signInHref} className="btn">
              Se connecter
            </Link>
            {c.signup && (
              <Link href={`${c.signup.href}${c.signup.href.includes("?") ? `&suite=${suite}` : ""}`} className="btn btn-outline">
                {c.signup.label}
              </Link>
            )}
          </>
        )}
      </div>
      <button type="button" className={styles.linkBtn} style={{ alignSelf: "center", justifySelf: "center" }} onClick={() => signInDemo(role)}>
        Essayer avec le compte de démonstration
      </button>
    </section>
  );
}
