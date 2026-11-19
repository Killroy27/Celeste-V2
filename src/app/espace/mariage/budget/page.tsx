import type { Metadata } from "next";
import { Budget } from "./Budget";

export const metadata: Metadata = { title: "Budget" };

export default function BudgetPage() {
  return <Budget />;
}
