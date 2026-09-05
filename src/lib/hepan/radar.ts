import type { BaziResult } from "@/lib/bazi/types";
import {
  branchClash,
  branchCombination,
  branchSanhe,
  clampScore,
  dayMasterLink,
  isSpouseStar,
  stemCombination,
  type Relation,
} from "./rules";

export type RadarAxis = {
  key: string;
  label: string;
  score: number;
};

/**
 * 市面合盤雷達常見五軸（合婚看日支夫妻宮；事業看月支事業宮），
 * 四種關係換標籤、同一套干支合沖／喜用／配偶星寫死計分。
 */
const AXIS_LABELS: Record<Relation, [string, string, string, string, string]> = {
  couple: ["親密", "責任", "穩定", "溝通", "助力"],
  lover: ["吸引", "熱情", "溝通", "包容", "長久"],
  friend: ["志趣", "信任", "互助", "輕鬆", "長久"],
  partner: ["互補", "信任", "利益", "決斷", "持久"],
};

type Signals = {
  stemHe: boolean;
  dayHe: boolean;
  dayChong: boolean;
  daySanhe: boolean;
  monthHe: boolean;
  monthChong: boolean;
  same: boolean;
  sheng: boolean;
  ke: boolean;
  usefulHits: number;
  spouse: boolean;
  polarDiff: boolean;
};

function readSignals(a: BaziResult, b: BaziResult): Signals {
  const link = dayMasterLink(a.dayMasterElement, b.dayMasterElement);
  return {
    stemHe: Boolean(stemCombination(a.dayMaster, b.dayMaster)),
    dayHe: Boolean(branchCombination(a.pillars.day.zhi, b.pillars.day.zhi)),
    dayChong: branchClash(a.pillars.day.zhi, b.pillars.day.zhi),
    daySanhe: Boolean(branchSanhe(a.pillars.day.zhi, b.pillars.day.zhi)),
    monthHe: Boolean(branchCombination(a.pillars.month.zhi, b.pillars.month.zhi)),
    monthChong: branchClash(a.pillars.month.zhi, b.pillars.month.zhi),
    same: link === "same",
    sheng: link === "a-sheng-b" || link === "b-sheng-a",
    ke: link === "a-ke-b" || link === "b-ke-a",
    usefulHits:
      (a.useful.includes(b.dayMasterElement) ? 1 : 0) +
      (b.useful.includes(a.dayMasterElement) ? 1 : 0),
    spouse:
      isSpouseStar(a.dayMasterElement, b.dayMasterElement) ||
      isSpouseStar(b.dayMasterElement, a.dayMasterElement),
    polarDiff: a.dayMasterPolarity !== b.dayMasterPolarity,
  };
}

function n(base: number): number {
  return clampScore(base);
}

/** 五軸分數 0–100，依關係套用不同權重。 */
export function scoreHepanRadar(a: BaziResult, b: BaziResult, relation: Relation): RadarAxis[] {
  const s = readSignals(a, b);
  const labels = AXIS_LABELS[relation];
  const values =
    relation === "couple"
      ? coupleAxes(s)
      : relation === "lover"
        ? loverAxes(s)
        : relation === "friend"
          ? friendAxes(s)
          : partnerAxes(s);
  return labels.map((label, i) => ({
    key: `${relation}-${i}`,
    label,
    score: values[i] ?? 50,
  }));
}

function coupleAxes(s: Signals): number[] {
  return [
    n(46 + (s.stemHe ? 20 : 0) + (s.dayHe ? 18 : 0) + (s.spouse ? 14 : 0) + (s.polarDiff ? 8 : -4) + (s.dayChong ? -18 : 0)),
    n(48 + (s.spouse ? 16 : 0) + (s.usefulHits * 8) + (s.sheng ? 8 : 0) + (s.ke ? 4 : 0) + (s.dayChong ? -10 : 4)),
    n(50 + (s.dayHe ? 16 : 0) + (s.daySanhe ? 14 : 0) + (s.dayChong ? -22 : 8) + (s.same ? 6 : 0)),
    n(48 + (s.stemHe ? 10 : 0) + (s.sheng ? 12 : 0) + (s.same ? 8 : 0) + (s.ke ? -10 : 0) + (s.polarDiff ? 4 : 6)),
    n(46 + (s.usefulHits * 12) + (s.sheng ? 14 : 0) + (s.ke ? -8 : 0) + (s.monthHe ? 8 : 0)),
  ];
}

function loverAxes(s: Signals): number[] {
  return [
    n(46 + (s.stemHe ? 22 : 0) + (s.spouse ? 12 : 0) + (s.polarDiff ? 10 : -2) + (s.dayHe ? 10 : 0)),
    n(48 + (s.sheng ? 16 : 0) + (s.stemHe ? 12 : 0) + (s.ke ? -6 : 4) + (s.polarDiff ? 8 : 0)),
    n(48 + (s.stemHe ? 8 : 0) + (s.sheng ? 10 : 0) + (s.same ? 6 : 0) + (s.ke ? -12 : 0) + (s.dayChong ? -8 : 6)),
    n(50 + (s.usefulHits * 8) + (s.dayHe ? 10 : 0) + (s.dayChong ? -14 : 8) + (s.ke ? -4 : 6)),
    n(48 + (s.dayHe ? 14 : 0) + (s.daySanhe ? 12 : 0) + (s.dayChong ? -20 : 8) + (s.same ? 6 : 0)),
  ];
}

function friendAxes(s: Signals): number[] {
  return [
    n(48 + (s.same ? 20 : 0) + (s.sheng ? 10 : 0) + (s.stemHe ? 8 : 0) + (s.ke ? -10 : 0)),
    n(50 + (s.dayHe ? 12 : 0) + (s.same ? 10 : 0) + (s.dayChong ? -14 : 8) + (s.usefulHits * 6)),
    n(48 + (s.usefulHits * 12) + (s.sheng ? 14 : 0) + (s.monthHe ? 8 : 0) + (s.ke ? -8 : 0)),
    n(52 + (s.same ? 10 : 0) + (s.dayChong ? -18 : 10) + (s.ke ? -12 : 6) + (s.polarDiff ? 0 : 8)),
    n(48 + (s.dayHe ? 12 : 0) + (s.daySanhe ? 10 : 0) + (s.dayChong ? -16 : 8) + (s.same ? 8 : 0)),
  ];
}

function partnerAxes(s: Signals): number[] {
  return [
    n(46 + (s.usefulHits * 14) + (s.sheng ? 12 : 0) + (s.ke ? -12 : 0) + (s.stemHe ? 8 : 0)),
    n(50 + (s.monthHe ? 14 : 0) + (s.dayHe ? 8 : 0) + (s.monthChong ? -16 : 6) + (s.dayChong ? -10 : 4)),
    n(48 + (s.monthHe ? 16 : 0) + (s.sheng ? 12 : 0) + (s.usefulHits * 8) + (s.monthChong ? -14 : 6)),
    n(48 + (s.ke ? -8 : 8) + (s.sheng ? 14 : 0) + (s.stemHe ? 8 : 0) + (s.same ? 6 : 0)),
    n(50 + (s.monthHe ? 12 : 0) + (s.daySanhe ? 10 : 0) + (s.monthChong ? -18 : 8) + (s.dayChong ? -12 : 6)),
  ];
}
