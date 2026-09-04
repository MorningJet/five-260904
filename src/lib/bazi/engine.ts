import { Solar } from "lunar-javascript";
import { STEM_LABEL, STEM_WUXING, STEM_YIN_YANG } from "./constants";
import { assembleResult } from "./score";
import type { BaziResult, FourPillars, Pillar } from "./types";

const SECT_LATE_ZI_SAME_DAY = 2;

function pillar(ganZhi: string, gan: string, zhi: string, hideGan: string[]): Pillar {
  return { ganZhi, gan, zhi, hideGan: [...hideGan] };
}

function lunarMonthDayLabel(lunar: {
  getYearInGanZhi(): string;
  getMonthInChinese(): string;
  getDayInChinese(): string;
}): string {
  return `${lunar.getYearInGanZhi()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
}

export function calculateBazi(input: {
  year: number;
  month: number;
  day: number;
  hour: number;
}): BaziResult {
  const { year, month, day, hour } = input;
  const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
  const lunar = solar.getLunar();
  const eight = lunar.getEightChar();
  eight.setSect(SECT_LATE_ZI_SAME_DAY);

  const pillars: FourPillars = {
    year: pillar(eight.getYear(), eight.getYearGan(), eight.getYearZhi(), eight.getYearHideGan()),
    month: pillar(
      eight.getMonth(),
      eight.getMonthGan(),
      eight.getMonthZhi(),
      eight.getMonthHideGan(),
    ),
    day: pillar(eight.getDay(), eight.getDayGan(), eight.getDayZhi(), eight.getDayHideGan()),
    time: pillar(eight.getTime(), eight.getTimeGan(), eight.getTimeZhi(), eight.getTimeHideGan()),
  };

  const dayMaster = pillars.day.gan;
  const polarity = STEM_YIN_YANG[dayMaster];
  const desc = STEM_LABEL[dayMaster];
  if (!STEM_WUXING[dayMaster] || !polarity || !desc) {
    throw new Error(`未知日干: ${dayMaster}`);
  }

  return assembleResult({
    year,
    month,
    day,
    hour,
    solarLabel: `${year}年${month}月${day}日${hour}時`,
    lunarLabel: lunarMonthDayLabel(lunar),
    pillars,
    dayMaster,
    polarity,
    desc,
  });
}
