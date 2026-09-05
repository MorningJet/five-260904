import styles from "./BrandLogo.module.css";

export const BRAND_LOGO = "/brand/logo.png";
export const BRAND_NAME = "五行沉香";

export default function BrandLogo({
  size = "md",
  mark = false,
  light = false,
}: {
  size?: "sm" | "md" | "lg";
  mark?: boolean;
  light?: boolean;
}) {
  const height = size === "lg" ? 48 : size === "sm" ? 22 : 32;
  return (
    <img
      src={BRAND_LOGO}
      alt={mark ? `${BRAND_NAME}出品` : BRAND_NAME}
      height={height}
      className={`${mark ? styles.mark : styles.logo}${light ? ` ${styles.light}` : ""}`}
      style={{ height }}
    />
  );
}
