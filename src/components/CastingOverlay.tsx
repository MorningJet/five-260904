"use client";

import { useEffect, useState } from "react";
import { PhoneOverlay } from "./PhoneOverlay";
import styles from "./CastingOverlay.module.css";

const DEFAULT_STEPS = [
  "正在推算生辰五行占比……",
  "加權評估月令氣候與氣勢輕重……",
  "納入干支合化與藏干能量……",
];

const STEP_MS = [1100, 1600, 1600];

export default function CastingOverlay({
  onDone,
  kicker = "五行推演",
  title = "正在排盤",
  steps = DEFAULT_STEPS,
}: {
  onDone: () => void;
  kicker?: string;
  title?: string;
  steps?: string[];
}) {
  const [shown, setShown] = useState(1);

  useEffect(() => {
    const wait = STEP_MS[shown - 1] ?? STEP_MS[STEP_MS.length - 1];
    if (shown < steps.length) {
      const timer = window.setTimeout(() => setShown((n) => n + 1), wait);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(onDone, wait);
    return () => window.clearTimeout(timer);
  }, [shown, onDone, steps.length]);

  return (
    <PhoneOverlay>
    <div className={styles.mask} role="status" aria-live="polite">
      <div className={styles.sheet}>
        <p className={styles.kicker}>{kicker}</p>
        <h2 className={styles.title}>{title}</h2>
        <ol className={styles.steps}>
          {steps.map((text, i) => {
            const active = i + 1 === shown;
            const done = i + 1 < shown;
            return (
              <li
                key={text}
                className={active ? styles.stepOn : done ? styles.stepDone : styles.step}
              >
                {text}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
    </PhoneOverlay>
  );
}
