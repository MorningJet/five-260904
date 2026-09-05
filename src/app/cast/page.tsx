"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import BirthPicker, { type BirthValue } from "@/components/BirthPicker";
import CastingOverlay from "@/components/CastingOverlay";
import OrnamentTitle from "@/components/OrnamentTitle";
import { PhoneOverlay } from "@/components/PhoneOverlay";
import ChartReading from "@/components/ChartReading";
import ProductGrid from "@/components/ProductGrid";
import WuxingChart from "@/components/WuxingChart";
import { calculateBazi } from "@/lib/bazi/engine";
import { consumeCast, remainingCasts } from "@/lib/castQuota";
import { recommendProducts } from "@/lib/recommend";
import products from "@/data/products.json";
import type { Product } from "@/lib/types";
import styles from "./Cast.module.css";

const DEFAULT_BIRTH: BirthValue = { year: 2000, month: 1, day: 1, hour: 0 };
const BIRTH_KEY = "five-birth";
const CAST_LIMIT_TOAST = "今日單人排盤 5 次試用已結束，請明日再來";
const TOAST_MS = 2400;

function readBirth(): BirthValue | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(BIRTH_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as BirthValue;
    if (
      typeof value.year !== "number" ||
      typeof value.month !== "number" ||
      typeof value.day !== "number" ||
      typeof value.hour !== "number"
    ) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export default function CastPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BirthValue>(DEFAULT_BIRTH);
  const [birth, setBirth] = useState<BirthValue | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [casting, setCasting] = useState(false);
  const [limitToastAt, setLimitToastAt] = useState(0);
  const pendingBirth = useRef<BirthValue | null>(null);
  const autoOpened = useRef(false);

  useEffect(() => {
    const saved = readBirth();
    setDraft(saved ?? DEFAULT_BIRTH);
    setBirth(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || birth || autoOpened.current) return;
    autoOpened.current = true;
    if (remainingCasts("solo") <= 0) return;
    setPickerOpen(true);
  }, [ready, birth]);

  useEffect(() => {
    if (!limitToastAt) return;
    const timer = window.setTimeout(() => setLimitToastAt(0), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [limitToastAt]);

  const showCastLimit = () => setLimitToastAt(Date.now());

  const openPicker = () => {
    if (remainingCasts("solo") <= 0) {
      showCastLimit();
      return;
    }
    setPickerOpen(true);
  };

  const finishCasting = useCallback(() => {
    const next = pendingBirth.current;
    pendingBirth.current = null;
    if (!next) {
      setCasting(false);
      return;
    }
    setBirth(next);
    sessionStorage.setItem(BIRTH_KEY, JSON.stringify(next));
    setCasting(false);
  }, []);

  const catalog = products as Product[];

  const result = useMemo(() => {
    if (!birth) return null;
    try {
      return calculateBazi(birth);
    } catch {
      return null;
    }
  }, [birth]);

  const recs = useMemo(() => {
    if (!result) return [];
    return recommendProducts(catalog, result.useful, 4);
  }, [catalog, result]);

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <button
          type="button"
          className={styles.back}
          onClick={() => router.push("/")}
          aria-label="返回首頁"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15.5 5.5 8.5 12l7 6.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className={styles.brandRow}>
          <BrandLogo size="sm" />
          <h1 className={styles.brand}>五行沉香</h1>
        </span>
      </header>

      {ready && !result && !casting && (
        <section className={styles.empty}>
          <p>請填寫出生年、月、日、時，即可查看五行命理與手串推薦</p>
          <button type="button" onClick={openPicker}>
            輸入出生時間
          </button>
        </section>
      )}

      {result && !casting && (
        <>
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2>出生時間</h2>
              <button type="button" className={styles.edit} onClick={openPicker}>
                更改
              </button>
            </div>
            <p className={styles.solar}>
              {result.solarLabel} {result.lunarLabel}
            </p>
            <div className={styles.attr}>
              <span>五行屬性</span>
              <strong>
                日主為{result.dayMaster}　屬{result.dayMasterDesc}　{result.strengthLabel}
              </strong>
            </div>
          </section>

          <section className={styles.plain}>
            <div className={styles.ornamentHead}>
              <OrnamentTitle size="lg">{result.strengthLabel}</OrnamentTitle>
            </div>
            <WuxingChart result={result} />
            <button type="button" className={styles.q} onClick={() => setHelpOpen(true)} aria-label="說明">
              ?
            </button>
          </section>

          <ProductGrid items={recs} usefulLabel={result.usefulLabel} />
          <ChartReading useful={result.useful} />
        </>
      )}

      {pickerOpen && (
        <BirthPicker
          value={draft}
          onChange={setDraft}
          onClose={() => setPickerOpen(false)}
          onConfirm={() => {
            if (!consumeCast("solo")) {
              setPickerOpen(false);
              showCastLimit();
              return;
            }
            pendingBirth.current = draft;
            setPickerOpen(false);
            setCasting(true);
          }}
        />
      )}

      {casting && <CastingOverlay onDone={finishCasting} />}

      {helpOpen && (
        <PhoneOverlay>
        <div className={styles.mask} onClick={() => setHelpOpen(false)} role="presentation">
          <div className={styles.pop} onClick={(e) => e.stopPropagation()} role="dialog">
            <p>
              命盤結果僅供參考，個人運勢高低與影響仍需綜合判斷。此處計算僅供娛樂與飾品搭配建議，不構成任何主張。請理性看待，並相信科學。
            </p>
            <button type="button" className={styles.ok} onClick={() => setHelpOpen(false)}>
              了解
            </button>
          </div>
        </div>
        </PhoneOverlay>
      )}
      {limitToastAt > 0 && (
        <PhoneOverlay>
          <div className={styles.toastLayer} role="status" style={{ pointerEvents: "none" }}>
            <p className={styles.toast}>{CAST_LIMIT_TOAST}</p>
          </div>
        </PhoneOverlay>
      )}
    </main>
  );
}
