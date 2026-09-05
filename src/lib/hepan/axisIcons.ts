import type { AxisGlyphKind } from "@/components/FlatIcons";

export const AXIS_ICON: Record<string, { kind: AxisGlyphKind; color: string }> = {
  親密: { kind: "heart", color: "#C45C6A" },
  吸引: { kind: "heart", color: "#C45C6A" },
  責任: { kind: "shield", color: "#7A6AA8" },
  穩定: { kind: "shield", color: "#7A6AA8" },
  溝通: { kind: "chat", color: "#C47A5A" },
  助力: { kind: "hands", color: "#3D8A8A" },
  信任: { kind: "hands", color: "#3D8A8A" },
  互助: { kind: "hands", color: "#3D8A8A" },
  熱情: { kind: "flame", color: "#D06A3A" },
  決斷: { kind: "flame", color: "#D06A3A" },
  包容: { kind: "hug", color: "#B06A8A" },
  長久: { kind: "clock", color: "#9A3B2F" },
  持久: { kind: "clock", color: "#9A3B2F" },
  志趣: { kind: "star", color: "#C49A3A" },
  輕鬆: { kind: "star", color: "#C49A3A" },
  互補: { kind: "puzzle", color: "#6A8F5A" },
  利益: { kind: "coin", color: "#B08948" },
};

export const AXIS_ICON_FALLBACK: { kind: AxisGlyphKind; color: string } = {
  kind: "star",
  color: "#9A3B2F",
};
