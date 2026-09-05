import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateBazi } from "@/lib/bazi/engine";
import { calculateHepan } from "./engine";
import { getPairCopy, pairCatalogSize } from "./pairStories";
import { recommendPairs } from "./recommend";
import {
  branchClash,
  branchCombination,
  branchSanhe,
  dayMasterLink,
  stemCombination,
} from "./rules";
import { scoreHepanRadar } from "./radar";
import type { Product } from "@/lib/types";
import catalog from "@/data/products.json";
import { RELATIONS } from "./rules";

describe("hepan rules", () => {
  it("天干五合", () => {
    assert.equal(stemCombination("甲", "己"), "earth");
    assert.equal(stemCombination("己", "甲"), "earth");
    assert.equal(stemCombination("乙", "庚"), "metal");
    assert.equal(stemCombination("丙", "辛"), "water");
    assert.equal(stemCombination("丁", "壬"), "wood");
    assert.equal(stemCombination("戊", "癸"), "fire");
    assert.equal(stemCombination("甲", "乙"), null);
  });

  it("地支六合六沖", () => {
    assert.equal(branchCombination("子", "丑"), "earth");
    assert.equal(branchCombination("卯", "戌"), "fire");
    assert.equal(branchClash("子", "午"), true);
    assert.equal(branchClash("寅", "申"), true);
    assert.equal(branchClash("子", "丑"), false);
  });

  it("地支三合半合", () => {
    assert.equal(branchSanhe("申", "子"), "water");
    assert.equal(branchSanhe("寅", "午"), "fire");
    assert.equal(branchSanhe("子", "午"), null);
  });

  it("日主生克", () => {
    assert.equal(dayMasterLink("wood", "fire"), "a-sheng-b");
    assert.equal(dayMasterLink("fire", "wood"), "b-sheng-a");
    assert.equal(dayMasterLink("wood", "earth"), "a-ke-b");
    assert.equal(dayMasterLink("wood", "wood"), "same");
  });
});

describe("calculateHepan", () => {
  it("甲己合化土加分，分數高於無合", () => {
    const a = calculateBazi({ year: 1990, month: 11, day: 5, hour: 10 });
    const b = calculateBazi({ year: 1990, month: 9, day: 1, hour: 10 });
    assert.equal(a.dayMaster, "甲");
    assert.equal(b.dayMaster, "己");
    const he = calculateHepan(a, b, "couple");
    assert.equal(he.stemHe, "earth");
    assert.ok(he.score >= 60);
    assert.ok(he.tags.some((t) => t.includes("天干五合")));
  });
});

describe("scoreHepanRadar", () => {
  it("四種關係皆為五軸且分數在 0–100", () => {
    const a = calculateBazi({ year: 1990, month: 11, day: 5, hour: 10 });
    const b = calculateBazi({ year: 1990, month: 9, day: 1, hour: 10 });
    for (const rel of ["couple", "lover", "friend", "partner"] as const) {
      const axes = scoreHepanRadar(a, b, rel);
      assert.equal(axes.length, 5);
      for (const axis of axes) {
        assert.ok(axis.score >= 0 && axis.score <= 100);
      }
    }
    const couple = scoreHepanRadar(a, b, "couple");
    assert.equal(couple[0]?.label, "親密");
    const partner = scoreHepanRadar(a, b, "partner");
    assert.equal(partner[0]?.label, "互補");
  });
});

describe("recommendPairs", () => {
  const sample = (id: string, element: Product["element"]): Product => ({
    id,
    name: id,
    element,
    elementLabel: element,
    beadMm: 10,
    wristCm: 18,
    price: 1000,
    shipping: 0,
    image: "/x.jpg",
  });

  it("推薦三組且左右不重複", () => {
    const products = [
      sample("w1", "wood"),
      sample("w2", "wood"),
      sample("f1", "fire"),
      sample("f2", "fire"),
      sample("e1", "earth"),
      sample("m1", "metal"),
    ];
    const a = calculateBazi({ year: 1990, month: 3, day: 8, hour: 6 });
    const b = calculateBazi({ year: 1992, month: 8, day: 12, hour: 14 });
    const pairs = recommendPairs(products, a, b, "couple", null, 3);
    assert.equal(pairs.length, 3);
    const ids = pairs.flatMap((p) => [p.left.product.id, p.right.product.id]);
    assert.equal(new Set(ids).size, ids.length);
    for (const pair of pairs) {
      assert.ok(pair.title.length > 0);
      assert.ok(!pair.title.includes("組"));
      assert.ok(pair.reason.length > 40);
      assert.match(pair.reason, /配戴後/);
      assert.match(pair.reason, /錢|財|存款/);
    }
    assert.equal(new Set(pairs.map((p) => p.reason)).size, pairs.length);
    assert.equal(new Set(pairs.map((p) => p.title)).size, pairs.length);
  });

  it("同一對人換關係，推薦手串對會換一批", () => {
    const products = catalog as Product[];
    const a = calculateBazi({ year: 1983, month: 1, day: 1, hour: 0 });
    const b = calculateBazi({ year: 1996, month: 1, day: 4, hour: 0 });
    const sets = RELATIONS.map((rel) => {
      const pairs = recommendPairs(products, a, b, rel, null, 3);
      return pairs
        .map((p) => [p.left.product.id, p.right.product.id].sort().join("|"))
        .sort()
        .join(",");
    });
    assert.ok(new Set(sets).size >= 3);
  });
});

describe("pairStories", () => {
  it("目錄每一對手串都有獨立命名", () => {
    const list = catalog as Product[];
    assert.equal(pairCatalogSize(), (list.length * (list.length - 1)) / 2);
    const a = list[0];
    const b = list[1];
    const c = list[2];
    if (!a || !b || !c) throw new Error("catalog too small");
    const one = getPairCopy(a, b);
    const two = getPairCopy(a, c);
    const swap = getPairCopy(b, a);
    const asFriend = getPairCopy(a, b);
    assert.notEqual(one.title, two.title);
    assert.equal(one.title, swap.title);
    assert.equal(one.reason, swap.reason);
    assert.equal(one.reason, asFriend.reason);
    assert.notEqual(one.reason, two.reason);
    assert.ok(one.reason.includes(a.name));
    assert.ok(one.reason.includes(b.name));
  });
});
