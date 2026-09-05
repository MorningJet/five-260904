import { WUXING_LABEL, WUXING_THEME, type Wuxing } from "@/lib/bazi/constants";
import styles from "./ElementMark.module.css";

export default function ElementMark({
  element,
  size = "sm",
}: {
  element: Wuxing;
  size?: "xs" | "sm" | "md";
}) {
  const theme = WUXING_THEME[element];
  const sizeClass = size === "md" ? styles.md : size === "xs" ? styles.xs : "";
  return (
    <span
      className={`${styles.mark} ${sizeClass}`}
      style={{ background: theme.fill, borderColor: theme.stroke, color: theme.ink }}
    >
      {WUXING_LABEL[element]}
    </span>
  );
}
