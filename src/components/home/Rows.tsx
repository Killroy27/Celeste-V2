import { vendors, type Vendor } from "@/lib/content";
import { Carousel, Slide } from "../Carousel";
import { VendorCard } from "../VendorCard";
import styles from "./Rows.module.css";

// Rangées façon Airbnb : « Métier · Lieu → » mène à la page de résultats correspondante.
const rows: { title: string; href: string; list: Vendor[] }[] = [
  {
    title: "Photographes · Paris",
    href: "/recherche?quoi=photographe&ou=Paris",
    list: vendors.filter((v) => v.category === "photographes"),
  },
  {
    title: "Lieux de réception · Île-de-France",
    href: "/recherche?quoi=lieu&ou=%C3%8Ele-de-France",
    list: vendors.filter((v) => v.category === "lieux"),
  },
  {
    title: "Traiteurs et pâtissiers · Paris",
    href: "/recherche?quoi=traiteur",
    list: vendors.filter((v) => v.category === "traiteurs" || v.category === "patisserie"),
  },
  {
    title: "Fleurs et décoration · Paris",
    href: "/recherche?quoi=fleuriste",
    list: vendors.filter((v) => v.category === "fleuristes" || v.category === "decoration"),
  },
];

export function VendorRows() {
  return (
    <div className={styles.rows}>
      {rows.map((r) => (
        <Carousel key={r.title} title={r.title} href={r.href}>
          {r.list.map((v) => (
            <Slide key={v.slug}>
              <VendorCard vendor={v} landscape />
            </Slide>
          ))}
        </Carousel>
      ))}
    </div>
  );
}
