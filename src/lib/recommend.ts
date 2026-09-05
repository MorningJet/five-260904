import { WUXING_LABEL, type Wuxing } from "./bazi/constants";
import type { Product, RecommendItem } from "./types";

const USEFUL_WEIGHT = [100, 72];

export function recommendProducts(
  products: Product[],
  useful: Wuxing[],
  limit = 4,
  keepAll = false,
): RecommendItem[] {
  const ranked = products
    .map((product) => {
      const idx = useful.indexOf(product.element);
      if (idx === -1) {
        return {
          product,
          score: 8 + (18 - Math.abs(product.wristCm - 18)),
          reasons: ["五行暫非首選，可作為中性搭配"],
        };
      }
      const base = USEFUL_WEIGHT[idx] ?? 40;
      const wristBoost = product.wristCm === 18 ? 6 : product.wristCm === 15 ? 4 : 2;
      const reasons = [
        `屬${WUXING_LABEL[product.element]}，對應喜用第${idx + 1}位`,
        `${product.beadMm}mm 珠徑 · ${product.wristCm}cm 手圍`,
      ];
      return { product, score: base + wristBoost, reasons };
    })
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price);

  if (keepAll) return ranked.slice(0, limit);
  const hits = ranked.filter((r) => useful.includes(r.product.element));
  const pool = hits.length >= 2 ? hits : ranked;
  return diversifyByUseful(pool, useful, limit);
}

/** 每個喜用至少露一款（有貨時），再按分數補滿，避免第一喜用佔滿格子。 */
function diversifyByUseful(
  ranked: RecommendItem[],
  useful: Wuxing[],
  limit: number,
): RecommendItem[] {
  const picked: RecommendItem[] = [];
  const used = new Set<string>();

  const push = (item: RecommendItem) => {
    if (picked.length >= limit || used.has(item.product.id)) return;
    used.add(item.product.id);
    picked.push(item);
  };

  for (const el of useful) {
    const hit = ranked.find((item) => item.product.element === el);
    if (hit) push(hit);
  }

  for (const item of ranked) {
    push(item);
    if (picked.length >= limit) break;
  }

  return picked;
}
