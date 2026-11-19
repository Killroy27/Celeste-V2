"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getVendor } from "@/lib/content";
import {
  answerSlot,
  conversationOf,
  detectContact,
  isTyping,
  lastMessage,
  latestOffer,
  markRead,
  OFFER_LABEL,
  offerOf,
  offerStatus,
  offerTotal,
  proposeAppointment,
  sendMessage,
  unreadCount,
  vendorFirstName,
  type Conversation,
  type Message,
  type MessageCard,
} from "@/lib/deal";
import { useFavorites } from "@/lib/favorites";
import { euros, formatTime, formatWeekday, relativeDay, shortWhen } from "@/lib/format";
import { categorySingular, useWedding, type AppointmentKind, type Wedding } from "@/lib/wedding";
import { SlotPicker } from "@/components/SlotPicker";
import { Modal, StatusChip } from "../ui";
import styles from "../espace.module.css";
import { DealPanel } from "./DealPanel";
import m from "./messages.module.css";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const emptyConv = (slug: string): Conversation => ({ vendorSlug: slug, messages: [], offers: [], readAt: "", pending: [] });

// Résumé d'un message pour la liste des conversations.
function preview(msg: Message | undefined, w: Wedding, c: Conversation) {
  if (!msg) return "Nouvelle conversation";
  const who = msg.from === "couple" ? "Vous : " : "";
  if (msg.text) return who + msg.text;
  if (msg.file) return `${who}Fichier « ${msg.file.name} »`;
  if (msg.card?.kind === "offre") {
    const o = c.offers.find((x) => x.id === (msg.card as { offerId: string }).offerId);
    return o ? `Offre, version ${o.version} · ${euros(offerTotal(o))}` : "Offre";
  }
  if (msg.card?.kind === "fiche") return `${who}Fiche ${getVendor(msg.card.slug)?.name ?? ""}`;
  if (msg.card?.kind === "rdv") return `${who}Proposition de rendez-vous`;
  return "";
}

// Messagerie et Deal Room (CDC §11) : liste des conversations, fil d'échange et offre en cours,
// au même endroit pour ne jamais passer d'un chat à un autre module pour négocier.
export function Messages() {
  const { wedding: w, update } = useWedding();
  const router = useRouter();
  const params = useSearchParams();
  const slug = params.get("c");
  const [query, setQuery] = useState("");
  const [dealOpen, setDealOpen] = useState(params.get("offre") === "1");
  const [viewing, setViewing] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [rdvOpen, setRdvOpen] = useState(false);
  // Position de lecture au moment d'ouvrir la conversation : sert au repère « Nouveaux messages ».
  const [mark, setMark] = useState<{ slug: string | null; at: string }>({ slug: null, at: "" });

  const sorted = w ? [...w.conversations].sort((a, b) => (lastMessage(b)?.at ?? "").localeCompare(lastMessage(a)?.at ?? "")) : [];
  const firstSlug = sorted[0]?.vendorSlug;
  const conv = w && slug && getVendor(slug) ? (conversationOf(w, slug) ?? emptyConv(slug)) : null;
  const unread = conv ? unreadCount(conv) : 0;

  if (conv && mark.slug !== slug) {
    setMark({ slug, at: conv.readAt });
    setDealOpen(params.get("offre") === "1");
    setViewing(null);
    setReplyTo(null);
  }

  // Grand écran sans conversation choisie : on ouvre la plus récente.
  useEffect(() => {
    if (!slug && firstSlug && window.matchMedia("(min-width: 901px)").matches) router.replace(`/espace/messages?c=${firstSlug}`);
  }, [slug, firstSlug, router]);

  // Échap referme la Deal Room ouverte en panneau.
  useEffect(() => {
    if (!dealOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("dialog[open]")) setDealOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dealOpen]);

  // Les messages affichés à l'écran sont lus.
  useEffect(() => {
    if (slug && unread) update((x) => markRead(x, slug));
  }, [slug, unread, update]);

  if (!w) return null;

  if (!w.conversations.length && !conv) {
    return (
      <>
        <header className={styles.pageHead}>
          <div>
            <h1 className={styles.pageTitle}>Messages</h1>
            <p className={styles.lead}>Échangez, recevez des offres détaillées et négociez, sans quitter Céleste.</p>
          </div>
        </header>
        <div className={styles.empty}>
          <Image src="/icons/chat-bubbles.png" alt="" width={88} height={88} />
          <p>Vos conversations avec les prestataires apparaîtront ici. Écrivez à un prestataire depuis sa fiche : sa réponse et ses offres arriveront dans cet espace.</p>
          <Link href="/decouvrir" className="btn btn-sm">
            Découvrir les prestataires
          </Link>
        </div>
      </>
    );
  }

  // Recherche (§11.1) : nom du prestataire, métier ou contenu des messages, sans tenir compte des accents.
  const q = fold(query.trim());
  const results = sorted
    .map((c) => {
      const v = getVendor(c.vendorSlug);
      if (!q) return { c, hit: undefined as Message | undefined };
      const hit = [...c.messages].reverse().find((x) => fold(x.text).includes(q));
      const nameHit = fold(`${v?.name ?? ""} ${categorySingular(v?.category ?? "")} ${vendorFirstName(c.vendorSlug)}`).includes(q);
      return hit || nameHit ? { c, hit } : null;
    })
    .filter((r): r is { c: Conversation; hit: Message | undefined } => !!r);

  return (
    <div className={m.layout} data-view={conv ? "thread" : "list"} data-deal={dealOpen ? "open" : "closed"}>
      <aside className={m.list} aria-label="Conversations">
        <h1 className={m.title}>Messages</h1>
        <label className={m.search}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.35-4.35" />
          </svg>
          <span className="visually-hidden">Rechercher</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Prestataire ou mot d'un message" />
        </label>
        {results.length ? (
          <ul className={m.items}>
            {results.map(({ c, hit }) => {
              const v = getVendor(c.vendorSlug);
              const n = unreadCount(c);
              const last = lastMessage(c);
              return (
                <li key={c.vendorSlug}>
                  <Link href={`/espace/messages?c=${c.vendorSlug}`} className={m.item} aria-current={c.vendorSlug === slug ? "true" : undefined}>
                    <span className={m.avatar}>{v && <Image src={v.photo} alt="" fill sizes="48px" style={{ objectFit: "cover", objectPosition: v.pos }} />}</span>
                    <span className={m.itemText}>
                      <span className={m.itemTop}>
                        <strong>{v?.name}</strong>
                        {last && <time dateTime={last.at}>{shortWhen(last.at)}</time>}
                      </span>
                      <span className={`${m.itemSub} ${n ? m.itemUnread : ""}`}>
                        {isTyping(c) ? <em>{vendorFirstName(c.vendorSlug)} écrit…</em> : hit ? <Highlight text={hit.text} q={query.trim()} /> : preview(last, w, c)}
                      </span>
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
        ) : (
          <p className={m.noResult}>Aucune conversation ne contient « {query.trim()} ».</p>
        )}
      </aside>

      {conv ? (
        <>
          <Thread
            w={w}
            conv={conv}
            markAt={mark.at}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            onOpenOffer={(id) => {
              setViewing(id);
              setDealOpen(true);
            }}
            onOpenDeal={() => setDealOpen(true)}
            onPropose={() => setRdvOpen(true)}
          />
          <DealPanel
            w={w}
            slug={conv.vendorSlug}
            viewing={viewing}
            onView={setViewing}
            onClose={() => setDealOpen(false)}
            onPropose={() => setRdvOpen(true)}
            autoAdapt={params.get("adapter") === "1"}
          />
          <button type="button" className={m.scrim} aria-label="Fermer l'offre" tabIndex={-1} onClick={() => setDealOpen(false)} />
          <RdvDialog open={rdvOpen} onClose={() => setRdvOpen(false)} slug={conv.vendorSlug} />
        </>
      ) : (
        <section className={m.placeholder} aria-label="Conversation">
          <Image src="/icons/chat-bubbles.png" alt="" width={72} height={72} />
          <p>Choisissez une conversation.</p>
        </section>
      )}
    </div>
  );
}

function Highlight({ text, q }: { text: string; q: string }) {
  const i = fold(text).indexOf(fold(q));
  if (i < 0) return <>{text}</>;
  const start = Math.max(0, i - 24);
  return (
    <>
      {start > 0 && "…"}
      {text.slice(start, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

/* ---------- Fil de la conversation ---------- */

type ThreadProps = {
  w: Wedding;
  conv: Conversation;
  markAt: string;
  replyTo: string | null;
  setReplyTo: (id: string | null) => void;
  onOpenOffer: (offerId: string) => void;
  onOpenDeal: () => void;
  onPropose: () => void;
};

function Thread({ w, conv, markAt, replyTo, setReplyTo, onOpenOffer, onOpenDeal, onPropose }: ThreadProps) {
  const v = getVendor(conv.vendorSlug)!;
  const first = vendorFirstName(conv.vendorSlug);
  const scroller = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const stick = useRef(true);
  const current = offerOf(w, conv.vendorSlug);
  const typing = isTyping(conv);

  // À l'ouverture : repère « Nouveaux messages » s'il y en a, sinon le message le plus récent.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const mark = el.querySelector<HTMLElement>("[data-new-mark]");
    stick.current = !mark;
    el.scrollTop = mark ? mark.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - 12 : el.scrollHeight;
  }, [conv.vendorSlug]);

  // Ensuite, le fil reste collé en bas (nouveau message, image chargée, « écrit… ») tant que le couple n'est pas remonté lire.
  useEffect(() => {
    const el = scroller.current;
    const content = list.current;
    if (!el || !content) return;
    const onScroll = () => {
      stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    };
    const ro = new ResizeObserver(() => {
      if (stick.current) el.scrollTop = el.scrollHeight;
    });
    el.addEventListener("scroll", onScroll, { passive: true });
    ro.observe(content);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [conv.vendorSlug]);

  // Un message envoyé par le couple ramène toujours en bas.
  const lastFromCouple = lastMessage(conv)?.from === "couple";
  useEffect(() => {
    const el = scroller.current;
    if (el && lastFromCouple) {
      stick.current = true;
      el.scrollTop = el.scrollHeight;
    }
  }, [conv.messages.length, lastFromCouple]);

  // Une même proposition de rendez-vous peut apparaître plusieurs fois : seules ses dernières mentions portent les boutons.
  const lastRdvMessage: Record<string, string> = {};
  for (const x of conv.messages) if (x.card?.kind === "rdv") lastRdvMessage[x.card.appointmentId] = x.id;
  const firstUnread = conv.messages.find((x) => x.from !== "couple" && markAt && x.at > markAt)?.id;

  let lastDay = "";
  return (
    <section className={m.thread} aria-label={`Conversation avec ${v.name}`}>
      <header className={m.threadHead}>
        <Link href="/espace/messages" className={m.back} aria-label="Retour aux conversations">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <span className={m.avatar}>
          <Image src={v.photo} alt="" fill sizes="44px" style={{ objectFit: "cover", objectPosition: v.pos }} />
        </span>
        <div className={m.who}>
          <h2>{v.name}</h2>
          <p>
            {first} · {cap(categorySingular(v.category))} · répond en général en {v.responseTime}
          </p>
        </div>
        <Link href={`/prestataire/${v.slug}`} className={`${styles.more} ${m.ficheLink}`}>
          Voir la fiche
        </Link>
      </header>

      {/* Petit et moyen écran : l'offre en cours reste visible en haut du fil et ouvre la Deal Room. */}
      <button type="button" className={m.offerBar} onClick={onOpenDeal}>
        {current ? (
          <>
            <span>
              <strong>{euros(current.total)}</strong> · version {current.offer.version} · {current.offer.name}
            </span>
            <StatusChip status={OFFER_LABEL[current.status]} />
          </>
        ) : (
          <span>Offre et rendez-vous</span>
        )}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div ref={scroller} className={m.scroller}>
        {!conv.messages.length && (
          <div className={m.start}>
            <p>
              Présentez votre projet à {first} : votre date, le nombre d&apos;invités et ce qui compte pour vous. Sa réponse et son offre détaillée arriveront ici.
            </p>
          </div>
        )}
        <ol ref={list} className={m.messages}>
          {conv.messages.map((msg) => {
            const day = relativeDay(msg.at);
            const showDay = day !== lastDay;
            lastDay = day;
            return (
              <MessageRow
                key={msg.id}
                w={w}
                conv={conv}
                msg={msg}
                day={showDay ? day : null}
                unreadMark={msg.id === firstUnread}
                rdvActions={msg.card?.kind === "rdv" && lastRdvMessage[msg.card.appointmentId] === msg.id}
                onReply={() => setReplyTo(msg.id)}
                onOpenOffer={onOpenOffer}
              />
            );
          })}
          {typing && (
            <li className={m.typing}>
              <span className={m.dots} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              {first} écrit…
            </li>
          )}
        </ol>
      </div>

      <Composer w={w} conv={conv} replyTo={replyTo} clearReply={() => setReplyTo(null)} onPropose={onPropose} />
    </section>
  );
}

type RowProps = {
  w: Wedding;
  conv: Conversation;
  msg: Message;
  day: string | null;
  unreadMark: boolean;
  rdvActions: boolean;
  onReply: () => void;
  onOpenOffer: (offerId: string) => void;
};

function MessageRow({ w, conv, msg, day, unreadMark, rdvActions, onReply, onOpenOffer }: RowProps) {
  const quoted = msg.replyTo ? conv.messages.find((x) => x.id === msg.replyTo) : undefined;
  const author = (x: Message) => (x.from === "couple" ? "Vous" : x.from === "vendor" ? vendorFirstName(conv.vendorSlug) : "Céleste");
  return (
    <>
      {day && (
        <li className={m.day} aria-hidden="false">
          <span>{day}</span>
        </li>
      )}
      {unreadMark && (
        <li className={m.newMark} data-new-mark="">
          <span>Nouveaux messages</span>
        </li>
      )}
      {msg.from === "celeste" ? (
        <li className={m.system}>
          <Image src="/brand/monogram.png" alt="" width={16} height={17} />
          <span>{msg.text}</span>
        </li>
      ) : (
        <li id={`msg-${msg.id}`} className={msg.from === "couple" ? m.mine : m.theirs}>
          <div className={m.bubble}>
            <span className="visually-hidden">{author(msg)} : </span>
            {quoted && (
              <button
                type="button"
                className={m.quote}
                onClick={() => document.getElementById(`msg-${quoted.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
              >
                <strong>{author(quoted)}</strong>
                <span>{quoted.text || preview(quoted, w, conv)}</span>
              </button>
            )}
            {msg.text && <p className={m.text}>{msg.text}</p>}
            {msg.file && <FileChip file={msg.file} />}
            {msg.card && <Card w={w} conv={conv} card={msg.card} rdvActions={rdvActions} onOpenOffer={onOpenOffer} />}
            <time className={m.time} dateTime={msg.at}>
              {formatTime(msg.at)}
            </time>
          </div>
          <button type="button" className={m.replyBtn} onClick={onReply} aria-label={`Répondre à ce message de ${author(msg)}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 6 6v4" />
            </svg>
          </button>
        </li>
      )}
    </>
  );
}

const sizeLabel = (n: number) => (n > 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace(".", ",")} Mo` : `${Math.max(1, Math.round(n / 1000))} Ko`);

function FileChip({ file }: { file: { name: string; size: number } }) {
  return (
    <span className={m.file}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5" />
      </svg>
      <span>
        <strong>{file.name}</strong>
        <small>{sizeLabel(file.size)}</small>
      </span>
    </span>
  );
}

/* ---------- Cartes : offre, rendez-vous, fiche (§11.1) ---------- */

function Card({ w, conv, card, rdvActions, onOpenOffer }: { w: Wedding; conv: Conversation; card: MessageCard; rdvActions: boolean; onOpenOffer: (id: string) => void }) {
  const { update } = useWedding();

  if (card.kind === "offre") {
    const o = conv.offers.find((x) => x.id === card.offerId);
    if (!o) return null;
    const isRef = o.id === latestOffer(conv)?.id || o.status === "acceptee";
    return (
      <div className={m.card}>
        <div className={m.cardHead}>
          <span className={m.cardEyebrow}>Offre · version {o.version}</span>
          <StatusChip status={isRef ? OFFER_LABEL[offerStatus(w, conv.vendorSlug, o)] : "Remplacée"} />
        </div>
        <strong className={m.cardTitle}>{o.name}</strong>
        <span className={m.cardAmount}>{euros(offerTotal(o))}</span>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => onOpenOffer(o.id)}>
          Voir le détail
        </button>
      </div>
    );
  }

  if (card.kind === "rdv") {
    const a = w.appointments.find((x) => x.id === card.appointmentId);
    if (!a) return null;
    return (
      <div className={m.card}>
        <div className={m.cardHead}>
          <span className={m.cardEyebrow}>{a.kind}</span>
          <StatusChip status={a.status} />
        </div>
        <strong className={m.cardTitle}>
          {(a.alternatives?.length ?? 0) > 1 && a.status === "Créneau alternatif proposé" ? `${a.alternatives!.length} créneaux proposés` : `${cap(formatWeekday(a.date))} à ${formatTime(a.date)}`}
        </strong>
        {rdvActions && a.status === "Créneau alternatif proposé" && (
          <div className={m.cardActions}>
            {(a.alternatives?.length ?? 0) > 1 ? (
              a.alternatives!.map((alt) => (
                <button key={alt} type="button" className="btn btn-sm" onClick={() => update((x) => answerSlot(x, a.id, true, new Date(), alt))}>
                  {cap(formatWeekday(alt))} à {formatTime(alt)}
                </button>
              ))
            ) : (
              <button type="button" className="btn btn-sm" onClick={() => update((x) => answerSlot(x, a.id, true))}>
                Accepter ce créneau
              </button>
            )}
            <button type="button" className="btn btn-sm btn-outline" onClick={() => update((x) => answerSlot(x, a.id, false))}>
              Autre créneau
            </button>
          </div>
        )}
      </div>
    );
  }

  const v = getVendor(card.slug);
  if (!v) return null;
  return (
    <Link href={`/prestataire/${v.slug}`} className={`${m.card} ${m.fiche}`}>
      <span className={m.ficheThumb}>
        <Image src={v.photo} alt="" fill sizes="64px" style={{ objectFit: "cover", objectPosition: v.pos }} />
      </span>
      <span>
        <span className={m.cardEyebrow}>{cap(categorySingular(v.category))}</span>
        <strong className={m.cardTitle}>{v.name}</strong>
        <span className={m.ficheMeta}>
          ★ {v.rating} · {v.area}
        </span>
      </span>
    </Link>
  );
}

/* ---------- Saisie ---------- */

function Composer({ w, conv, replyTo, clearReply, onPropose }: { w: Wedding; conv: Conversation; replyTo: string | null; clearReply: () => void; onPropose: () => void }) {
  const { update } = useWedding();
  const [text, setText] = useState("");
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [menu, setMenu] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const first = vendorFirstName(conv.vendorSlug);
  const quoted = replyTo ? conv.messages.find((x) => x.id === replyTo) : undefined;
  const warning = detectContact(text);

  useEffect(() => {
    if (replyTo) input.current?.focus();
  }, [replyTo]);

  // Le menu « + » se ferme au clic extérieur et avec Échap.
  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menu]);

  // Hauteur ajustée au texte, jusqu'à cinq lignes.
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [text]);

  const send = () => {
    if (!text.trim() && !file) return;
    update((x) => sendMessage(x, conv.vendorSlug, { text: text.trim(), ...(replyTo ? { replyTo } : {}), ...(file ? { file } : {}) }));
    setText("");
    setFile(null);
    clearReply();
    input.current?.focus();
  };

  return (
    <div className={m.composer}>
      {quoted && (
        <div className={m.replying}>
          <span>
            <strong>Réponse à {quoted.from === "couple" ? "vous" : first}</strong>
            <span>{quoted.text || preview(quoted, w, conv)}</span>
          </span>
          <button type="button" className={styles.iconBtn} onClick={clearReply} aria-label="Annuler la réponse">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}
      {file && (
        <div className={m.replying}>
          <FileChip file={file} />
          <button type="button" className={styles.iconBtn} onClick={() => setFile(null)} aria-label="Retirer le fichier">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}
      {warning && (
        <p className={m.warning} role="status">
          Ce message semble contenir {warning}. Pour garder la protection du contrat, du paiement et de la médiation, poursuivez l&apos;échange et la réservation dans Céleste.
          <small> Détection automatique : personne ne lit vos messages.</small>
        </p>
      )}
      <form
        className={m.inputRow}
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div className={m.plus} ref={menuRef}>
          <button type="button" className={m.roundBtn} aria-label="Ajouter un fichier, un rendez-vous ou une fiche" aria-expanded={menu} aria-haspopup="menu" onClick={() => setMenu((x) => !x)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          {menu && (
            <div className={m.menu} role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenu(false);
                  fileInput.current?.click();
                }}
              >
                Joindre un fichier
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenu(false);
                  onPropose();
                }}
              >
                Proposer un rendez-vous
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenu(false);
                  setShareOpen(true);
                }}
              >
                Partager une fiche
              </button>
            </div>
          )}
        </div>
        {/* Prototype : seuls le nom et la taille du fichier sont gardés, rien n'est envoyé. */}
        <input
          ref={fileInput}
          type="file"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile({ name: f.name, size: f.size });
            e.target.value = "";
          }}
        />
        <label className="visually-hidden" htmlFor="composer">
          Votre message à {first}
        </label>
        <textarea
          id="composer"
          ref={input}
          rows={1}
          value={text}
          placeholder={`Écrire à ${first}…`}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button type="submit" className={`${m.roundBtn} ${m.sendBtn}`} disabled={!text.trim() && !file} aria-label="Envoyer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </form>
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} slug={conv.vendorSlug} />
    </div>
  );
}

/* ---------- Proposition de rendez-vous (§11.1, §12) ---------- */

const DEFAULT_KIND: Record<string, AppointmentKind> = { lieux: "Visite", traiteurs: "Dégustation", patisserie: "Dégustation", beaute: "Essai", tenues: "Essai" };

function RdvDialog({ open, onClose, slug }: { open: boolean; onClose: () => void; slug: string }) {
  const { update } = useWedding();
  const v = getVendor(slug);
  const first = vendorFirstName(slug);
  return (
    <Modal open={open} onClose={onClose} labelledBy="rdv-t">
      <form
        className={m.dialog}
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          update((x) => proposeAppointment(x, slug, f.get("kind") as AppointmentKind, `${f.get("date")}T${f.get("time")}`, String(f.get("note") ?? "")));
          onClose();
        }}
      >
        <h2 id="rdv-t" className={styles.sectionTitle}>
          Proposer un rendez-vous à {first}
        </h2>
        <p className={styles.rowMeta}>{first} confirme le créneau ou vous en propose un autre. Le rendez-vous rejoint votre planning dès qu&apos;il est confirmé.</p>
        <label className="field">
          Type
          <select name="kind" defaultValue={DEFAULT_KIND[v?.category ?? ""] ?? "Rendez-vous"}>
            {(["Rendez-vous", "Visite", "Dégustation", "Essai"] as const).map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <SlotPicker dateName="date" timeName="time" />
        <label className="field">
          Un mot pour {first} (facultatif)
          <textarea name="note" rows={2} />
        </label>
        <div className={m.dialogActions}>
          <button type="submit" className="btn">
            Envoyer la proposition
          </button>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Annuler
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Partager une fiche (§11.1) ---------- */

function ShareDialog({ open, onClose, slug }: { open: boolean; onClose: () => void; slug: string }) {
  const { wedding: w, update } = useWedding();
  const { favorites } = useFavorites();
  const candidates = [...new Set([...favorites, ...(w?.vendors.map((x) => x.vendorSlug).filter((s): s is string => !!s) ?? [])])]
    .filter((s) => s !== slug)
    .map((s) => getVendor(s))
    .filter((v): v is NonNullable<typeof v> => !!v);
  return (
    <Modal open={open} onClose={onClose} labelledBy="share-t">
      <div className={m.dialog}>
        <h2 id="share-t" className={styles.sectionTitle}>
          Partager une fiche
        </h2>
        <p className={styles.rowMeta}>Vos coups de cœur et les prestataires de votre projet. Pratique pour demander un avis ou coordonner deux prestataires.</p>
        {candidates.length ? (
          <ul className={m.shareList}>
            {candidates.map((v) => (
              <li key={v.slug}>
                <button
                  type="button"
                  className={m.shareItem}
                  onClick={() => {
                    update((x) => sendMessage(x, slug, { text: `Nous avons repéré ${v.name}. Qu'en pensez-vous ?`, card: { kind: "fiche", slug: v.slug } }));
                    onClose();
                  }}
                >
                  <span className={m.avatar}>
                    <Image src={v.photo} alt="" fill sizes="44px" style={{ objectFit: "cover", objectPosition: v.pos }} />
                  </span>
                  <span>
                    <strong>{v.name}</strong>
                    <small>
                      {cap(categorySingular(v.category))} · {v.area}
                    </small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <p>Ajoutez des prestataires à vos coups de cœur pour les partager ici.</p>
            <Link href="/decouvrir" className={styles.more}>
              Découvrir les prestataires
            </Link>
          </div>
        )}
        <div className={m.dialogActions}>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
