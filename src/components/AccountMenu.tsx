"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFavorites } from "@/lib/favorites";
import { initials, ROLE_LABEL, useSession } from "@/lib/session";
import { MenuIcon, UserIcon } from "./icons";
import styles from "./AccountMenu.module.css";

// Liens propres à chaque rôle connecté (CDC §2) : chacun retrouve d'abord son espace.
const ROLE_LINKS = {
  couple: [
    ["/espace", "Mon espace mariage"],
    ["/espace/messages", "Messages"],
    ["/favoris", "Mes coups de cœur"],
    ["/matchs", "Trouver mon Best Match"],
  ],
  pro: [
    ["/espace-pro", "Mon espace prestataire"],
    ["/espace-pro/messages", "Messages"],
    ["/espace-pro/opportunites", "Opportunités"],
    ["/espace-pro/profil", "Ma fiche et mon profil"],
  ],
  admin: [["/admin", "Back-office"]],
} as const;

export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { favorites } = useFavorites();
  const { session, signOut } = useSession();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className={styles.root} ref={root}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={session ? `Menu du compte, connecté : ${session.name}` : "Menu du compte, non connecté"}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        <MenuIcon />
        {session ? (
          <span className={`${styles.avatar} ${styles.signedIn}`} aria-hidden="true">
            {initials(session.name)}
          </span>
        ) : (
          <span className={styles.avatar}>
            <UserIcon />
          </span>
        )}
        {favorites.length > 0 && <span className={styles.dot} aria-hidden="true" />}
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {session ? (
            <>
              <div className={styles.who}>
                <strong>{session.name}</strong>
                <span>
                  {ROLE_LABEL[session.role]} · {session.email}
                </span>
              </div>
              {ROLE_LINKS[session.role].map(([href, label]) => (
                <Link key={href} role="menuitem" href={href} onClick={close} className={styles.strong}>
                  {label}
                </Link>
              ))}
            </>
          ) : (
            <>
              <Link role="menuitem" href="/connexion" onClick={close} className={styles.strong}>
                Connexion
              </Link>
              <Link role="menuitem" href="/connexion?vue=inscription" onClick={close}>
                Inscription
              </Link>
              <hr />
              <Link role="menuitem" href="/favoris" onClick={close} className={styles.strong}>
                Mes coups de cœur{favorites.length > 0 ? ` (${favorites.length})` : ""}
              </Link>
              <Link role="menuitem" href="/matchs" onClick={close} className={styles.strong}>
                Trouver mon Best Match
              </Link>
            </>
          )}
          <hr />
          <Link role="menuitem" href="/decouvrir" onClick={close}>
            Découvrir les prestataires
          </Link>
          <Link role="menuitem" href="/inspirations" onClick={close}>
            Inspirations
          </Link>
          {session?.role !== "pro" && (
            <Link role="menuitem" href="/devenir-prestataire" onClick={close}>
              Devenir prestataire
            </Link>
          )}
          <Link role="menuitem" href="/comment-ca-marche" onClick={close}>
            Comment ça marche
          </Link>
          <Link role="menuitem" href="/contact" onClick={close}>
            Aide et contact
          </Link>
          {session && (
            <>
              <hr />
              <button
                type="button"
                role="menuitem"
                className={styles.signOut}
                onClick={() => {
                  signOut();
                  close();
                  router.push("/");
                }}
              >
                Déconnexion
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
