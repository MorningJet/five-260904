import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import ElementBadge from "@/components/ElementBadge";
import { formatPrice } from "@/lib/date";
import type { Product } from "@/lib/types";
import styles from "./ProductMasonry.module.css";

export default function ProductMasonry({ items }: { items: Product[] }) {
  return (
    <div className={styles.fall}>
      {items.map((p) => (
        <article key={p.id} className={styles.card}>
          <Link href={`/product/${p.id}`} className={styles.link}>
            <span className={styles.photoWrap}>
              <img
                className={styles.photo}
                src={encodeURI(p.image)}
                alt={`${p.name} 沉香手串`}
                loading="lazy"
              />
              <span className={styles.brandMark}>
                <BrandLogo size="sm" mark />
              </span>
            </span>
            <div className={styles.body}>
              <div className={styles.titleRow}>
                <p className={styles.name}>{p.name}</p>
                <p className={styles.price}>{formatPrice(p.price)}</p>
              </div>
              <div className={styles.meta}>
                <ElementBadge element={p.element} tone="soft" />
                <span>
                  {p.beadMm}mm · {p.wristCm}cm
                </span>
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
