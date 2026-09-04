declare module "lunar-javascript" {
  export class Solar {
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): Solar;
    getLunar(): Lunar;
  }

  export class Lunar {
    getEightChar(): EightChar;
    getYearInGanZhi(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    toString(): string;
  }

  export class EightChar {
    setSect(sect: number): void;
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearGan(): string;
    getMonthGan(): string;
    getDayGan(): string;
    getTimeGan(): string;
    getYearZhi(): string;
    getMonthZhi(): string;
    getDayZhi(): string;
    getTimeZhi(): string;
    getYearHideGan(): string[];
    getMonthHideGan(): string[];
    getDayHideGan(): string[];
    getTimeHideGan(): string[];
  }
}
