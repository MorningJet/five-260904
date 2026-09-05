import OrnamentTitle from "@/components/OrnamentTitle";
import { getChartReading } from "@/lib/chartReading";
import type { Wuxing } from "@/lib/bazi/constants";
import styles from "./ChartReading.module.css";

const BLOCKS = [
  { key: "marriage", label: "姻緣" },
  { key: "career", label: "事業" },
  { key: "health", label: "健康" },
] as const;

export default function ChartReading({ useful }: { useful: Wuxing[] }) {
  const copy = getChartReading(useful);
  return (
    <section className={styles.section} aria-label="盤面解讀">
      <OrnamentTitle size="lg">盤面解讀</OrnamentTitle>
      <div className={styles.list}>
        {BLOCKS.map((block) => (
          <article key={block.key} className={styles.block}>
            <h3 className={styles.label}>【{block.label}】</h3>
            <p className={styles.body}>{copy[block.key]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
