import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { SimpleForm } from "@/components/SimpleForm";

export const metadata: Metadata = { title: "Contact", description: "Une question sur Céleste ? Écrivez-nous, nous répondons sous 24 h ouvrées." };

export default function ContactPage() {
  return (
    <>
      <PageIntro crumbs={[["Contact"]]} title="Une question ? Écrivez-nous" lead="Notre équipe répond sous 24 h ouvrées, du lundi au samedi." />
      <div className="container" style={{ paddingBottom: 96, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, alignItems: "start" }}>
        <div className="card-surface" style={{ padding: 28 }}>
          <SimpleForm submit="Envoyer mon message" doneTitle="Message envoyé" doneText="Merci ! Nous vous répondons par e-mail sous 24 h ouvrées.">
            <label className="field">
              Vous êtes
              <select name="profil" defaultValue="couple">
                <option value="couple">Futurs mariés</option>
                <option value="pro">Prestataire</option>
                <option value="autre">Autre</option>
              </select>
            </label>
            <label className="field">
              Prénom et nom
              <input name="nom" autoComplete="name" required />
            </label>
            <label className="field">
              E-mail
              <input type="email" name="email" autoComplete="email" required />
            </label>
            <label className="field">
              Message
              <textarea name="message" required />
            </label>
          </SimpleForm>
        </div>
        <div style={{ display: "grid", gap: 20 }}>
          {[
            ["/icons/chat-bubbles.png", "Avant de nous écrire", "La plupart des réponses sont dans notre FAQ.", "/comment-ca-marche#faq", "Lire la FAQ"],
            ["/icons/podium.png", "Vous êtes prestataire ?", "Découvrez nos offres et créez votre fiche gratuitement.", "/devenir-prestataire", "Espace prestataires"],
          ].map(([icon, title, text, href, cta]) => (
            <div key={title} className="card-surface" style={{ padding: 24, display: "flex", gap: 16, alignItems: "flex-start" }}>
              <Image src={icon} alt="" width={56} height={56} />
              <div style={{ display: "grid", gap: 6 }}>
                <h2 className="h3">{title}</h2>
                <p className="muted" style={{ margin: 0 }}>
                  {text}
                </p>
                <Link href={href} className="link-underline" style={{ justifySelf: "start", marginTop: 4 }}>
                  {cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
