import {
  BRANCH_POSITION_WEIGHT,
  hideGanRatios,
  keWo,
  KE,
  SHENG,
  shengWo,
  STEM_POSITION_WEIGHT,
  STEM_WUXING,
  STRENGTH_STRONG,
  STRENGTH_WEAK,
  tenGodsForElement,
  TIAOHOU_BY_MONTH_ZHI,
  WUXING,
  WUXING_LABEL,
  personWuxingFromDayGan,
  type Wuxing,
} from "./constants";
import type { BaziResult, FourPillars, Strength } from "./types";

export type ScoreBreakdown = {
  scores: Record<Wuxing, number>;
  percents: Record<Wuxing, number>;
  sameParty: number;
  otherParty: number;
  samePartyRatio: number;
  strength: Strength;
};

function emptyScores(): Record<Wuxing, number> {
  return { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
}

function add(scores: Record<Wuxing, number>, gan: string, weight: number) {
  const el = STEM_WUXING[gan];
  if (!el) return;
  scores[el] += weight;
}

export function scorePillars(pillars: FourPillars): ScoreBreakdown {
  const scores = emptyScores();
  const stems = [
    ["year", pillars.year.gan],
    ["month", pillars.month.gan],
    ["day", pillars.day.gan],
    ["time", pillars.time.gan],
  ] as const;

  for (const [pos, gan] of stems) {
    add(scores, gan, STEM_POSITION_WEIGHT[pos]);
  }

  const branches = [
    ["year", pillars.year.hideGan],
    ["month", pillars.month.hideGan],
    ["day", pillars.day.hideGan],
    ["time", pillars.time.hideGan],
  ] as const;

  for (const [pos, hides] of branches) {
    const ratios = hideGanRatios(hides.length);
    const base = BRANCH_POSITION_WEIGHT[pos];
    hides.forEach((gan, i) => {
      add(scores, gan, base * (ratios[i] ?? 0));
    });
  }

  const total = WUXING.reduce((s, w) => s + scores[w], 0) || 1;
  const percents = emptyScores();
  for (const w of WUXING) {
    percents[w] = (scores[w] / total) * 100;
  }

  const me = STEM_WUXING[pillars.day.gan];
  const sameEls: Wuxing[] = [me, shengWo(me)];
  const otherEls: Wuxing[] = [SHENG[me], KE[me], keWo(me)];
  const sameParty = sameEls.reduce((s, w) => s + scores[w], 0);
  const otherParty = otherEls.reduce((s, w) => s + scores[w], 0);
  const samePartyRatio = sameParty / (sameParty + otherParty || 1);

  let strength: Strength = "balanced";
  if (samePartyRatio >= STRENGTH_STRONG) strength = "strong";
  else if (samePartyRatio <= STRENGTH_WEAK) strength = "weak";

  return { scores, percents, sameParty, otherParty, samePartyRatio, strength };
}

export function pickUseful(
  me: Wuxing,
  strength: Strength,
  percents: Record<Wuxing, number>,
  monthZhi: string,
): { useful: Wuxing[]; tiaohou: Wuxing } {
  const tiaohou = TIAOHOU_BY_MONTH_ZHI[monthZhi] ?? "fire";
  const printEl = shengWo(me);
  const bijie = me;
  const shishang = SHENG[me];
  const cai = KE[me];
  const guansha = keWo(me);

  let candidates: Wuxing[];
  if (strength === "weak") {
    candidates = [printEl, bijie];
  } else if (strength === "strong") {
    candidates = [shishang, cai, guansha];
  } else {
    candidates = [...WUXING].sort((a, b) => percents[a] - percents[b]).slice(0, 2);
  }

  const useful: Wuxing[] = [];
  const push = (el: Wuxing) => {
    if (!useful.includes(el)) useful.push(el);
  };
  const byLack = [...candidates].sort((a, b) => percents[a] - percents[b]);
  byLack.forEach(push);
  if (!useful.includes(tiaohou) && useful.length < 2) push(tiaohou);
  return { useful: useful.slice(0, 2), tiaohou };
}

export function strengthLabel(strength: Strength): string {
  if (strength === "strong") return "身強型";
  if (strength === "weak") return "身弱型";
  return "中和型";
}

export function assembleResult(params: {
  year: number;
  month: number;
  day: number;
  hour: number;
  solarLabel: string;
  lunarLabel: string;
  pillars: FourPillars;
  dayMaster: string;
  polarity: "yang" | "yin";
  desc: string;
}): BaziResult {
  const scored = scorePillars(params.pillars);
  const me = personWuxingFromDayGan(params.dayMaster);
  const { useful, tiaohou } = pickUseful(
    me,
    scored.strength,
    scored.percents,
    params.pillars.month.zhi,
  );
  const tenGods = {
    wood: tenGodsForElement(me, "wood"),
    fire: tenGodsForElement(me, "fire"),
    earth: tenGodsForElement(me, "earth"),
    metal: tenGodsForElement(me, "metal"),
    water: tenGodsForElement(me, "water"),
  };

  return {
    input: {
      year: params.year,
      month: params.month,
      day: params.day,
      hour: params.hour,
    },
    solarLabel: params.solarLabel,
    lunarLabel: params.lunarLabel,
    pillars: params.pillars,
    dayMaster: params.dayMaster,
    dayMasterElement: me,
    dayMasterPolarity: params.polarity,
    dayMasterDesc: params.desc,
    scores: scored.scores,
    percents: scored.percents,
    sameParty: scored.sameParty,
    otherParty: scored.otherParty,
    samePartyRatio: scored.samePartyRatio,
    strength: scored.strength,
    strengthLabel: strengthLabel(scored.strength),
    useful,
    usefulLabel: useful.map((w) => WUXING_LABEL[w]).join("、"),
    tiaohou,
    tenGods,
  };
}
