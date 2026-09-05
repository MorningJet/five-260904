"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import BannerCarousel from "@/components/BannerCarousel";
import { FeatCastIcon, FeatPairIcon } from "@/components/FlatIcons";
import OrnamentTitle from "@/components/OrnamentTitle";
import ProductMasonry from "@/components/ProductMasonry";
import { catalog } from "@/lib/catalog";
import styles from "./Home.module.css";

export default function ShopHomePage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <main className={styles.shell}>
      <h1 className={styles.srOnly}>五行沉香</h1>
      <BannerCarousel />

      <section className={styles.block} aria-label="五行排盤">
        <div className={styles.blockHead}>
          <OrnamentTitle size="lg">五行排盤</OrnamentTitle>
        </div>
        <div className={styles.feats}>
          <Link href="/cast" className={styles.feat} aria-label="單人排盤">
            <span className={styles.featIconSlot}>
              <FeatCastIcon className={styles.featIcon} />
            </span>
            <span className={styles.featRule} aria-hidden />
            <strong className={styles.featName}>單人排盤</strong>
          </Link>
          <Link href="/pair" className={styles.feat} aria-label="雙人合盤">
            <span className={styles.featIconSlot}>
              <FeatPairIcon className={`${styles.featIcon} ${styles.featIconPair}`} />
            </span>
            <span className={styles.featRule} aria-hidden />
            <strong className={styles.featName}>雙人合盤</strong>
          </Link>
        </div>
      </section>

      <section className={styles.block} aria-label="熱門商品">
        <div className={styles.blockHead}>
          <OrnamentTitle size="lg">熱門商品</OrnamentTitle>
        </div>
        <label className={styles.search}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16 16.5 20 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋手串名稱"
            enterKeyHint="search"
            autoComplete="off"
            aria-label="搜尋手串名稱"
          />
          {query ? (
            <button type="button" className={styles.searchClear} onClick={() => setQuery("")} aria-label="清除">
              ×
            </button>
          ) : null}
        </label>
        {filtered.length > 0 ? (
          <ProductMasonry items={filtered} />
        ) : (
          <p className={styles.emptyShop}>沒有符合「{query.trim()}」的手串</p>
        )}
      </section>
    </main>
  );
}
