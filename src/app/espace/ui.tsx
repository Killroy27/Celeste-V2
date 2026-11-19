"use client";

// Petits éléments partagés par les pages de l'espace couple.
import { useEffect, useRef } from "react";
import { parseDate } from "@/lib/format";
import styles from "./espace.module.css";

// Couleur d'un statut selon sa nature (docs/direction-artistique.md §3.4) : point + libellé, jamais la couleur seule.
const TONES: Record<string, string> = {
  Confirmée: styles.sPos,
  Signé: styles.sPos,
  Payée: styles.sPos,
  Payé: styles.sPos,
  Réservé: styles.sPos,
  Terminé: styles.sNeutral,
  Demandée: styles.sActive,
  Reçu: styles.sActive,
  "Conversation en cours": styles.sActive,
  "Créneau alternatif proposé": styles.sWait,
  "Paiement à venir": styles.sWait,
  "À signer": styles.sWait,
  "Offre reçue": styles.sWait,
  "À rechercher": styles.sNeutral,
  "En retard": styles.sNeg,
  // États d'offre (§11.2), tels qu'affichés au couple
  // « Offre reçue » est déjà défini plus haut (ton « en attente » : le couple doit répondre).
  Brouillon: styles.sNeutral,
  "En discussion": styles.sWait,
  "Nouvelle version": styles.sActive,
  Acceptée: styles.sPos,
  "Réservation confirmée": styles.sPos,
  Refusée: styles.sNeg,
  Expirée: styles.sNeutral,
  Retirée: styles.sNeutral,
  Remplacée: styles.sNeutral,
  // Espace prestataire (§16 à §19)
  Vérifié: styles.sPos,
  Validé: styles.sPos,
  "Vérification en cours": styles.sWait,
  "En attente": styles.sWait,
  "À fournir": styles.sNeg,
  "Select : en progression": styles.sNeutral,
  Nouvelle: styles.sActive,
  Répondue: styles.sPos,
  Déclinée: styles.sNeutral,
  "Places complètes": styles.sNeutral,
  "Disponible confirmé": styles.sPos,
  "Probablement disponible": styles.sActive,
  "Capacité limitée": styles.sWait,
  "À confirmer": styles.sWait,
  Complet: styles.sNeg,
  Envoyée: styles.sActive,
  Vue: styles.sWait,
  Révisée: styles.sActive,
  Encaissé: styles.sPos,
  // Back-office (§20, §23, §24)
  "À vérifier": styles.sWait,
  Incomplet: styles.sNeutral,
  Suspendu: styles.sNeg,
  Averti: styles.sNeutral,
  "Nouveau signal": styles.sWait,
  "Paiement échoué": styles.sNeg,
  Relancé: styles.sWait,
  Gelé: styles.sNeg,
  "À programmer": styles.sWait,
  "À exécuter": styles.sWait,
  "Dossier clos": styles.sNeutral,
  "Dossier ouvert": styles.sActive,
  "Accusé de réception et motif qualifié": styles.sWait,
  "Reversement gelé": styles.sWait,
  "Preuves collectées": styles.sWait,
  "Réponse des parties (5 jours ouvrés)": styles.sWait,
  "Résolution proposée": styles.sWait,
  Signalé: styles.sWait,
  Conservé: styles.sPos,
  Retiré: styles.sNeutral,
  Résolu: styles.sPos,
  Publié: styles.sPos,
  "Signalé à Céleste": styles.sWait,
  "Retiré par la modération": styles.sNeutral,
  "Conservé par la modération": styles.sPos,
  "À venir": styles.sWait,
};

export function StatusChip({ status }: { status: string }) {
  return <span className={`${styles.status} ${TONES[status] ?? styles.sNeutral}`}>{status}</span>;
}

const monthFmt = new Intl.DateTimeFormat("fr-FR", { month: "short" });

export function DateBadge({ iso }: { iso: string }) {
  const d = parseDate(iso);
  return (
    <span className={styles.rowDate} aria-hidden="true">
      <strong>{d.getDate()}</strong>
      {monthFmt.format(d).replace(".", "")}
    </span>
  );
}

// Fenêtre modale native : focus piégé, Échap et fond gérés par le navigateur. Un clic sur le fond la ferme.
export function Modal({ open, onClose, labelledBy, className, children }: { open: boolean; onClose: () => void; labelledBy: string; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const downOnBackdrop = useRef(false);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`${styles.modal} ${className ?? ""}`}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onMouseDown={(e) => {
        downOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        // Une sélection de texte relâchée sur le fond ne doit pas fermer la fenêtre (et perdre la saisie).
        if (e.target === e.currentTarget && downOnBackdrop.current) onClose();
        downOnBackdrop.current = false;
      }}
    >
      {open && children}
    </dialog>
  );
}
