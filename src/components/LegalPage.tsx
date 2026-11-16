import { PageIntro } from "./PageIntro";

// Gabarit des pages légales. Le texte définitif doit être fourni et validé par un juriste avant la mise en ligne.
export function LegalPage({ title, sections }: { title: string; sections: [string, string][] }) {
  return (
    <>
      <PageIntro crumbs={[[title]]} title={title} />
      <div className="container" style={{ paddingBottom: 96 }}>
        <div style={{ maxWidth: 760 }}>
          <p className="badge" style={{ margin: "0 0 32px" }}>
            Version provisoire, en cours de validation juridique
          </p>
          {sections.map(([h, t]) => (
            <section key={h} style={{ marginBottom: 32 }}>
              <h2 className="h3">{h}</h2>
              <p className="muted" style={{ margin: "10px 0 0", lineHeight: "26px" }}>
                {t}
              </p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
