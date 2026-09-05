import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scorePillars, pickUseful } from "./score";
import { calculateBazi } from "./engine";
import { personWuxingFromDayGan } from "./constants";
import type { FourPillars } from "./types";

function p(gan: string, zhi: string, hide: string[]): FourPillars["year"] {
  return { ganZhi: gan + zhi, gan, zhi, hideGan: hide };
}

describe("scorePillars", () => {
  it("月支權重大於年支，獨藏支全額計入本氣", () => {
    const pillars: FourPillars = {
      year: p("甲", "子", ["癸"]),
      month: p("乙", "卯", ["乙"]),
      day: p("甲", "寅", ["甲", "丙", "戊"]),
      time: p("丙", "午", ["丁", "己"]),
    };
    const s = scorePillars(pillars);
    assert.ok(s.percents.wood > s.percents.water);
    const sum = Object.values(s.percents).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 100) < 1e-9);
  });

  it("同黨佔比達 55% 判身強，45% 及以下判身弱", () => {
    const strong: FourPillars = {
      year: p("甲", "寅", ["甲", "丙", "戊"]),
      month: p("甲", "卯", ["乙"]),
      day: p("甲", "寅", ["甲", "丙", "戊"]),
      time: p("乙", "卯", ["乙"]),
    };
    assert.equal(scorePillars(strong).strength, "strong");

    const weak: FourPillars = {
      year: p("庚", "申", ["庚", "壬", "戊"]),
      month: p("庚", "酉", ["辛"]),
      day: p("甲", "申", ["庚", "壬", "戊"]),
      time: p("辛", "酉", ["辛"]),
    };
    assert.equal(scorePillars(weak).strength, "weak");
  });
});

describe("pickUseful", () => {
  const percents = { wood: 10, fire: 20, earth: 30, metal: 25, water: 15 };

  it("身弱取印與比劫，最多兩位", () => {
    const { useful, tiaohou } = pickUseful("wood", "weak", percents, "酉");
    assert.equal(tiaohou, "fire");
    assert.deepEqual(useful, ["wood", "water"]);
  });

  it("身強在食傷、財、官殺中取最缺的兩位", () => {
    const { useful } = pickUseful("wood", "strong", percents, "午");
    assert.deepEqual(useful, ["fire", "metal"]);
  });
});

describe("calculateBazi 1997-09-30 13:00", () => {
  it("日主為乙，農曆丁丑年八月廿九", () => {
    const r = calculateBazi({ year: 1997, month: 9, day: 30, hour: 13 });
    assert.equal(r.dayMaster, "乙");
    assert.equal(r.dayMasterElement, "wood");
    assert.equal(personWuxingFromDayGan("乙"), "wood");
    assert.equal(personWuxingFromDayGan("戊"), "earth");
    assert.equal(personWuxingFromDayGan("庚"), "metal");
    assert.equal(r.dayMasterDesc, "陰木");
    assert.equal(r.lunarLabel, "丁丑年八月廿九");
    assert.equal(r.pillars.day.ganZhi, "乙亥");
    assert.equal(r.pillars.time.ganZhi, "癸未");
  });

  it("干支農曆隨出生時間變化", () => {
    const a = calculateBazi({ year: 2000, month: 1, day: 1, hour: 8 });
    const b = calculateBazi({ year: 1990, month: 6, day: 15, hour: 12 });
    assert.notEqual(a.lunarLabel, "丁丑年八月廿九");
    assert.notEqual(a.lunarLabel, b.lunarLabel);
    assert.match(a.lunarLabel, /^.+年.+月.+$/);
  });
});
