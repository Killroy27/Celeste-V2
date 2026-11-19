"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { bookingFor, confirmBooking, contractFor, maxInstallments, scheduleFor, signContract, type PayMode } from "@/lib/booking";
import { getVendor } from "@/lib/content";
import { euros, formatDate, formatDay, formatTime, isoDate } from "@/lib/format";
import { DEPOSIT_RATE } from "@/lib/settings";
import { categorySingular, useWedding } from "@/lib/wedding";
import { CardForm } from "../../CardForm";
import { StatusChip } from "../../ui";
import styles from "../../espace.module.css";
import k from "./booking.module.css";

const STEPS = ["Vérifiez votre offre", "Signez le contrat", "Choisissez quand payer"];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Parcours de réservation (CDC §13.1, étapes 9 à 15) sur une seule page, en accordéon (benchmark Airbnb) :
// une seule étape ouverte à la fois, donc une action principale (§27) ; une étape franchie se replie en une
// ligne résumée avec « Revoir ». La réservation confirmée ne se rejoue pas.
export function Booking({ slug }: { slug: string }) {
  const { wedding: w, update } = useWedding();
  const [chosen, setChosen] = useState<number | null>(null);
  const [mode, setMode] = useState<PayMode>("split");
  const [count, setCount] = useState(1);
  const [signer, setSigner] = useState("");
  const [agree, setAgree] = useState(false);
  const opened = useRef<number | null>(null);
  const v = getVendor(slug)!;
  const b0 = w ? bookingFor(w, slug) : null;
  const current = !b0 ? -1 : b0.confirmed ? 3 : Math.min(chosen ?? (b0.signed ? 2 : 0), b0.signed ? 2 : 1);

  // À chaque changement d'étape (pas au chargement), l'étape ouverte remonte sous les yeux.
  useEffect(() => {
    if (current < 0) return;
    if (opened.current !== null && opened.current !== current) document.getElementById(`etape-${current}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    opened.current = current;
  }, [current]);
  if (!w) return null;
  const b = b0;

  if (!b) {
    return (
      <>
        <header className={styles.pageHead}>
          <div>
            <p className={styles.eyebrow}>Réservation</p>
            <h1 className={styles.pageTitle}>Réserver {v.name}</h1>
          </div>
        </header>
        <div className={styles.empty}>
          <Image src="/icons/contract-pen.png" alt="" width={80} height={80} />
          <p>Pour réserver {v.name}, acceptez d&apos;abord une offre dans la conversation : le contrat est généré à partir de la version acceptée.</p>
          <Link href={`/espace/messages?c=${slug}`} className="btn btn-sm">
            Ouvrir la conversation
          </Link>
        </div>
      </>
    );
  }

  // Étape ouverte : le choix du couple, borné par ce qui est réellement fait.
  const reachable = b.signed ? 2 : 1;
  const step = current;
  const maxCount = maxInstallments(w.date, isoDate());
  const installments = Math.min(count, maxCount);
  const schedule = scheduleFor(w.date, b.total, mode, installments, isoDate());
  const deposit = Math.round(b.total * DEPOSIT_RATE);
  const summaries = [
    `${b.offer.name}, version ${b.offer.version} · ${euros(b.total)}`,
    b.signed ? `Signé par ${b.contract?.signedBy}${b.contract?.signedAt ? ` le ${formatDay(b.contract.signedAt)}` : ""}` : "Contrat généré à partir de l'offre acceptée",
    `En une fois, ou ${Math.round(DEPOSIT_RATE * 100)} % d'acompte puis le solde`,
  ];

  const body = (i: number) =>
    i === 0 ? (
      <>
        <p className={styles.rowMeta}>
          Version {b.offer.version}
          {b.offer.acceptedAt && `, acceptée le ${formatDay(b.offer.acceptedAt)}`} : c&apos;est exactement ce que vous réservez. Pour changer quoi que ce soit,{" "}
          <Link href={`/espace/messages?c=${slug}`} className={k.inlineLink}>
            demandez une modification dans la conversation
          </Link>
          .
        </p>
        <Lines lines={b.offer.lines} total={b.total} />
        <button type="button" className="btn btn-block" onClick={() => setChosen(1)}>
          {b.signed ? "Revenir au paiement" : "Continuer vers le contrat"}
        </button>
      </>
    ) : i === 1 ? (
      <ContractStep slug={slug} signer={signer} setSigner={setSigner} agree={agree} setAgree={setAgree} onSigned={() => setChosen(2)} />
    ) : (
      <>
        <div className={k.modes} role="radiogroup" aria-label="Mode de paiement">
          <label className={k.mode} data-checked={mode === "once"}>
            <input type="radio" name="mode" checked={mode === "once"} onChange={() => setMode("once")} />
            <span>
              <strong>En une fois</strong>
              <small>{euros(b.total)} aujourd&apos;hui</small>
            </span>
          </label>
          <label className={k.mode} data-checked={mode === "split"}>
            <input type="radio" name="mode" checked={mode === "split"} onChange={() => setMode("split")} />
            <span>
              <strong>Acompte de {Math.round(DEPOSIT_RATE * 100)} %, puis le solde</strong>
              <small>
                {euros(deposit)} aujourd&apos;hui, le reste {maxCount > 1 ? `en 1 à ${maxCount} fois` : "un mois avant le mariage"}
              </small>
            </span>
          </label>
        </div>
        {mode === "split" && maxCount > 1 && (
          <div className={k.counts} role="group" aria-label="Nombre d'échéances pour le solde">
            <span>Solde en</span>
            {Array.from({ length: maxCount }, (_, n) => n + 1).map((n) => (
              <button key={n} type="button" aria-pressed={installments === n} onClick={() => setCount(n)}>
                {n} fois
              </button>
            ))}
          </div>
        )}
        <ul className={k.schedule} aria-label="Échéancier">
          {schedule.map((s, n) => (
            <li key={s.label}>
              <span>
                <strong>{s.label}</strong>
                <small>{n === 0 ? "Aujourd'hui" : `Le ${formatDay(s.due)}`}</small>
              </span>
              <span>{euros(s.amount)}</span>
            </li>
          ))}
        </ul>
        <h3 className={k.subTitle}>Carte bancaire</h3>
        <CardForm
          submitLabel={`Payer ${euros(schedule[0].amount)}`}
          onPaid={(last4) => {
            update((x) => confirmBooking(x, slug, mode, installments, last4));
            setChosen(3);
          }}
        />
      </>
    );

  return (
    <div className={k.page}>
      <Link href={`/espace/messages?c=${slug}`} className={k.back}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
        Conversation avec {v.name}
      </Link>
      <h1 className={styles.pageTitle}>{b.confirmed ? "Réservation confirmée" : `Réserver ${v.name}`}</h1>

      <div className={k.grid}>
        <div className={k.main}>
          {step < 3 && (
            <ol className={k.acc} aria-label="Étapes de la réservation">
              {STEPS.map((label, i) => {
                const open = i === step;
                const done = !open && i < reachable;
                return (
                  <li key={label} id={`etape-${i}`} className={k.accItem} data-state={open ? "current" : done ? "done" : "todo"} aria-current={open ? "step" : undefined}>
                    <div className={k.accHead}>
                      <span className={k.dot} aria-hidden="true">
                        {done ? "✓" : i + 1}
                      </span>
                      <span className={k.accTitle}>
                        <h2 className={k.accLabel}>{label}</h2>
                        {!open && <small>{summaries[i]}</small>}
                      </span>
                      {done && (
                        <button type="button" className={k.accEdit} onClick={() => setChosen(i)}>
                          Revoir
                          <span className="visually-hidden"> : {label.toLowerCase()}</span>
                        </button>
                      )}
                    </div>
                    {open && <div className={k.accBody}>{body(i)}</div>}
                  </li>
                );
              })}
            </ol>
          )}

          {step === 3 && (
            <section className={`${k.panel} ${k.done}`} aria-labelledby="done-t">
              <Image src="/icons/party-popper.png" alt="" width={88} height={88} />
              <h2 id="done-t" className={styles.sectionTitle}>
                {v.name} est réservé
              </h2>
              <p className={styles.rowMeta}>
                Pour votre mariage du {formatDate(w.date)}. Le contrat signé et la facture sont rangés dans vos documents ; les prochaines échéances apparaissent dans votre budget et votre planning.
              </p>
              <ul className={k.schedule} aria-label="Échéancier">
                {b.payments.map((p) => (
                  <li key={p.id}>
                    <span>
                      <strong>{p.label}</strong>
                      <small>{p.paid ? `Réglé${p.method ? ` · ${p.method}` : ""}` : `Le ${formatDay(p.due)}`}</small>
                    </span>
                    <span className={k.scheduleEnd}>
                      {euros(p.amount)}
                      <StatusChip status={p.paid ? "Payé" : "Paiement à venir"} />
                    </span>
                  </li>
                ))}
              </ul>
              <div className={k.doneActions}>
                <Link href="/espace/mariage/prestataires" className="btn">
                  Voir mes prestataires
                </Link>
                <Link href="/espace/mariage/documents" className={styles.more}>
                  Voir les documents
                </Link>
              </div>
            </section>
          )}
        </div>

        <aside className={k.summary} aria-label="Votre réservation">
          <div className={k.vendor}>
            <span className={k.thumb}>
              <Image src={v.photo} alt="" fill sizes="64px" style={{ objectFit: "cover", objectPosition: v.pos }} />
            </span>
            <span>
              <strong>{v.name}</strong>
              <small>
                {cap(categorySingular(v.category))} · ★ {v.rating}
              </small>
            </span>
          </div>
          <dl className={k.facts}>
            <div>
              <dt>Offre</dt>
              <dd>
                {b.offer.name}, version {b.offer.version}
                {!b.confirmed && (
                  <Link href={`/espace/messages?c=${slug}`} className={k.factLink}>
                    Demander une modification
                  </Link>
                )}
              </dd>
            </div>
            <div>
              <dt>Mariage</dt>
              <dd>{formatDate(w.date)}</dd>
            </div>
            <div>
              <dt>Annulation</dt>
              <dd>Conditions précisées dans le contrat</dd>
            </div>
            <div className={k.totalRow}>
              <dt>Total</dt>
              <dd>{euros(b.total)}</dd>
            </div>
            {step === 2 && (
              <div>
                <dt>À régler aujourd&apos;hui</dt>
                <dd>
                  <strong>{euros(schedule[0].amount)}</strong>
                </dd>
              </div>
            )}
          </dl>
        </aside>
      </div>
    </div>
  );
}

function Lines({ lines, total }: { lines: { key: string; label: string; amount: number }[]; total: number }) {
  return (
    <div>
      <ul className={k.lines}>
        {lines.map((l) => (
          <li key={l.key}>
            <span>{l.label}</span>
            <span>{l.amount ? euros(l.amount) : "Inclus"}</span>
          </li>
        ))}
      </ul>
      <p className={k.total}>
        <span>Total</span>
        <strong>{euros(total)}</strong>
      </p>
    </div>
  );
}

/* ---------- Contrat et signature électronique (§13.2) ---------- */

type ContractProps = { slug: string; signer: string; setSigner: (s: string) => void; agree: boolean; setAgree: (b: boolean) => void; onSigned: () => void };

function ContractStep({ slug, signer, setSigner, agree, setAgree, onSigned }: ContractProps) {
  const { wedding: w, update } = useWedding();
  const b = w ? bookingFor(w, slug) : null;
  if (!w || !b) return null;
  const c = contractFor(w, slug, b.offer);
  const ready = agree && signer.trim().length >= 3;

  return (
    <section aria-label="Contrat" className={k.stack}>
      <p className={styles.rowMeta}>Généré automatiquement à partir de la version acceptée. Prenez le temps de le lire avant de signer.</p>

      <article className={k.contract} aria-label={c.title} tabIndex={0}>
        <p className={k.ref}>Référence {c.reference}</p>
        <h3>{c.title}</h3>
        <h4>1. Parties</h4>
        <ul className={k.parties}>
          {c.parties.map((p) => (
            <li key={p.role}>
              <strong>{p.role}</strong> : {p.name}
              {p.detail && <span>{p.detail}</span>}
            </li>
          ))}
        </ul>
        <h4>2. Objet</h4>
        <p>{c.object}</p>
        <h4>3. Prestation et prix</h4>
        <Lines lines={c.lines} total={c.total} />
        <h4>4. Paiement</h4>
        <p>{c.payment}</p>
        {c.pending.map((p, i) => (
          <div key={p.title}>
            <h4>
              {5 + i}. {p.title}
            </h4>
            <p className={k.pending}>Clause en cours de validation juridique ({p.text.toLowerCase()}). Le texte définitif sera fourni par Céleste avant la mise en service.</p>
          </div>
        ))}
      </article>

      {b.signed ? (
        <>
          <p className={k.signed}>
            Signé électroniquement par {b.contract?.signedBy}
            {b.contract?.signedAt && ` le ${formatDay(b.contract.signedAt)} à ${formatTime(b.contract.signedAt)}`}.
          </p>
          <button type="button" className="btn btn-block" onClick={onSigned}>
            Continuer vers le paiement
          </button>
        </>
      ) : (
        <form
          className={k.sign}
          onSubmit={(e) => {
            e.preventDefault();
            if (!ready) return;
            update((x) => signContract(x, slug, signer));
            onSigned();
          }}
        >
          <label className="field">
            Votre nom complet, en guise de signature
            <input value={signer} onChange={(e) => setSigner(e.target.value)} autoComplete="name" placeholder="Prénom et nom" />
          </label>
          <label className={k.agree}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>J&apos;ai lu le contrat et je l&apos;accepte.</span>
          </label>
          <button type="submit" className="btn btn-block" disabled={!ready}>
            Signer le contrat
          </button>
          {/* Prototype : signature simulée. En production : Yousign ou équivalent (§13.2), même parcours. */}
          <p className={k.note}>Signature électronique simulée pour la démonstration.</p>
        </form>
      )}
    </section>
  );
}
