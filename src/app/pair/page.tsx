"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import BirthPicker, { type BirthValue } from "@/components/BirthPicker";
import CastingOverlay from "@/components/CastingOverlay";
import HepanRadar from "@/components/HepanRadar";
import OrnamentTitle from "@/components/OrnamentTitle";
import PairProducts from "@/components/PairProducts";
import { PhoneOverlay } from "@/components/PhoneOverlay";
import { WUXING_LABEL, WUXING_THEME } from "@/lib/bazi/constants";
import type { BaziResult } from "@/lib/bazi/types";
import { calculateBazi } from "@/lib/bazi/engine";
import { formatBirthDay } from "@/lib/date";
import { consumeCast, getOrCreateDeviceId, remainingCasts } from "@/lib/castQuota";
import { calculateHepan, hepanUsefulLabel } from "@/lib/hepan/engine";
import { scoreHepanRadar } from "@/lib/hepan/radar";
import { recommendPairs } from "@/lib/hepan/recommend";
import { RELATION_LABEL, RELATIONS, type Relation } from "@/lib/hepan/rules";
import products from "@/data/products.json";
import type { Product } from "@/lib/types";
import styles from "./Pair.module.css";

const DEFAULT_BIRTH: BirthValue = { year: 2000, month: 1, day: 1, hour: 0 };
const STORE_KEY = "five-hepan";
const CAST_LIMIT_TOAST = "今日5次試用已結束，請明日再來";
const TOAST_MS = 2400;
const PAIR_STEPS = [
  "正在對參雙方日主與月令……",
  "檢視天干五合、地支六合六沖……",
  "依關係權衡喜用互補與生克……",
];

type Saved = {
  a: BirthValue;
  b: BirthValue;
  relation: Relation;
};

function isBirth(value: unknown): value is BirthValue {
  if (!value || typeof value !== "object") return false;
  const v = value as BirthValue;
  return (
    typeof v.year === "number" &&
    typeof v.month === "number" &&
    typeof v.day === "number" &&
    typeof v.hour === "number"
  );
}

function readSaved(): Saved | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<Saved>;
    if (!isBirth(value.a) || !isBirth(value.b)) return null;
    if (!RELATIONS.includes(value.relation as Relation)) return null;
    return value as Saved;
  } catch {
    return null;
  }
}

export default function PairPage() {
  const router = useRouter();
  const [relation, setRelation] = useState<Relation>("couple");
  const [draftRel, setDraftRel] = useState<Relation>("couple");
  const [draftA, setDraftA] = useState<BirthValue>(DEFAULT_BIRTH);
  const [draftB, setDraftB] = useState<BirthValue>(DEFAULT_BIRTH);
  const [birthA, setBirthA] = useState<BirthValue | null>(null);
  const [birthB, setBirthB] = useState<BirthValue | null>(null);
  const [who, setWho] = useState<"a" | "b" | null>(null);
  const [relOpen, setRelOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [casting, setCasting] = useState(false);
  const [limitToastAt, setLimitToastAt] = useState(0);
  const [deviceId, setDeviceId] = useState("");
  const pending = useRef<Saved | null>(null);
  const autoA = useRef(false);
  const autoB = useRef(false);

  useEffect(() => {
    setDeviceId(getOrCreateDeviceId());
    const saved = readSaved();
    if (saved) {
      setRelation(saved.relation);
      setDraftA(saved.a);
      setDraftB(saved.b);
      setBirthA(saved.a);
      setBirthB(saved.b);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || birthA || autoA.current) return;
    autoA.current = true;
    if (remainingCasts() <= 0) return;
    setWho("a");
  }, [ready, birthA]);

  useEffect(() => {
    if (!ready || !birthA || birthB || autoB.current) return;
    autoB.current = true;
    if (remainingCasts() <= 0) return;
    setWho("b");
  }, [ready, birthA, birthB]);

  useEffect(() => {
    if (!limitToastAt) return;
    const timer = window.setTimeout(() => setLimitToastAt(0), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [limitToastAt]);

  const showCastLimit = () => setLimitToastAt(Date.now());

  const openWho = (next: "a" | "b") => {
    if (remainingCasts() <= 0) {
      showCastLimit();
      return;
    }
    setWho(next);
  };

  const persist = (next: Saved) => {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(next));
  };

  useEffect(() => {
    if (!birthA || !birthB) return;
    persist({ a: birthA, b: birthB, relation });
  }, [birthA, birthB, relation]);

  const finishCasting = useCallback(() => {
    const next = pending.current;
    pending.current = null;
    if (!next) {
      setCasting(false);
      return;
    }
    setBirthA(next.a);
    setBirthB(next.b);
    setRelation(next.relation);
    persist(next);
    setCasting(false);
  }, []);

  const catalog = products as Product[];

  const resultA = useMemo(() => {
    if (!birthA) return null;
    try {
      return calculateBazi(birthA);
    } catch {
      return null;
    }
  }, [birthA]);

  const resultB = useMemo(() => {
    if (!birthB) return null;
    try {
      return calculateBazi(birthB);
    } catch {
      return null;
    }
  }, [birthB]);

  const hepan = useMemo(() => {
    if (!resultA || !resultB) return null;
    return calculateHepan(resultA, resultB, relation);
  }, [resultA, resultB, relation]);

  const pairs = useMemo(() => {
    if (!resultA || !resultB || !hepan) return [];
    return recommendPairs(catalog, resultA, resultB, relation, hepan.bondElement, 3);
  }, [catalog, resultA, resultB, hepan, relation]);

  const radar = useMemo(() => {
    if (!resultA || !resultB) return [];
    return scoreHepanRadar(resultA, resultB, relation);
  }, [resultA, resultB, relation]);

  const complete = Boolean(hepan && resultA && resultB && !casting);

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

      <section className={styles.stage}>
        <div className={styles.duo}>
          <PersonSlot
            slotClass={styles.whoA}
            result={resultA}
            birth={birthA}
            onClick={() => openWho("a")}
          />
          <div className={styles.heartStage}>
            <Ripples side="left" />
            <div className={styles.heart}>
              <svg className={styles.heartSvg} viewBox="0 0 100 90" aria-hidden>
                <defs>
                  <linearGradient id="hepanHeart" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#e8a090" />
                    <stop offset="55%" stopColor="#c45a4c" />
                    <stop offset="100%" stopColor="#9a3b2f" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#hepanHeart)"
                  d="M50 84C22 64 6 48 6 30c0-12 9-20 20-20 8 0 15 4 24 14 9-10 16-14 24-14 11 0 20 8 20 20 0 18-16 34-44 54Z"
                />
              </svg>
              <span className={styles.scoreNum}>{hepan ? hepan.score : "—"}</span>
            </div>
            <Ripples side="right" />
          </div>
          <PersonSlot
            slotClass={styles.whoB}
            result={resultB}
            birth={birthB}
            onClick={() => openWho("b")}
          />
          <button
            type="button"
            className={styles.relPill}
            onClick={() => {
              setDraftRel(relation);
              setRelOpen(true);
            }}
          >
            {RELATION_LABEL[relation]}
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M13.2 6.2A5.4 5.4 0 0 0 4.1 5.1M2.8 3.2v3.2h3.2M2.8 9.8a5.4 5.4 0 0 0 9.1 1.1M13.2 12.8V9.6H10"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {!complete ? (
          <p className={styles.headline}>點選左右雙方，填入出生時間後即可合盤</p>
        ) : null}
      </section>

      {complete && hepan && resultA && resultB && (
        <>
          <section className={styles.plain}>
            <div className={styles.ornamentHead}>
              <OrnamentTitle size="lg">{hepan.verdict}</OrnamentTitle>
            </div>
            <HepanRadar axes={radar} />
            <button type="button" className={styles.q} onClick={() => setHelpOpen(true)} aria-label="說明">
              ?
            </button>
          </section>

          <PairProducts
            items={pairs}
            usefulLabel={hepanUsefulLabel(resultA, resultB, hepan.bondElement)}
            leftElement={resultA.dayMasterElement}
            rightElement={resultB.dayMasterElement}
          />
          {deviceId ? (
            <button
              type="button"
              className={styles.deviceFoot}
              onClick={() => {
                void navigator.clipboard.writeText(deviceId);
              }}
            >
              裝置號 {deviceId}
            </button>
          ) : null}
        </>
      )}

      {who && (
        <BirthPicker
          value={who === "a" ? draftA : draftB}
          onChange={who === "a" ? setDraftA : setDraftB}
          kicker={who === "a" ? "左側出生時間" : "右側出生時間"}
          confirmText="確認"
          onClose={() => setWho(null)}
          onConfirm={() => {
            const nextA = who === "a" ? draftA : birthA;
            const nextB = who === "b" ? draftB : birthB;
            setWho(null);
            if (who === "a" && !birthB) {
              setBirthA(draftA);
              return;
            }
            if (who === "b" && !birthA) {
              setBirthB(draftB);
              return;
            }
            if (!nextA || !nextB) return;
            if (!consumeCast()) {
              showCastLimit();
              return;
            }
            pending.current = { a: nextA, b: nextB, relation };
            setCasting(true);
          }}
        />
      )}

      {casting && (
        <CastingOverlay
          kicker="雙人對參"
          title="正在合盤"
          steps={PAIR_STEPS}
          onDone={finishCasting}
        />
      )}

      {relOpen && (
        <PhoneOverlay>
          <div className={styles.mask} onClick={() => setRelOpen(false)} role="presentation">
            <div className={styles.pop} onClick={(e) => e.stopPropagation()} role="dialog">
              <h3>選擇關係</h3>
              <div className={styles.relList}>
                {RELATIONS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={draftRel === id ? styles.relChoiceOn : styles.relChoice}
                    onClick={() => setDraftRel(id)}
                  >
                    {RELATION_LABEL[id]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={styles.relStart}
                onClick={() => {
                  setRelOpen(false);
                  if (!birthA || !birthB) {
                    setRelation(draftRel);
                    return;
                  }
                  if (!consumeCast()) {
                    showCastLimit();
                    return;
                  }
                  pending.current = { a: birthA, b: birthB, relation: draftRel };
                  setCasting(true);
                }}
              >
                開始合盤
              </button>
            </div>
          </div>
        </PhoneOverlay>
      )}

      {helpOpen && (
        <PhoneOverlay>
          <div className={styles.mask} onClick={() => setHelpOpen(false)} role="presentation">
            <div className={styles.pop} onClick={(e) => e.stopPropagation()} role="dialog">
              <p>
                合盤雷達依坊間常見作法：夫妻／戀人看日支夫妻宮的合沖與配偶星，朋友看比和與輕鬆度，合作看月支事業宮與喜用互補。五軸分數權重為固定設定，僅供飾品搭配與娛樂參考，請相信科學。
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

function Ripples({ side }: { side: "left" | "right" }) {
  return (
    <svg
      className={side === "left" ? styles.ripplesL : styles.ripplesR}
      viewBox="0 0 36 72"
      fill="none"
      aria-hidden
    >
      <path d="M34 10C22 18 16 28 16 36c0 8 6 18 18 26" stroke="#c9a08c" strokeWidth="1.1" />
      <path d="M26 16C18 22 14 29 14 36c0 7 4 14 12 20" stroke="#d4b4a4" strokeWidth="1" />
      <path d="M18 22C14 26 12 31 12 36c0 5 2 10 6 14" stroke="#e0c8bc" strokeWidth="0.9" />
    </svg>
  );
}

function PersonSlot({
  result,
  birth,
  onClick,
  slotClass,
}: {
  result: BaziResult | null;
  birth: BirthValue | null;
  onClick: () => void;
  slotClass: string;
}) {
  const theme = result ? WUXING_THEME[result.dayMasterElement] : null;
  return (
    <button type="button" className={`${styles.who} ${slotClass}`} onClick={onClick}>
      <span
        className={styles.elCircle}
        style={
          theme
            ? { background: theme.fill, borderColor: theme.stroke, color: theme.ink }
            : undefined
        }
      >
        {result ? WUXING_LABEL[result.dayMasterElement] : "?"}
      </span>
      <span className={styles.whoDate}>{birth ? formatBirthDay(birth) : "點此填寫"}</span>
    </button>
  );
}
