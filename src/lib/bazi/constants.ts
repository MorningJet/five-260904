export const WUXING = ["wood", "fire", "earth", "metal", "water"] as const;
export type Wuxing = (typeof WUXING)[number];

export const WUXING_LABEL: Record<Wuxing, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  metal: "金",
  water: "水",
};

/** 與五行圖節點同一套配色 */
export const WUXING_THEME: Record<Wuxing, { fill: string; stroke: string; ink: string; badge: string }> = {
  fire: { fill: "#F8E6E3", stroke: "#E8A198", ink: "#D15B4C", badge: "#E06A55" },
  earth: { fill: "#F3E6D4", stroke: "#D2B48C", ink: "#B0854A", badge: "#C49655" },
  metal: { fill: "#FBE6C8", stroke: "#E8B65C", ink: "#E09A2A", badge: "#E8A33A" },
  water: { fill: "#D9E8F4", stroke: "#7EADC8", ink: "#4A86A8", badge: "#5B90B0" },
  wood: { fill: "#DFF0E4", stroke: "#8FCB9A", ink: "#5A9A68", badge: "#62A572" },
};

export const STEM_WUXING: Record<string, Wuxing> = {
  甲: "wood",
  乙: "wood",
  丙: "fire",
  丁: "fire",
  戊: "earth",
  己: "earth",
  庚: "metal",
  辛: "metal",
  壬: "water",
  癸: "water",
};

export const STEM_YIN_YANG: Record<string, "yang" | "yin"> = {
  甲: "yang",
  乙: "yin",
  丙: "yang",
  丁: "yin",
  戊: "yang",
  己: "yin",
  庚: "yang",
  辛: "yin",
  壬: "yang",
  癸: "yin",
};

export const STEM_LABEL: Record<string, string> = {
  甲: "陽木",
  乙: "陰木",
  丙: "陽火",
  丁: "陰火",
  戊: "陽土",
  己: "陰土",
  庚: "陽金",
  辛: "陰金",
  壬: "陽水",
  癸: "陰水",
};

/**
 * 子平日主定五行（市面八字／合盤主流，寫死天干對照）：
 * 用出生日的天干，不用出生年納音。
 * 甲乙木、丙丁火、戊己土、庚辛金、壬癸水。
 */
export function personWuxingFromDayGan(dayGan: string): Wuxing {
  const el = STEM_WUXING[dayGan];
  if (!el) throw new Error(`未知日干: ${dayGan}`);
  return el;
}

/** 我生：木→火→土→金→水→木 */
export const SHENG: Record<Wuxing, Wuxing> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

/** 我克：木→土→水→火→金→木 */
export const KE: Record<Wuxing, Wuxing> = {
  wood: "earth",
  fire: "metal",
  earth: "water",
  metal: "wood",
  water: "fire",
};

export function shengWo(me: Wuxing): Wuxing {
  const found = WUXING.find((w) => SHENG[w] === me);
  if (!found) throw new Error("invalid wuxing");
  return found;
}

export function keWo(me: Wuxing): Wuxing {
  const found = WUXING.find((w) => KE[w] === me);
  if (!found) throw new Error("invalid wuxing");
  return found;
}

/**
 * 量化排盤常見位置權重（月令獨重）。
 * 年干6 / 月干12 / 日干12 / 時干12
 * 年支10 / 月支40 / 日支20 / 時支10
 */
export const STEM_POSITION_WEIGHT = {
  year: 6,
  month: 12,
  day: 12,
  time: 12,
} as const;

export const BRANCH_POSITION_WEIGHT = {
  year: 10,
  month: 40,
  day: 20,
  time: 10,
} as const;

/** 藏干比例：獨藏 100%；二藏 70/30；三藏 60/30/10（本氣/中氣/餘氣） */
export function hideGanRatios(count: number): number[] {
  if (count <= 1) return [1];
  if (count === 2) return [0.7, 0.3];
  return [0.6, 0.3, 0.1];
}

export const STRENGTH_STRONG = 0.55;
export const STRENGTH_WEAK = 0.45;

/**
 * 調候用神（按月支，民間口訣壓縮版）：
 * 冬月、秋金、春木多用火；夏月燥熱用水；辰戌溼燥分別用水。
 */
export const TIAOHOU_BY_MONTH_ZHI: Record<string, Wuxing> = {
  亥: "fire",
  子: "fire",
  丑: "fire",
  寅: "fire",
  卯: "fire",
  辰: "water",
  巳: "water",
  午: "water",
  未: "water",
  申: "fire",
  酉: "fire",
  戌: "water",
};

export function tenGodsForElement(me: Wuxing, el: Wuxing): [string, string] {
  if (el === me) return ["比肩", "劫財"];
  if (el === SHENG[me]) return ["食神", "傷官"];
  if (el === KE[me]) return ["偏財", "正財"];
  if (el === keWo(me)) return ["七殺", "正官"];
  return ["偏印", "正印"];
}
