import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVendor } from "@/lib/content";
import { Booking } from "./Booking";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const v = getVendor((await params).slug);
  return { title: v ? `Réserver ${v.name}` : "Réservation" };
}

// Parcours de réservation (CDC §13.1) : récapitulatif figé, contrat, signature, paiement, confirmation.
export default async function ReservationPage({ params }: Params) {
  const { slug } = await params;
  if (!getVendor(slug)) notFound();
  return <Booking slug={slug} />;
}
