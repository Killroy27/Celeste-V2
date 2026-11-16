"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

// Formulaire avec état « envoyé ». L'envoi réel sera branché sur l'API (celeste-backend).
export function SimpleForm({ children, submit, doneTitle, doneText }: { children: ReactNode; submit: string; doneTitle: string; doneText: string }) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div role="status" style={{ display: "grid", justifyItems: "center", gap: 10, padding: "24px 0", textAlign: "center" }}>
        <Image src="/icons/envelope-seal.png" alt="" width={88} height={88} />
        <h2 className="h3">{doneTitle}</h2>
        <p className="muted" style={{ margin: 0, maxWidth: 420 }}>
          {doneText}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      style={{ display: "grid", gap: 16 }}
    >
      {children}
      <button type="submit" className="btn btn-block" style={{ marginTop: 4 }}>
        {submit}
      </button>
    </form>
  );
}
