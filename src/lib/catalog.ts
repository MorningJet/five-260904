import products from "@/data/products.json";
import type { Product } from "./types";

export const catalog = products as Product[];

export function getProduct(id: string): Product | undefined {
  return catalog.find((item) => item.id === id);
}
