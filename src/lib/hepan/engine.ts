import { WUXING, WUXING_LABEL, type Wuxing } from "@/lib/bazi/constants";
import type { BaziResult } from "@/lib/bazi/types";
import {
  RELATION_LABEL,
  RELATION_WEIGHTS,
  branchClash,
  branchCombination,
  clampScore,
  comboLabel,
  dayMasterLink,
  dayMasterLinkLabel,
  isSpouseStar,
  linkCenterGlyph,
  stemCombination,
  verdictFor,
  type Relation,
} from "./rules";

export type HepanResult = {
  relation: Relation;
  relationLabel: string;
  score: number;
  verdict: string;
  summary: string;
  tags: string[];
  link: ReturnType<typeof dayMasterLink>;
  linkLabel: string;
  centerGlyph: string;
  stemHe: Wuxing | null;
  branchHe: Wuxing | null;
  branchChong: boolean;
  combinedPercents: Record<Wuxing, number>;
  bondElement: Wuxing | null;
};

export function calculateHepan(a: BaziResult, b: BaziResult, relation: Relation): HepanResult {
  const w = RELATION_WEIGHTS[relation];
  const stemHe = stemCombination(a.dayMaster, b.dayMaster);
  const branchHe = branchCombination(a.pillars.day.zhi, b.pillars.day.zhi);
  const chong = branchClash(a.pillars.day.zhi, b.pillars.day.zhi);
  const link = dayMasterLink(a.dayMasterElement, b.dayMasterElement);
  const polarityDiff = a.dayMasterPolarity !== b.dayMasterPolarity;

  const aUsesB = a.useful.includes(b.dayMasterElement);
  const bUsesA = b.useful.includes(a.dayMasterElement);
  const spouseA = isSpouseStar(a.dayMasterElement, b.dayMasterElement);
  const spouseB = isSpouseStar(b.dayMasterElement, a.dayMasterElement);

  let score = 50;
  const tags: string[] = [];

  if (stemHe) {
    score += w.stemHe;
    tags.push(comboLabel("stem", stemHe));
  }
  if (branchHe) {
    score += w.branchHe;
    tags.push(comboLabel("branch", branchHe));
  }
  if (chong) {
    score += w.branchChong;
    tags.push("日支六沖");
  }

  if (link === "same") {
    score += w.same;
    tags.push("日主比和");
  } else if (link === "a-sheng-b" || link === "b-sheng-a") {
    score += w.sheng;
    tags.push(dayMasterLinkLabel(link));
  } else {
    score += w.ke;
    tags.push(dayMasterLinkLabel(link));
  }

  if (aUsesB) {
    score += w.usefulHit;
    tags.push("乙方日主為甲方喜用");
  }
  if (bUsesA) {
    score += w.usefulHit;
    tags.push("甲方日主為乙方喜用");
  }

  if (spouseA || spouseB) {
    score += w.spouseStar;
    if (relation === "couple" || relation === "lover") tags.push("配偶星相見");
  }

  if (polarityDiff) score += w.polarityDiff;
  else score += w.polaritySame;

  const finalScore = clampScore(score);
  const verdict = verdictFor(finalScore, relation);
  const bondElement = stemHe ?? branchHe;
  const combinedPercents = emptyPercents();
  for (const el of WUXING) {
    combinedPercents[el] = (a.percents[el] + b.percents[el]) / 2;
  }

  const uniqueTags = [...new Set(tags)];
  const summary = buildSummary({
    relation,
    verdict,
    uniqueTags,
    a,
    b,
    link,
    polarityDiff,
    chong,
  });

  return {
    relation,
    relationLabel: RELATION_LABEL[relation],
    score: finalScore,
    verdict,
    summary,
    tags: uniqueTags,
    link,
    linkLabel: dayMasterLinkLabel(link),
    centerGlyph: linkCenterGlyph(link, stemHe),
    stemHe,
    branchHe,
    branchChong: chong,
    combinedPercents,
    bondElement,
  };
}

function emptyPercents(): Record<Wuxing, number> {
  return { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
}

function buildSummary(params: {
  relation: Relation;
  verdict: string;
  uniqueTags: string[];
  a: BaziResult;
  b: BaziResult;
  link: ReturnType<typeof dayMasterLink>;
  polarityDiff: boolean;
  chong: boolean;
}): string {
  const rel = RELATION_LABEL[params.relation];
  const yinYang = params.polarityDiff ? "陰陽異氣，坊間多半認為可配" : "陰陽同性，相處較少拉扯、也少互補";
  const clash = params.chong ? "日支有沖，拌嘴與變動較多，配戴喜用可作緩衝。" : "日支無沖，日常節奏較穩。";
  const useful = `甲方喜用${params.a.usefulLabel}，乙方喜用${params.b.usefulLabel}。`;
  return `以${rel}合盤，總評「${params.verdict}」。${params.uniqueTags.slice(0, 3).join("，")}。${yinYang}。${clash}${useful}`;
}

export function hepanUsefulLabel(a: BaziResult, b: BaziResult, bond: Wuxing | null): string {
  const els: Wuxing[] = [];
  const push = (el: Wuxing) => {
    if (!els.includes(el)) els.push(el);
  };
  if (bond) push(bond);
  a.useful.forEach(push);
  b.useful.forEach(push);
  return els.slice(0, 2).map((el) => WUXING_LABEL[el]).join("、");
}
