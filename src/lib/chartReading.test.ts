import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { WUXING } from "./bazi/constants";
import {
  chartReadingCharCount,
  getChartReading,
  usefulReadingKey,
} from "./chartReading";

describe("getChartReading", () => {
  it("依喜用順序取不同文案，金水不等於水金", () => {
    const goldWater = getChartReading(["metal", "water"]);
    const waterGold = getChartReading(["water", "metal"]);
    assert.equal(usefulReadingKey(["metal", "water"]), "金水");
    assert.notEqual(goldWater.marriage, waterGold.marriage);
    assert.match(goldWater.career, /法務|財務|品管|契約/);
  });

  it("土火仍分姻緣事業健康三段，並寫入具體選擇", () => {
    const copy = getChartReading(["earth", "fire"]);
    assert.match(copy.marriage, /選伴侶/);
    assert.match(copy.career, /選工作/);
    assert.match(copy.career, /選城市/);
    assert.match(copy.health, /選房子/);
    assert.match(copy.health, /作息/);
    assert.match(copy.marriage, /順境|逆境/);
    assert.ok(chartReadingCharCount(copy) >= 500);
  });

  it("所有雙喜用組合皆超過五百字", () => {
    for (const a of WUXING) {
      for (const b of WUXING) {
        if (a === b) continue;
        const n = chartReadingCharCount(getChartReading([a, b]));
        assert.ok(n >= 500, `${a}+${b} 僅 ${n} 字`);
      }
    }
  });

  it("單一喜用仍給出三段並超過五百字", () => {
    const copy = getChartReading(["wood"]);
    assert.match(copy.health, /作息/);
    assert.ok(chartReadingCharCount(copy) >= 500);
  });
});
