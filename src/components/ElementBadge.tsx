import { WUXING_LABEL, WUXING_THEME, type Wuxing } from "@/lib/bazi/constants";
import styles from "./ElementBadge.module.css";

/** 商品詳情沿用的深一檔配色 */
const DEEP: Record<Wuxing, { fill: string; stroke: string; ink: string }> = {
  wood: { fill: "#B4D8BE", stroke: "#4E8F5C", ink: "#2E6A3C" },
  fire: { fill: "#E8B4AD", stroke: "#C44F42", ink: "#9C372C" },
  earth: { fill: "#DCC29A", stroke: "#A07838", ink: "#7A5420" },
  metal: { fill: "#EFC882", stroke: "#D08C1C", ink: "#A86C0C" },
  water: { fill: "#A4C6DC", stroke: "#3A7396", ink: "#1F5878" },
};

export default function ElementBadge({
  element,
  tone = "deep",
  size = "sm",
}: {
  element: Wuxing;
  tone?: "soft" | "deep";
  size?: "sm" | "md";
}) {
  const theme = tone === "soft" ? WUXING_THEME[element] : DEEP[element];
  return (
    <span
      className={`${styles.badge} ${size === "md" ? styles.md : ""}`}
      style={{
        color: theme.ink,
        background: theme.fill,
        borderColor: theme.stroke,
      }}
    >
      屬{WUXING_LABEL[element]}
    </span>
  );
}
