import type { Wuxing } from "./bazi/constants";

export type Product = {
  id: string;
  name: string;
  element: Wuxing;
  elementLabel: string;
  beadMm: number;
  wristCm: number;
  price: number;
  shipping: number;
  image: string;
};

export type RecommendItem = {
  product: Product;
  score: number;
  reasons: string[];
};
