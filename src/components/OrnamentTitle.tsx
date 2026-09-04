import styles from "./OrnamentTitle.module.css";

export default function OrnamentTitle({
  children,
  size = "md",
}: {
  children: string;
  size?: "md" | "lg";
}) {
  return (
    <div className={styles.wrap}>
      <span className={`${styles.arm} ${styles.left}`} aria-hidden />
      <h2 className={`${styles.title} ${size === "lg" ? styles.lg : ""}`}>{children}</h2>
      <span className={`${styles.arm} ${styles.right}`} aria-hidden />
    </div>
  );
}
