"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { bookingFor } from "@/lib/booking";
import {
  detectContact,
  isOpen,
  lastMessage,
  latestOffer,
  markVendorRead,
  OFFER_LABEL_PRO,
  offerChanges,
  offerStatus,
  offerTotal,
  setManualVendor,
  vendorAnswerSlot,
  vendorMessage,
  vendorOffer,
  vendorUnread,
  withdrawOffer,
  type Message,
} from "@/lib/deal";
import { euros, formatDate, formatDay, formatTime, formatWeekday, relativeDay, shortWhen } from "@/lib/format";
import { dealAppointments, dealName, dealPayments, LIVE_ID, PRO_SLUG, startingDraft, useDeals, type Pro, type ProDeal } from "@/lib/pro";
import { Modal, StatusChip } from "../../espace/ui";
import styles from "../../espace/espace.module.css";
import m from "../../espace/messages/messages.module.css";
import { OfferBuilder } from "../OfferBuilder";
import { SlotProposer } from "../SlotProposer";
import p from "../pro.module.css";

const initials = (d: ProDeal) => d.w.names.filter(Boolean).map((n) => n[0]).join("");
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Initials({ d, size = 44 }: { d: ProDeal; size?: number }) {
  return (
    <span className={p.initials} style={{ width: size, height: size }} aria-hidden="true">
      {initials(d)}
    </span>
  );
}

function preview(msg: Message | undefined, d: ProDeal) {
  if (!msg) return "";
  const who = msg.from === "vendor" ? "Vous : " : "";
  if (msg.card?.kind === "offre") {
    const o = d.conv.offers.find((x) => x.id === (msg.card as { offerId: string }).offerId);
    return `${who}Offre, version ${o?.version ?? ""}`;
  }
  return who + (msg.text || "Proposition de rendez-vous");
}

// Messages côté prestataire (CDC §11, §30.2) : mêmes conversations que celles des couples, vues de l'autre côté.
export function ProMessages() {
  const { deals, apply, pro } = useDeals();
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("d");
  const [dealOpen, setDealOpen] = useState(false);
  const [openFor, setOpenFor] = useState<string | null>(null);
  if (openFor !== id) {
    setOpenFor(id);
    setDealOpen(false);
  }
  const sorted = [...deals].sort((a, b) => (lastMessage(b.conv)?.at ?? "").localeCompare(lastMessage(a.conv)?.at ?? ""));
  const current = deals.find((d) => d.id === id);
  const unread = current ? vendorUnread(current.conv) : 0;
  const firstId = sorted[0]?.id;

  useEffect(() => {
    if (!id && firstId && window.matchMedia("(min-width: 901px)").matches) router.replace(`/espace-pro/messages?d=${firstId}`);
  }, [id, firstId, router]);

  const currentId = current?.id;
  useEffect(() => {
    if (currentId && unread) apply(currentId, (w) => markVendorRead(w, PRO_SLUG));
  }, [currentId, unread, apply]);

  if (!pro) return null;

  if (!deals.length) {
    return (
      <>
        <header className={styles.pageHead}>
          <div>
            <h1 className={styles.pageTitle}>Messages</h1>
            <p className={styles.lead}>Vos échanges avec les couples, vos offres et leurs versions.</p>
          </div>
        </header>
        <div className={styles.empty}>
          <p>Aucune conversation pour l&apos;instant. Les couples vous écrivent depuis votre fiche, ou vous répondez à une opportunité avec une offre : tout arrive ici.</p>
          <Link href="/espace-pro/opportunites" className="btn btn-sm">
            Voir les opportunités
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className={m.layout} data-view={current ? "thread" : "list"} data-deal={dealOpen ? "open" : "closed"}>
      <aside className={m.list} aria-label="Conversations">
        <h1 className={m.title}>Messages</h1>
        <ul className={m.items}>
          {sorted.map((d) => {
            const n = vendorUnread(d.conv);
            const last = lastMessage(d.conv);
            return (
              <li key={d.id}>
                <Link href={`/espace-pro/messages?d=${d.id}`} className={m.item} aria-current={d.id === id ? "true" : undefined}>
                  <Initials d={d} />
                  <span className={m.itemText}>
                    <span className={m.itemTop}>
                      <strong>{dealName(d)}</strong>
                      {last && <time dateTime={last.at}>{shortWhen(last.at)}</time>}
                    </span>
                    <span className={`${m.itemSub} ${n ? m.itemUnread : ""}`}>{d.live ? `Démo couple · ${preview(last, d)}` : preview(last, d)}</span>
                  </span>
                  {n > 0 && (
                    <span className={m.badge}>
                      {n}
                      <span className="visually-hidden"> non lu{n > 1 ? "s" : ""}</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      {current ? (
        <>
          {/* Une clé par dossier : brouillon et formulaires ne passent jamais d'un couple à l'autre. */}
          <Thread key={`t-${current.id}`} d={current} apply={apply} onOpenDeal={() => setDealOpen(true)} />
          <VendorDeal key={`d-${current.id}`} d={current} pro={pro} apply={apply} onClose={() => setDealOpen(false)} />
          <button type="button" className={m.scrim} aria-label="Fermer le dossier" tabIndex={-1} onClick={() => setDealOpen(false)} />
        </>
      ) : (
        <section className={m.placeholder} aria-label="Conversation">
          <p>Choisissez une conversation.</p>
        </section>
      )}
    </div>
  );
}

type Apply = (id: string, fn: (w: ProDeal["w"]) => ProDeal["w"]) => void;

function Thread({ d, apply, onOpenDeal }: { d: ProDeal; apply: Apply; onOpenDeal: () => void }) {
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const o = latestOffer(d.conv);
  const warning = detectContact(text);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [d.id, d.conv.messages.length]);

  const send = () => {
    if (!text.trim()) return;
    apply(d.id, (w) => vendorMessage(w, PRO_SLUG, text.trim()));
    setText("");
  };

  let lastDay = "";
  return (
    <section className={m.thread} aria-label={`Conversation avec ${dealName(d)}`}>
      <header className={m.threadHead}>
        <Link href="/espace-pro/messages" className={m.back} aria-label="Retour aux conversations">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <Initials d={d} />
        <div className={m.who}>
          <h2>{dealName(d)}</h2>
          <p>
            Mariage le {formatDate(d.w.date)} · {d.w.guests} invités · {d.style}
          </p>
        </div>
      </header>

      <button type="button" className={m.offerBar} onClick={onOpenDeal}>
        {o ? (
          <>
            <span>
              <strong>{euros(offerTotal(o))}</strong> · version {o.version} · {o.name}
            </span>
            <StatusChip status={OFFER_LABEL_PRO[offerStatus(d.w, PRO_SLUG, o)]} />
          </>
        ) : (
          <span>Dossier : offre, rendez-vous, réservation</span>
        )}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div ref={scroller} className={m.scroller}>
        <ol className={m.messages}>
          {d.conv.messages.map((msg) => {
            const day = relativeDay(msg.at);
            const showDay = day !== lastDay;
            lastDay = day;
            return (
              <MessageRow key={msg.id} d={d} msg={msg} day={showDay ? day : null} />
            );
          })}
        </ol>
      </div>

      <div className={m.composer}>
        {warning && (
          <p className={m.warning} role="status">
            Ce message semble contenir {warning}. Un échange ou une réservation hors de Céleste vous prive du contrat, du paiement via Céleste et de la médiation ; des envois répétés peuvent réduire vos opportunités.
          </p>
        )}
        <form
          className={m.inputRow}
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label className="visually-hidden" htmlFor="pro-composer">
            Votre message à {dealName(d)}
          </label>
          <textarea
            id="pro-composer"
            rows={1}
            value={text}
            placeholder={`Écrire à ${dealName(d)}…`}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button type="submit" className={`${m.roundBtn} ${m.sendBtn}`} disabled={!text.trim()} aria-label="Envoyer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}

function MessageRow({ d, msg, day }: { d: ProDeal; msg: Message; day: string | null }) {
  const card = msg.card;
  return (
    <>
      {day && (
        <li className={m.day}>
          <span>{day}</span>
        </li>
      )}
      {msg.from === "celeste" ? (
        <li className={m.system}>
          <span>{msg.text}</span>
        </li>
      ) : (
        <li className={msg.from === "vendor" ? m.mine : m.theirs}>
          <div className={m.bubble}>
            <span className="visually-hidden">{msg.from === "vendor" ? "Vous" : dealName(d)} : </span>
            {msg.text && <p className={m.text}>{msg.text}</p>}
            {msg.file && <p className={m.text}>Fichier : {msg.file.name}</p>}
            {card?.kind === "offre" &&
              (() => {
                const o = d.conv.offers.find((x) => x.id === card.offerId);
                if (!o) return null;
                return (
                  <div className={m.card}>
                    <div className={m.cardHead}>
                      <span className={m.cardEyebrow}>Offre · version {o.version}</span>
                      <StatusChip status={o.id === latestOffer(d.conv)?.id || o.status === "acceptee" ? OFFER_LABEL_PRO[offerStatus(d.w, PRO_SLUG, o)] : "Remplacée"} />
                    </div>
                    <strong className={m.cardTitle}>{o.name}</strong>
                    <span className={m.cardAmount}>{euros(offerTotal(o))}</span>
                  </div>
                );
              })()}
            {card?.kind === "rdv" &&
              (() => {
                const a = d.w.appointments.find((x) => x.id === card.appointmentId);
                if (!a) return null;
                return (
                  <div className={m.card}>
                    <div className={m.cardHead}>
                      <span className={m.cardEyebrow}>{a.kind}</span>
                      <StatusChip status={a.status} />
                    </div>
                    <strong className={m.cardTitle}>
                      {cap(formatWeekday(a.date))} à {formatTime(a.date)}
                    </strong>
                  </div>
                );
              })()}
            <time className={m.time} dateTime={msg.at}>
              {formatTime(msg.at)}
            </time>
          </div>
        </li>
      )}
    </>
  );
}

/* ---------- Dossier côté prestataire ---------- */

function VendorDeal({ d, pro, apply, onClose }: { d: ProDeal; pro: Pro; apply: Apply; onClose: () => void }) {
  const [building, setBuilding] = useState(false);
  const [alt, setAlt] = useState<{ id: string; date: string; time: string } | null>(null);
  const o = latestOffer(d.conv);
  const status = o ? offerStatus(d.w, PRO_SLUG, o) : null;
  const previous = o ? d.conv.offers.find((x) => x.version === o.version - 1) : undefined;
  const changes = o && previous ? offerChanges(previous, o) : [];
  const request = status === "en-discussion" ? [...d.conv.messages].reverse().find((x) => x.from === "couple")?.text : undefined;
  const booking = bookingFor(d.w, PRO_SLUG);
  const pays = dealPayments(d);
  const appts = dealAppointments(d);
  const manual = !!d.w.manualVendors?.includes(PRO_SLUG);
  const canRevise = !o || isOpen(status!) || status === "refusee" || status === "expiree" || status === "retiree";
  const initial = o ? { name: o.name, lines: o.lines } : startingDraft(pro);

  return (
    <aside className={m.deal} aria-labelledby="vdeal-t">
      <div className={m.dealHead}>
        <div>
          <p className={styles.eyebrow}>Dossier</p>
          <h2 id="vdeal-t" className={styles.sectionTitle}>
            {dealName(d)}
          </h2>
        </div>
        <button type="button" className={`${styles.iconBtn} ${m.dealClose}`} onClick={onClose} aria-label="Fermer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {d.live && (
        <label className={p.manual}>
          <input type="checkbox" checked={manual} onChange={(e) => apply(d.id, (w) => setManualVendor(w, PRO_SLUG, e.target.checked))} />
          <span>
            <strong>Répondre moi-même</strong>
            <small>Coupe les réponses automatiques de démonstration : c&apos;est vous qui répondez au couple de l&apos;espace couple.</small>
          </span>
        </label>
      )}

      {request && (
        <div className={p.request}>
          <p className={p.kind}>Demande d&apos;adaptation</p>
          <p>{request}</p>
        </div>
      )}

      {o ? (
        <section className={m.offer} aria-label={`Offre version ${o.version}`}>
          <div className={m.offerTop}>
            <span className={m.cardEyebrow}>Version {o.version}</span>
            <StatusChip status={OFFER_LABEL_PRO[status!]} />
          </div>
          <h3 className={m.offerName}>{o.name}</h3>
          <p className={styles.rowMeta}>
            Envoyée le {formatDay(o.sentAt)}
            {isOpen(status!) && ` · valable jusqu'au ${formatDay(o.validUntil)}`}
          </p>
          <ul className={m.lines}>
            {o.lines.map((l) => (
              <li key={l.key}>
                <span>
                  {l.label}
                  {l.removable && <small className={p.optTag}> option</small>}
                </span>
                <span>{l.amount ? euros(l.amount) : "Inclus"}</span>
              </li>
            ))}
          </ul>
          <p className={m.total}>
            <span>Total</span>
            <strong>{euros(offerTotal(o))}</strong>
          </p>
          {changes.length > 0 && <p className={styles.rowMeta}>{changes.length} changement{changes.length > 1 ? "s" : ""} depuis la version {previous!.version}.</p>}
          <div className={m.offerActions}>
            {canRevise && (
              <button type="button" className="btn btn-block" onClick={() => setBuilding(true)}>
                {status === "en-discussion" ? "Réviser l'offre" : isOpen(status!) ? "Envoyer une nouvelle version" : "Envoyer une offre à jour"}
              </button>
            )}
            {isOpen(status!) && (
              <button type="button" className={m.textBtn} onClick={() => apply(d.id, (w) => withdrawOffer(w, PRO_SLUG, o.id))}>
                Retirer l&apos;offre
              </button>
            )}
          </div>
        </section>
      ) : (
        <div className={styles.empty}>
          <p>Pas encore d&apos;offre. Partez d&apos;une formule de votre catalogue et ajustez-la au projet du couple.</p>
          <button type="button" className="btn btn-sm" onClick={() => setBuilding(true)}>
            Créer une offre
          </button>
        </div>
      )}

      {booking && (
        <section className={m.dealBlock} aria-labelledby="vbook-t">
          <h3 id="vbook-t" className={m.blockTitle}>
            Réservation
          </h3>
          <ul className={m.rdvList}>
            <li>
              <span>
                <strong>Contrat</strong>
                <small>{booking.signed ? `Signé par ${booking.contract?.signedBy ?? "le couple"}` : "En attente de signature du couple"}</small>
              </span>
              <StatusChip status={booking.signed ? "Signé" : "À signer"} />
            </li>
            {pays.map((x) => (
              <li key={x.id}>
                <span>
                  <strong>
                    {x.label} · {euros(x.amount)}
                  </strong>
                  <small>{x.paid ? "Réglé par le couple" : `Le ${formatDay(x.due)}`}</small>
                </span>
                <StatusChip status={x.paid ? "Encaissé" : "À venir"} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={m.dealBlock} aria-labelledby="vrdv-t">
        <h3 id="vrdv-t" className={m.blockTitle}>
          Rendez-vous
        </h3>
        {appts.length ? (
          <ul className={m.rdvList}>
            {appts.map((a) => (
              <li key={a.id} className={p.rdvItem}>
                <span>
                  <strong>{a.kind}</strong>
                  <small>
                    {formatWeekday(a.date)} à {formatTime(a.date)}
                  </small>
                </span>
                <StatusChip status={a.status} />
                {a.status === "Demandée" &&
                  (alt?.id === a.id ? (
                    <SlotProposer
                      defaultDate={a.date.slice(0, 10)}
                      onPropose={(alts) => {
                        apply(d.id, (w) => vendorAnswerSlot(w, a.id, alts));
                        setAlt(null);
                      }}
                      onCancel={() => setAlt(null)}
                    />
                  ) : (
                    <div className={p.rdvActions}>
                      <button type="button" className="btn btn-sm" onClick={() => apply(d.id, (w) => vendorAnswerSlot(w, a.id))}>
                        Accepter
                      </button>
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => setAlt({ id: a.id, date: a.date.slice(0, 10), time: "18:00" })}>
                        Autre créneau
                      </button>
                    </div>
                  ))}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.rowMeta}>Aucun rendez-vous.</p>
        )}
      </section>

      {d.conv.offers.length > 1 && (
        <section className={m.dealBlock} aria-labelledby="vhist-t">
          <h3 id="vhist-t" className={m.blockTitle}>
            Historique des versions
          </h3>
          <ul className={m.rdvList}>
            {[...d.conv.offers]
              .sort((a, b) => b.version - a.version)
              .map((x) => (
                <li key={x.id}>
                  <span>
                    <strong>
                      Version {x.version} · {x.name}
                    </strong>
                    <small>{formatDay(x.sentAt)}</small>
                  </span>
                  <span>{euros(offerTotal(x))}</span>
                </li>
              ))}
          </ul>
        </section>
      )}

      <Modal open={building} onClose={() => setBuilding(false)} labelledBy="build-t" className={p.wide}>
        {building && (
          <div className={p.dialog}>
            <h2 id="build-t" className={styles.sectionTitle}>
              {o ? `Version ${o.version + 1} pour ${dealName(d)}` : `Votre offre pour ${dealName(d)}`}
            </h2>
            <OfferBuilder
              pro={pro}
              initial={initial}
              previous={o}
              renewal={!!o && !isOpen(status!)}
              request={request}
              submitLabel={o ? `Envoyer la version ${o.version + 1}` : "Envoyer l'offre"}
              onCancel={() => setBuilding(false)}
              onSend={(draft, note, hold) => {
                apply(d.id, (w) => vendorOffer(w, PRO_SLUG, draft, note, hold));
                setBuilding(false);
              }}
            />
          </div>
        )}
      </Modal>
      {d.id === LIVE_ID && <p className={p.liveNote}>Ce dossier est celui de votre démo couple : vos réponses y apparaissent en direct.</p>}
    </aside>
  );
}
