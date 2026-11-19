// Notifications (CDC §25) : calculées à partir des données du projet, jamais stockées à part, pour ne
// jamais contredire ce que montrent les autres écrans (§15.3). Canaux MVP : in-app et e-mail.
// Prototype : l'envoi des e-mails relève du backend ; les préférences sont enregistrées dans le projet.

import { getVendor } from "./content";
import { conversationOf, coupleNames, OFFER_LABEL, offerStatus, vendorFirstName, type Conversation } from "./deal";
import { isCouple, type Dispute } from "./disputes";
import { addDays, euros, formatDay, formatTime, formatWeekday, isoDate, stamp } from "./format";
import type { Pro, ProDeal } from "./pro";
import { tasksFor, vendorName, type Wedding } from "./wedding";

export type NotifKind =
  | "message"
  | "offre"
  | "offre-expirante"
  | "visite"
  | "reservation"
  | "contrat"
  | "paiement"
  | "rappel"
  | "tache"
  | "litige"
  | "opportunite"
  | "disponibilite"
  | "avis";

export type Notif = { id: string; at: string; kind: NotifKind; title: string; detail?: string; href: string };

// Libellés des préférences e-mail, par type (§25).
export const NOTIF_LABELS: Record<NotifKind, string> = {
  message: "Nouveaux messages",
  offre: "Nouvelles offres et nouvelles versions",
  "offre-expirante": "Offres qui expirent bientôt",
  visite: "Visites et rendez-vous : acceptés, refusés, créneaux alternatifs",
  reservation: "Réservations confirmées",
  contrat: "Contrats à signer",
  paiement: "Paiements à venir, reçus ou échoués",
  rappel: "Rappels de rendez-vous",
  tache: "Tâches importantes",
  litige: "Suivi de vos dossiers de médiation",
  opportunite: "Nouvelles opportunités",
  disponibilite: "Disponibilités à confirmer",
  avis: "Avis et modération",
};

export const COUPLE_KINDS: NotifKind[] = ["message", "offre", "offre-expirante", "visite", "reservation", "contrat", "paiement", "rappel", "tache", "litige"];
export const PRO_KINDS: NotifKind[] = ["opportunite", "message", "disponibilite", "offre", "reservation", "paiement", "avis", "litige"];

const at9 = (day: string) => `${day}T09:00:00`;
// « d'Éclat Mariée », « de Studio Aube » : élision devant une voyelle ou un h muet.
const de = (name: string) => (/^[aeiouyhàâéèêëîïôöûüœ]/i.test(name) ? `d'${name}` : `de ${name}`);
const lastFrom = (c: Conversation, from: "vendor" | "couple") => [...c.messages].reverse().find((m) => m.from === from);

export function coupleNotifications(w: Wedding, disputes: Dispute[], now = new Date()): Notif[] {
  const out: Notif[] = [];
  const today = isoDate(now);
  const nowStamp = stamp(now);

  for (const c of w.conversations) {
    const slug = c.vendorSlug;
    const href = `/espace/messages?c=${slug}`;
    const last = lastFrom(c, "vendor");
    if (last && !last.card) out.push({ id: `msg-${last.id}`, at: last.at, kind: "message", title: `Nouveau message ${de(vendorFirstName(slug))}, ${vendorName(slug)}`, detail: last.text.slice(0, 90), href });
    for (const o of c.offers) {
      out.push({ id: `offre-${o.id}`, at: o.sentAt, kind: "offre", title: o.version > 1 ? `Nouvelle version de l'offre ${de(vendorName(slug))}` : `Nouvelle offre ${de(vendorName(slug))}`, detail: `${o.name}, version ${o.version} · ${OFFER_LABEL[offerStatus(w, slug, o, today)]}`, href: `${href}&offre=1` });
      const st = offerStatus(w, slug, o, today);
      if ((st === "envoyee" || st === "vue" || st === "revisee" || st === "en-discussion") && o.validUntil <= addDays(today, 3) && o.id === c.offers[c.offers.length - 1].id)
        out.push({ id: `exp-${o.id}`, at: at9(addDays(o.validUntil, -3)), kind: "offre-expirante", title: `L'offre ${de(vendorName(slug))} expire le ${formatDay(o.validUntil)}`, detail: "Acceptez-la ou demandez une version à jour", href: `${href}&offre=1` });
    }
    for (const m of c.messages) {
      if (m.from === "celeste" && m.text.startsWith("Réservation confirmée")) out.push({ id: `resa-${m.id}`, at: m.at, kind: "reservation", title: `Réservation confirmée : ${vendorName(slug)}`, detail: m.text.slice(0, 90), href: "/espace/mariage/prestataires" });
    }
  }

  for (const a of w.appointments) {
    const c = conversationOf(w, a.vendorSlug);
    const answer = c ? [...c.messages].reverse().find((m) => m.from === "vendor" && m.card?.kind === "rdv" && m.card.appointmentId === a.id) : undefined;
    if (answer && (a.status === "Confirmée" || a.status === "Créneau alternatif proposé"))
      out.push({ id: `rdv-${a.id}-${a.status}`, at: answer.at, kind: "visite", title: a.status === "Confirmée" ? `${a.kind} confirmé${a.kind === "Visite" || a.kind === "Dégustation" ? "e" : ""} par ${vendorName(a.vendorSlug)}` : `${vendorName(a.vendorSlug)} propose un autre créneau`, detail: `${formatWeekday(a.date)} à ${formatTime(a.date)}`, href: `/espace/messages?c=${a.vendorSlug}` });
    const remind = new Date(new Date(a.date).getTime() - 48 * 3_600_000);
    if (a.status === "Confirmée" && remind <= now && a.date >= nowStamp.slice(0, 16)) out.push({ id: `rappel-${a.id}`, at: stamp(remind), kind: "rappel", title: `Rappel : ${a.kind.toLowerCase()} avec ${vendorName(a.vendorSlug)}`, detail: `${formatWeekday(a.date)} à ${formatTime(a.date)}`, href: "/espace/mariage/planning" });
  }

  for (const d of w.documents.filter((x) => x.kind === "Contrat" && x.status === "À signer"))
    out.push({ id: `contrat-${d.id}`, at: at9(d.date), kind: "contrat", title: `Contrat à signer : ${vendorName(d.vendorSlug)}`, detail: d.label, href: `/espace/reservation/${d.vendorSlug}` });

  for (const p of w.payments.filter((x) => !x.paid && x.due <= addDays(today, 7)))
    out.push({ id: `pay-${p.id}`, at: at9(addDays(p.due, -7)), kind: "paiement", title: p.due < today ? `Paiement en retard : ${vendorName(p.vendorSlug)}` : `Paiement à venir : ${vendorName(p.vendorSlug)}`, detail: `${p.label} · ${euros(p.amount)} avant le ${formatDay(p.due)}`, href: "/espace/mariage/budget" });

  for (const t of tasksFor(w).filter((x) => !x.done && x.important && x.due <= addDays(today, 7)))
    out.push({ id: `tache-${t.id}`, at: at9(addDays(t.due, -7)), kind: "tache", title: `Tâche importante : ${t.label}`, detail: `À faire avant le ${formatDay(t.due)}`, href: "/espace/mariage/planning" });

  const couple = coupleNames(w);
  for (const d of disputes.filter((x) => isCouple(x, couple, w.email))) {
    if (d.decision?.at) out.push({ id: `dec-${d.id}`, at: d.decision.at, kind: "litige", title: `Dossier ${d.ref} clos : ${d.decision.kind.toLowerCase()}`, detail: d.decision.note.slice(0, 90), href: "/espace/mariage/prestataires" });
    for (const n of (d.notes ?? []).filter((x) => x.from !== "couple"))
      out.push({ id: `lit-${n.id}`, at: n.at, kind: "litige", title: `Dossier ${d.ref} : ${n.from === "celeste" ? "message de Céleste" : `réponse de ${getVendor(d.vendorSlug)?.name ?? "du prestataire"}`}`, detail: n.text.slice(0, 90), href: "/espace/mariage/prestataires" });
  }

  return finish(out, now);
}

export function proNotifications(pro: Pro, deals: ProDeal[], disputes: Dispute[], slug: string, now = new Date()): Notif[] {
  const out: Notif[] = [];
  for (const o of pro.opportunities.filter((x) => x.status === "nouvelle" && x.slots.taken < x.slots.max))
    out.push({ id: `opp-${o.id}`, at: o.receivedAt, kind: "opportunite", title: `Nouvelle opportunité : ${o.names.join(" & ")}`, detail: `${o.compat} % compatible · ${formatDay(o.date)} · ${o.zone}`, href: `/espace-pro/opportunites?o=${o.id}` });
  for (const d of deals) {
    const name = coupleNames(d.w);
    const href = `/espace-pro/messages?d=${d.id}`;
    const last = lastFrom(d.conv, "couple");
    if (last) out.push({ id: `pmsg-${last.id}`, at: last.at, kind: "message", title: `Nouveau message ${de(name)}`, detail: last.text.slice(0, 90), href });
    for (const o of d.conv.offers.filter((x) => x.acceptedAt)) out.push({ id: `acc-${o.id}`, at: o.acceptedAt!, kind: "offre", title: `${name} ont accepté votre offre`, detail: `${o.name}, version ${o.version}`, href });
    for (const p of d.w.payments.filter((x) => x.vendorSlug === slug && x.paid && x.paidAt))
      out.push({ id: `ppay-${p.id}`, at: p.paidAt!, kind: "paiement", title: `Paiement reçu ${de(name)}`, detail: `${p.label} · ${euros(p.amount)}`, href: "/espace-pro/paiements" });
    for (const a of d.w.appointments.filter((x) => x.vendorSlug === slug && x.status === "Demandée")) {
      const req = [...d.conv.messages].reverse().find((m) => m.card?.kind === "rdv" && m.card.appointmentId === a.id);
      if (req) out.push({ id: `dispo-${a.id}`, at: req.at, kind: "disponibilite", title: `${a.kind} demandé par ${name}`, detail: `${formatWeekday(a.date)} à ${formatTime(a.date)} : à confirmer`, href: "/espace-pro/activite?vue=visites" });
    }
    for (const x of disputes.filter((y) => y.vendorSlug === slug && isCouple(y, name, d.w.email))) {
      if (x.decision?.at) out.push({ id: `pdec-${x.id}`, at: x.decision.at, kind: "litige", title: `Dossier ${x.ref} clos : ${x.decision.kind.toLowerCase()}`, detail: x.decision.note.slice(0, 90), href: "/espace-pro/activite?vue=reservations" });
      for (const n of (x.notes ?? []).filter((m) => m.from !== "prestataire"))
        out.push({ id: `plit-${n.id}`, at: n.at, kind: "litige", title: `Dossier ${x.ref} : ${n.from === "celeste" ? "message de Céleste" : `message de ${name}`}`, detail: n.text.slice(0, 90), href: "/espace-pro/activite?vue=reservations" });
    }
  }
  for (const [i, r] of Object.entries(pro.reports ?? {}))
    if (r.status !== "Signalé") out.push({ id: `mod-${i}-${r.status}`, at: r.decidedAt ?? r.at, kind: "avis", title: `Avis signalé : ${r.status === "Retiré" ? "retiré" : "conservé"} par la modération`, href: "/espace-pro/profil?vue=avis" });
  return finish(out, now);
}

// Seulement ce qui est déjà arrivé, du plus récent au plus ancien.
function finish(list: Notif[], now: Date) {
  const n = stamp(now);
  return list.filter((x) => x.at <= n).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 40);
}

// Repère de lecture par défaut : tout ce qui date de plus de trois jours est considéré comme lu.
export const defaultReadAt = (now = new Date()) => `${addDays(isoDate(now), -3)}T00:00:00`;
