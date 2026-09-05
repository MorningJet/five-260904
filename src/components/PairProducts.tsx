import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import ElementMark from "@/components/ElementMark";
import OrnamentTitle from "@/components/OrnamentTitle";
import type { Wuxing } from "@/lib/bazi/constants";
import type { PairRecommend } from "@/lib/hepan/recommend";
import styles from "./PairProducts.module.css";

export default function PairProducts({
  items,
  usefulLabel,
  leftElement,
  rightElement,
}: {
  items: PairRecommend[];
  usefulLabel: string;
  leftElement: Wuxing;
  rightElement: Wuxing;
}) {
  return (
    <section className={styles.section}>
      <OrnamentTitle size="lg">{`成對喜用${usefulLabel}`}</OrnamentTitle>
      <div className={styles.list}>
        {items.map((item) => {
          const left = item.left.product;
          const right = item.right.product;
          return (
            <article key={`${left.id}-${right.id}`} className={styles.row}>
              <p className={styles.pairName}>{item.title}</p>
              <div className={styles.pair}>
                <ProductTile product={left} wearer={leftElement} />
                <span className={styles.amp} aria-hidden>
                  合
                </span>
                <ProductTile product={right} wearer={rightElement} />
              </div>
              <p className={styles.reason}>{item.reason}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProductTile({
  product,
  wearer,
}: {
  product: PairRecommend["left"]["product"];
  wearer: Wuxing;
}) {
  return (
    <Link href={`/product/${product.id}`} className={styles.tile}>
      <span className={styles.photoWrap}>
        <img className={styles.photo} src={encodeURI(product.image)} alt={`${product.name} 沉香手串`} />
        <span className={styles.brandMark}>
          <BrandLogo size="sm" mark />
        </span>
        <span className={styles.wear}>
          <ElementMark element={wearer} size="xs" />
          <span>佩戴</span>
        </span>
        <span className={styles.name}>{product.name}</span>
      </span>
    </Link>
  );
}
