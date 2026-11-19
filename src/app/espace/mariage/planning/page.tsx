import type { Metadata } from "next";
import { Planning } from "./Planning";

export const metadata: Metadata = { title: "Planning" };

export default function PlanningPage() {
  return <Planning />;
}
