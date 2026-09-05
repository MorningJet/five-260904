import { KE, SHENG, WUXING_LABEL, keWo, type Wuxing } from "@/lib/bazi/constants";

export const RELATIONS = ["couple", "lover", "friend", "partner"] as const;
export type Relation = (typeof RELATIONS)[number];

export const RELATION_LABEL: Record<Relation, string> = {
  couple: "夫妻",
  lover: "戀人",
  friend: "朋友",
  partner: "合作",
};

export type DayMasterLink = "same" | "a-sheng-b" | "b-sheng-a" | "a-ke-b" | "b-ke-a";

/** 天干五合：甲己土、乙庚金、丙辛水、丁壬木、戊癸火 */
const STEM_HE: [string, string, Wuxing][] = [
  ["甲", "己", "earth"],
  ["乙", "庚", "metal"],
  ["丙", "辛", "water"],
  ["丁", "壬", "wood"],
  ["戊", "癸", "fire"],
];

/** 地支六合（合盤看日支）：子丑土、寅亥木、卯戌火、辰酉金、巳申水、午未土 */
const BRANCH_HE: [string, string, Wuxing][] = [
  ["子", "丑", "earth"],
  ["寅", "亥", "wood"],
  ["卯", "戌", "fire"],
  ["辰", "酉", "metal"],
  ["巳", "申", "water"],
  ["午", "未", "earth"],
];

/** 地支六沖 */
const BRANCH_CHONG: [string, string][] = [
  ["子", "午"],
  ["丑", "未"],
  ["寅", "申"],
  ["卯", "酉"],
  ["辰", "戌"],
  ["巳", "亥"],
];

function pairMatch<T extends [string, string, ...unknown[]]>(
  table: T[],
  a: string,
  b: string,
): T | undefined {
  return table.find((row) => (row[0] === a && row[1] === b) || (row[0] === b && row[1] === a));
}

export function stemCombination(ganA: string, ganB: string): Wuxing | null {
  return pairMatch(STEM_HE, ganA, ganB)?.[2] ?? null;
}

export function branchCombination(zhiA: string, zhiB: string): Wuxing | null {
  return pairMatch(BRANCH_HE, zhiA, zhiB)?.[2] ?? null;
}

export function branchClash(zhiA: string, zhiB: string): boolean {
  return Boolean(pairMatch(BRANCH_CHONG, zhiA, zhiB));
}

/** 地支三合：寅午戌火、申子辰水、巳酉丑金、亥卯未木 */
const SANHE: Record<string, Wuxing> = {
  寅: "fire",
  午: "fire",
  戌: "fire",
  申: "water",
  子: "water",
  辰: "water",
  巳: "metal",
  酉: "metal",
  丑: "metal",
  亥: "wood",
  卯: "wood",
  未: "wood",
};

export function branchSanhe(zhiA: string, zhiB: string): Wuxing | null {
  const ea = SANHE[zhiA];
  const eb = SANHE[zhiB];
  if (!ea || !eb || ea !== eb || zhiA === zhiB) return null;
  return ea;
}

export function dayMasterLink(elA: Wuxing, elB: Wuxing): DayMasterLink {
  if (elA === elB) return "same";
  if (SHENG[elA] === elB) return "a-sheng-b";
  if (SHENG[elB] === elA) return "b-sheng-a";
  if (KE[elA] === elB) return "a-ke-b";
  return "b-ke-a";
}

export function dayMasterLinkLabel(link: DayMasterLink): string {
  if (link === "same") return "日主比和";
  if (link === "a-sheng-b") return "甲方生日方";
  if (link === "b-sheng-a") return "乙方生日方";
  if (link === "a-ke-b") return "甲方克乙方";
  return "乙方克甲方";
}

/** 對方日主是否落在我的配偶星（官殺或財）——市面合婚常用口訣 */
export function isSpouseStar(me: Wuxing, other: Wuxing): boolean {
  return other === keWo(me) || other === KE[me];
}

/**
 * 依關係寫死權重（百分制，基準 50）。
 * 夫妻／戀人看合、陰陽、配偶星；朋友看比和；合作看相生與互補。
 */
export const RELATION_WEIGHTS: Record<
  Relation,
  {
    stemHe: number;
    branchHe: number;
    branchChong: number;
    same: number;
    sheng: number;
    ke: number;
    usefulHit: number;
    spouseStar: number;
    polarityDiff: number;
    polaritySame: number;
  }
> = {
  couple: {
    stemHe: 22,
    branchHe: 16,
    branchChong: -20,
    same: 4,
    sheng: 12,
    ke: 2,
    usefulHit: 10,
    spouseStar: 12,
    polarityDiff: 10,
    polaritySame: -4,
  },
  lover: {
    stemHe: 20,
    branchHe: 14,
    branchChong: -16,
    same: 6,
    sheng: 16,
    ke: 0,
    usefulHit: 8,
    spouseStar: 8,
    polarityDiff: 8,
    polaritySame: -2,
  },
  friend: {
    stemHe: 12,
    branchHe: 10,
    branchChong: -12,
    same: 18,
    sheng: 10,
    ke: -8,
    usefulHit: 6,
    spouseStar: 0,
    polarityDiff: 0,
    polaritySame: 8,
  },
  partner: {
    stemHe: 14,
    branchHe: 12,
    branchChong: -18,
    same: 8,
    sheng: 18,
    ke: -10,
    usefulHit: 14,
    spouseStar: 2,
    polarityDiff: 2,
    polaritySame: 4,
  },
};

export function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function verdictFor(score: number, relation: Relation): string {
  if (score >= 80) {
    if (relation === "couple") return "琴瑟和鳴";
    if (relation === "lover") return "兩情相悅";
    if (relation === "friend") return "金蘭相契";
    return "相得益彰";
  }
  if (score >= 65) {
    if (relation === "couple") return "相敬如賓";
    if (relation === "lover") return "相處和順";
    if (relation === "friend") return "氣味相投";
    return "協作順暢";
  }
  if (score >= 50) return "中平可處";
  if (score >= 35) return "需多包容";
  return "沖克較顯";
}

export function linkCenterGlyph(link: DayMasterLink, stemHe: Wuxing | null): string {
  if (stemHe) return "合";
  if (link === "same") return "比";
  if (link === "a-sheng-b" || link === "b-sheng-a") return "生";
  return "克";
}

export function elementPairAffinity(ea: Wuxing, eb: Wuxing, relation: Relation): number {
  if (ea === eb) {
    if (relation === "friend") return 32;
    if (relation === "couple") return 6;
    if (relation === "lover") return 10;
    return 4;
  }
  if (SHENG[ea] === eb || SHENG[eb] === ea) {
    if (relation === "lover") return 28;
    if (relation === "partner") return 26;
    if (relation === "couple") return 16;
    return 8;
  }
  if (KE[ea] === eb || KE[eb] === ea) {
    return relation === "couple" ? 12 : -8;
  }
  return 0;
}

export function comboLabel(kind: "stem" | "branch", el: Wuxing): string {
  const name = kind === "stem" ? "天干五合" : "日支六合";
  return `${name}化${WUXING_LABEL[el]}`;
}
