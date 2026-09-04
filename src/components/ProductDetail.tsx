"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/date";
import { describeProduct } from "@/lib/productCopy";
import type { Product } from "@/lib/types";
import ElementBadge from "./ElementBadge";
import OrnamentTitle from "./OrnamentTitle";
import { PhoneOverlay } from "./PhoneOverlay";
import styles from "./ProductDetail.module.css";

export default function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const [toastAt, setToastAt] = useState(0);
  const copy = describeProduct(product);

  useEffect(() => {
    if (!toastAt) return;
    const timer = window.setTimeout(() => setToastAt(0), 1800);
    return () => window.clearTimeout(timer);
  }, [toastAt]);

  return (
    <main className={styles.page}>
      <header className={styles.top}>
        <p className={styles.brand}>五行沉香</p>
      </header>

      <img
        className={styles.hero}
        src={encodeURI(product.image)}
        alt={`${product.name} 沉香手串`}
      />

      <section className={styles.card}>
        <OrnamentTitle size="lg">{product.name}</OrnamentTitle>
        <div className={styles.row}>
          <ElementBadge element={product.element} size="md" />
          <p className={styles.price}>{formatPrice(product.price)}</p>
        </div>
        <p className={styles.lead}>{copy.story}</p>
      </section>

      <section className={styles.card}>
        <h3 className={styles.heading}>{copy.meaning.title}</h3>
        <p className={styles.body}>{copy.meaning.body}</p>
        <h3 className={styles.heading}>配戴建議</h3>
        <p className={styles.body}>{copy.wear}</p>
      </section>

      <section className={styles.card}>
        <h3 className={styles.heading}>商品規格</h3>
        <dl className={styles.specList}>
          {copy.specs.map(([key, value]) => (
            <div key={key} className={styles.specRow}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <h3 className={styles.heading}>保養</h3>
        <p className={styles.body}>{copy.care}</p>
      </section>

      <div className={styles.buyWrap}>
        <button type="button" className={styles.back} onClick={() => router.push("/")}>
          返回
        </button>
        <button type="button" className={styles.buy} onClick={() => setToastAt(Date.now())}>
          立即購買
        </button>
      </div>

      {toastAt > 0 && (
        <PhoneOverlay>
          <div className={styles.toastLayer} role="status" style={{ pointerEvents: "none" }}>
            <p className={styles.toast}>此為展示用 Demo，無法實際購買</p>
          </div>
        </PhoneOverlay>
      )}
    </main>
  );
}
