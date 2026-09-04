import Link from "next/link";
import ElementBadge from "@/components/ElementBadge";
import OrnamentTitle from "@/components/OrnamentTitle";
import type { RecommendItem } from "@/lib/types";
import styles from "./ProductGrid.module.css";

export default function ProductGrid({
  items,
  usefulLabel,
}: {
  items: RecommendItem[];
  usefulLabel: string;
}) {
  return (
    <section className={styles.section}>
      <OrnamentTitle size="lg">{`喜用${usefulLabel}`}</OrnamentTitle>
      <div className={styles.grid}>
        {items.map((item) => {
          const p = item.product;
          return (
            <article key={p.id} className={styles.tile}>
              <Link href={`/product/${p.id}`} className={styles.photoLink}>
                <img
                  className={styles.photo}
                  src={encodeURI(p.image)}
                  alt={`${p.name} 沉香手串`}
                />
              </Link>
              <div className={styles.caption}>
                <p className={styles.name}>{p.name}</p>
                <ElementBadge element={p.element} tone="soft" />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
