import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { recommendProducts } from "./recommend";
import type { Product } from "./types";

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

describe("recommendProducts", () => {
  it("喜用第一位排在最前", () => {
    const products = [sample("m", "metal"), sample("w", "wood"), sample("f", "fire")];
    const rec = recommendProducts(products, ["wood", "fire"], 3);
    assert.equal(rec[0]?.product.id, "w");
    assert.equal(rec[1]?.product.id, "f");
  });

  it("一次最多推薦 4 款", () => {
    const products = ["a", "b", "c", "d", "e", "f"].map((id) => sample(id, "wood"));
    const rec = recommendProducts(products, ["wood"], 4);
    assert.equal(rec.length, 4);
  });

  it("四個格子涵蓋兩個喜用，而不是被第一喜用佔滿", () => {
    const products = [
      sample("w1", "wood"),
      sample("w2", "wood"),
      sample("w3", "wood"),
      sample("w4", "wood"),
      sample("f1", "fire"),
    ];
    const rec = recommendProducts(products, ["wood", "fire"], 4);
    const elements = rec.map((r) => r.product.element);
    assert.equal(rec[0]?.product.element, "wood");
    assert.ok(elements.includes("fire"));
    assert.equal(new Set(elements).size, 2);
  });
});
