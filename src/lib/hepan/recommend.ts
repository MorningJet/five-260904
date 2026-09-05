import { KE, SHENG, keWo, type Wuxing } from "@/lib/bazi/constants";
import type { BaziResult } from "@/lib/bazi/types";
import { recommendProducts } from "@/lib/recommend";
import type { Product, RecommendItem } from "@/lib/types";
import { getPairCopy } from "./pairStories";
import { RELATIONS, elementPairAffinity, type Relation } from "./rules";

export type PairRecommend = {
  left: RecommendItem;
  right: RecommendItem;
  title: string;
  reason: string;
};

export function recommendPairs(
  products: Product[],
  a: BaziResult,
  b: BaziResult,
  relation: Relation,
  bondElement: BaziResult["dayMasterElement"] | null,
  limit = 3,
): PairRecommend[] {
  const usefulA = usefulForRelation(a, relation, bondElement);
  const usefulB = usefulForRelation(b, relation, bondElement);
  const poolA = recommendProducts(products, usefulA, products.length, true);
  const poolB = recommendProducts(products, usefulB, products.length, true);

  const candidates: { left: RecommendItem; right: RecommendItem; score: number }[] = [];
  for (const left of poolA) {
    for (const right of poolB) {
      if (left.product.id === right.product.id) continue;
      const affinity = elementPairAffinity(left.product.element, right.product.element, relation);
      const wristSpread = Math.abs(left.product.wristCm - right.product.wristCm);
      const wrist =
        relation === "friend" ? (wristSpread <= 3 ? 6 : 0) : wristSpread >= 3 ? 4 : 0;
      candidates.push({
        left,
        right,
        score:
          left.score +
          right.score +
          affinity +
          wrist +
          pairJitter(left.product.id, right.product.id, relation),
      });
    }
  }

  candidates.sort((x, y) => y.score - x.score || x.left.product.price - y.left.product.price);

  const disjoint: typeof candidates = [];
  const used = new Set<string>();
  for (const item of candidates) {
    if (used.has(item.left.product.id) || used.has(item.right.product.id)) continue;
    used.add(item.left.product.id);
    used.add(item.right.product.id);
    disjoint.push(item);
  }

  const start = disjoint.length <= limit ? 0 : RELATIONS.indexOf(relation) * limit;
  const chosen: typeof candidates = [];
  const chosenIds = new Set<string>();
  const push = (item: (typeof candidates)[number]) => {
    if (chosen.length >= limit) return;
    if (chosenIds.has(item.left.product.id) || chosenIds.has(item.right.product.id)) return;
    chosenIds.add(item.left.product.id);
    chosenIds.add(item.right.product.id);
    chosen.push(item);
  };

  for (let i = 0; i < disjoint.length && chosen.length < limit; i++) {
    const item = disjoint[(start + i) % disjoint.length];
    if (item) push(item);
  }

  return chosen.map((item) => {
    const copy = getPairCopy(item.left.product, item.right.product);
    return {
      left: item.left,
      right: item.right,
      title: copy.title,
      reason: copy.reason,
    };
  });
}

function uniqueEls(els: (Wuxing | null | undefined)[]): Wuxing[] {
  const out: Wuxing[] = [];
  for (const el of els) {
    if (el && !out.includes(el)) out.push(el);
  }
  return out.slice(0, 3);
}

/** 不同關係取不同喜用方向，避免同一對人四種關係都推同一批土串。 */
function usefulForRelation(
  person: BaziResult,
  relation: Relation,
  bond: Wuxing | null,
): Wuxing[] {
  const me = person.dayMasterElement;
  const u0 = person.useful[0];
  const u1 = person.useful[1];
  if (relation === "friend") return uniqueEls([me, u0, u1]);
  if (relation === "lover") return uniqueEls([SHENG[me], u0, u1]);
  if (relation === "partner") return uniqueEls([SHENG[u0 ?? me], KE[me], u0]);
  return uniqueEls([bond, keWo(me), u0, u1]);
}

function pairJitter(idA: string, idB: string, relation: Relation): number {
  const s = `${idA}|${idB}|${relation}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 11;
}
