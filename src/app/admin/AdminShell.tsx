"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useState } from "react";
import { can, openDisputes, PERMISSIONS, ROLES, useAdmin, vendorState, type Admin, type Role, type Section } from "@/lib/admin";
import { useDisputes } from "@/lib/disputes";
import { usePro } from "@/lib/pro";
import { useSession } from "@/lib/session";
import { SignInGate } from "@/components/SignInGate";
import { Modal } from "../espace/ui";
import styles from "../espace/espace.module.css";
import a from "./admin.module.css";

// Navigation du back-office (CDC §20.1).
const NAV: { href: string; label: string; section: Section; icon: string }[] = [
  { href: "/admin", label: "Dashboard", section: "dashboard", icon: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { href: "/admin/utilisateurs", label: "Utilisateurs", section: "utilisateurs", icon: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 11a3 3 0 1 0 0-6M22 21a6 6 0 0 0-4-5.6" },
  { href: "/admin/prestataires", label: "Prestataires", section: "prestataires", icon: "M4 7h16v13H4zM9 7V4h6v3M4 12h16" },
  { href: "/admin/marketplace", label: "Marketplace", section: "marketplace", icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" },
  { href: "/admin/reservations", label: "Réservations", section: "reservations", icon: "M4 5h16v16H4zM4 9h16M9 3v4M15 3v4" },
  { href: "/admin/finance", label: "Finance", section: "finance", icon: "M3 6h18v12H3zM3 10h18M7 15h3" },
  { href: "/admin/support", label: "Support", section: "support", icon: "M4 5h16v11H8l-4 4z" },
  { href: "/admin/parametres", label: "Paramètres", section: "parametres", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/* ---------- Action sensible : motif obligatoire, puis journal d'audit (§20.5) ---------- */

type Ask = (opts: { action: string; target: string; confirm?: string; danger?: boolean; hint?: string }, fn?: (x: Admin) => Admin) => void;
const AskContext = createContext<Ask>(() => {});
export const useAsk = () => useContext(AskContext);

type Pending = { action: string; target: string; confirm?: string; danger?: boolean; hint?: string; fn?: (x: Admin) => Admin };

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { admin, ready, start, update, act } = useAdmin();
  // Accès admin restreint (CDC §26) : réservé au compte équipe connecté.
  const { session, ready: sessionReady } = useSession();
  const allowed = session?.role === "admin";
  const { disputes } = useDisputes();
  const { pro } = usePro();
  const proReports = pro && !pro.account ? Object.values(pro.reports ?? {}).filter((r) => r.status === "Signalé").length : 0;
  const [pending, setPending] = useState<Pending | null>(null);
  const [reason, setReason] = useState("");
  const ask = useCallback<Ask>((opts, fn) => {
    setReason("");
    setPending({ ...opts, fn });
  }, []);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const counts: Partial<Record<Section, number>> = admin
    ? {
        prestataires: Object.keys(admin.cases).filter((s) => vendorState(admin, s) === "À vérifier").length,
        support: openDisputes(disputes).length + admin.tickets.filter((t) => t.status === "Ouvert").length + admin.reviews.filter((r) => r.status === "Signalé").length + proReports,
        finance: admin.failed.filter((f) => f.status === "Échoué").length,
      }
    : {};
  const badge = (s: Section) =>
    counts[s] ? (
      <span className={styles.navBadge}>
        {counts[s]}
        <span className="visually-hidden"> à traiter</span>
      </span>
    ) : null;

  return (
    <AskContext.Provider value={ask}>
      <div className={`${styles.shell} ${a.shell}`} data-espace="admin">
        <aside className={styles.side}>
          <Link href="/" className={styles.brand} aria-label="Céleste, retour au site">
            <Image src="/brand/monogram.png" alt="" width={28} height={29} />
            <span>
              Céleste <small className={a.brandTag}>Admin</small>
            </span>
          </Link>
          <nav aria-label="Back-office">
            <ul className={styles.nav}>
              {NAV.map((n) => {
                const allowed = !admin || can(admin.role, n.section);
                return (
                  <li key={n.href}>
                    <Link href={n.href} className={`${styles.navLink} ${allowed ? "" : a.locked}`} aria-current={active(n.href) ? "page" : undefined}>
                      <Icon d={n.icon} />
                      <span>{n.label}</span>
                      {allowed ? badge(n.section) : <span className="visually-hidden"> (accès restreint)</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {admin && allowed && (
            <label className={a.role}>
              <span>Rôle de démonstration</span>
              <select value={admin.role} onChange={(e) => update((x) => ({ ...x, role: e.target.value as Role }))}>
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
          )}
        </aside>

        <div className={`${styles.main} ${a.main}`}>
          {!ready || !sessionReady ? (
            <div className={styles.loading} aria-busy="true" />
          ) : !allowed ? (
            <SignInGate role="admin" />
          ) : !admin ? (
            <section className={styles.welcome}>
              <Image src="/icons/shield-lock.png" alt="" width={104} height={104} />
              <h1 className={styles.pageTitle}>Back-office Céleste</h1>
              <p className={styles.lead}>Opérer la marketplace : vérifier les prestataires, suivre réservations et paiements, traiter litiges et signalements, ajuster les règles sans déploiement.</p>
              <div className={styles.welcomeActions}>
                <button type="button" className="btn" onClick={start}>
                  Ouvrir le back-office de démonstration
                </button>
              </div>
              <p className={styles.small}>Démonstration : les données restent sur cet appareil. En production, l&apos;accès est restreint et chaque rôle contrôlé côté serveur.</p>
            </section>
          ) : (
            <>
              <p className={styles.demo}>
                Back-office de démonstration, rôle « {admin.role} ». Les actions sensibles demandent un motif et sont tracées dans le journal d&apos;audit.
              </p>
              {children}
            </>
          )}
        </div>

        <nav className={`${styles.tabbar} ${a.tabbar}`} aria-label="Back-office">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={styles.tab} aria-current={active(n.href) ? "page" : undefined}>
              <Icon d={n.icon} />
              <span>{n.label}</span>
              {admin && can(admin.role, n.section) && badge(n.section)}
            </Link>
          ))}
        </nav>

        <Modal open={!!pending} onClose={() => setPending(null)} labelledBy="reason-t">
          {pending && (
            <form
              className={a.reasonForm}
              onSubmit={(e) => {
                e.preventDefault();
                if (reason.trim().length < 5) return;
                act(pending.action, pending.target, reason, pending.fn);
                setPending(null);
              }}
            >
              <h2 id="reason-t" className={styles.sectionTitle}>
                {pending.action}
              </h2>
              <p className={styles.rowMeta}>{pending.target}</p>
              {pending.hint && <p className={a.hint}>{pending.hint}</p>}
              <label className="field">
                Motif (obligatoire, inscrit au journal d&apos;audit)
                <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} autoFocus placeholder="Pourquoi cette action ?" />
              </label>
              <div className={a.actions}>
                <button type="submit" className={`btn ${pending.danger ? a.danger : ""}`} disabled={reason.trim().length < 5}>
                  {pending.confirm ?? "Confirmer"}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setPending(null)}>
                  Annuler
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </AskContext.Provider>
  );
}

// Garde de section : contenu réservé aux rôles autorisés (§20.6).
export function Guard({ section, children }: { section: Section; children: React.ReactNode }) {
  const { admin } = useAdmin();
  if (!admin) return null;
  if (can(admin.role, section)) return <>{children}</>;
  return (
    <div className={styles.empty}>
      <Image src="/icons/shield-lock.png" alt="" width={72} height={72} />
      <p>
        Cette section est réservée aux rôles : {PERMISSIONS[section].join(", ")}. Votre rôle actuel : {admin.role}.
      </p>
    </div>
  );
}
