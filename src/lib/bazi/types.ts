import type { Wuxing } from "./constants";

export type Strength = "strong" | "weak" | "balanced";

export type Pillar = {
  ganZhi: string;
  gan: string;
  zhi: string;
  hideGan: string[];
};

export type FourPillars = {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  time: Pillar;
};

export type BaziResult = {
  input: { year: number; month: number; day: number; hour: number };
  solarLabel: string;
  lunarLabel: string;
  pillars: FourPillars;
  dayMaster: string;
  dayMasterElement: Wuxing;
  dayMasterPolarity: "yang" | "yin";
  dayMasterDesc: string;
  scores: Record<Wuxing, number>;
  percents: Record<Wuxing, number>;
  sameParty: number;
  otherParty: number;
  samePartyRatio: number;
  strength: Strength;
  strengthLabel: string;
  useful: Wuxing[];
  usefulLabel: string;
  tiaohou: Wuxing;
  tenGods: Record<Wuxing, [string, string]>;
};
