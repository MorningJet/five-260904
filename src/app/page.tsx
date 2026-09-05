"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { FeatCastIcon, FeatPairIcon } from "@/components/FlatIcons";
import OrnamentTitle from "@/components/OrnamentTitle";
import ProductMasonry from "@/components/ProductMasonry";
import { catalog } from "@/lib/catalog";
import styles from "./Home.module.css";

const BANNER_SRC = "/shop/banner.jpg";

export default function ShopHomePage() {
  const [bannerOk, setBannerOk] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const img = new Image();
    img.onload = () => setBannerOk(true);
    img.onerror = () => setBannerOk(false);
    img.src = BANNER_SRC;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <main className={styles.shell}>
      <section
        className={`${styles.intro} ${bannerOk ? styles.introHasImg : ""}`}
        aria-label="店面介紹"
      >
        {bannerOk ? (
          <img className={styles.introImg} src={BANNER_SRC} alt="店面介紹" />
        ) : (
          <div className={styles.introSlot} />
        )}
        <div className={styles.introCopy}>
          <BrandLogo size="lg" light={bannerOk} />
          <p className={styles.introBrand}>五行沉香</p>
          <h1>依八字喜用，配一串沉香</h1>
          <p className={styles.introHint}>{bannerOk ? "選香 · 排盤 · 把五行收在腕上" : "宣傳圖待上架"}</p>
        </div>
      </section>

      <section className={styles.block} aria-label="五行排盤">
        <div className={styles.blockHead}>
          <OrnamentTitle size="lg">五行排盤</OrnamentTitle>
        </div>
        <div className={styles.feats}>
          <Link href="/cast" className={styles.feat}>
            <FeatCastIcon className={styles.featIcon} />
            <strong className={styles.featName}>單人排盤</strong>
            <p className={styles.featDesc}>依生辰看喜用，薦一串沉香</p>
          </Link>
          <Link href="/pair" className={styles.feat}>
            <FeatPairIcon className={styles.featIcon} />
            <strong className={styles.featName}>雙人合盤</strong>
            <p className={styles.featDesc}>兩人八字對參，薦成對手串</p>
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

      <p className={styles.madeBy}>
        <BrandLogo size="sm" />
        <span>本店出品</span>
      </p>
    </main>
  );
}
