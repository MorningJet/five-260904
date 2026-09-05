export type AxisIconName =
  | "heart"
  | "sparkles"
  | "shield"
  | "mountain"
  | "chat"
  | "helping"
  | "badge"
  | "users"
  | "flame"
  | "zap"
  | "handshake"
  | "hourglass"
  | "infinity"
  | "compass"
  | "smile"
  | "merge"
  | "coins";

export const AXIS_ICON: Record<string, { name: AxisIconName; color: string }> = {
  親密: { name: "heart", color: "#C45C6A" },
  吸引: { name: "sparkles", color: "#E07A8A" },
  責任: { name: "shield", color: "#7A6AA8" },
  穩定: { name: "mountain", color: "#8B7355" },
  溝通: { name: "chat", color: "#C47A5A" },
  助力: { name: "helping", color: "#3D8A8A" },
  信任: { name: "badge", color: "#4A8F7A" },
  互助: { name: "users", color: "#5B90B0" },
  熱情: { name: "flame", color: "#D06A3A" },
  決斷: { name: "zap", color: "#C49A3A" },
  包容: { name: "handshake", color: "#B06A8A" },
  長久: { name: "hourglass", color: "#9A3B2F" },
  持久: { name: "infinity", color: "#A06448" },
  志趣: { name: "compass", color: "#6A8F5A" },
  輕鬆: { name: "smile", color: "#D4A04A" },
  互補: { name: "merge", color: "#62A572" },
  利益: { name: "coins", color: "#B08948" },
};

export const AXIS_ICON_FALLBACK: { name: AxisIconName; color: string } = {
  name: "sparkles",
  color: "#9A3B2F",
};
