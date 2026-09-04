"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { clampDay, daysInMonth } from "@/lib/date";
import { PhoneOverlay } from "./PhoneOverlay";
import styles from "./BirthPicker.module.css";

export type BirthValue = {
  year: number;
  month: number;
  day: number;
  hour: number;
};

const YEARS = Array.from({ length: 2026 - 1936 + 1 }, (_, i) => 2026 - i);
const HOURS = Array.from({ length: 24 }, (_, i) => i);

type Props = {
  value: BirthValue;
  onChange: (next: BirthValue) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export default function BirthPicker({ value, onChange, onConfirm, onClose }: Props) {
  const days = daysInMonth(value.year, value.month);
  const set = (patch: Partial<BirthValue>) => {
    const next = { ...value, ...patch };
    next.day = clampDay(next.year, next.month, next.day);
    onChange(next);
  };

  const summary = `${value.year}年${value.month}月${value.day}日${value.hour}時`;
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const dayList = useMemo(() => Array.from({ length: days }, (_, i) => i + 1), [days]);

  return (
    <PhoneOverlay>
    <div className={styles.mask} onClick={onClose} role="presentation">
      <div
        className={styles.sheet}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="birth-title"
      >
        <p className={styles.kicker}>請輸入出生時間</p>
        <h2 id="birth-title" className={styles.title}>
          {summary}
        </h2>

        <div className={styles.wheels}>
          <Wheel
            label="年"
            options={YEARS.map((y) => ({ value: y, text: `${y}年` }))}
            selected={value.year}
            onSelect={(year) => set({ year })}
          />
          <Wheel
            label="月"
            options={months.map((m) => ({ value: m, text: `${m}月` }))}
            selected={value.month}
            onSelect={(month) => set({ month })}
          />
          <Wheel
            label="日"
            options={dayList.map((d) => ({ value: d, text: `${d}日` }))}
            selected={value.day}
            onSelect={(day) => set({ day })}
          />
          <Wheel
            label="時"
            options={HOURS.map((h) => ({ value: h, text: `${h}時` }))}
            selected={value.hour}
            onSelect={(hour) => set({ hour })}
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.ghost} onClick={onClose}>
            取消
          </button>
          <button type="button" className={styles.solid} onClick={onConfirm}>
            開始排盤
          </button>
        </div>
      </div>
    </div>
    </PhoneOverlay>
  );
}

function Wheel({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { value: number; text: string }[];
  selected: number;
  onSelect: (v: number) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  // Only snap to the current value when the column first mounts or its length
  // changes (e.g. 31 → 28 days). Re-centering on every tap fights iOS focus
  // scrolling and makes the highlight jump off-screen.
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const el = wrap?.querySelector("[data-selected='true']") as HTMLElement | null;
    if (!wrap || !el) return;
    const top =
      el.getBoundingClientRect().top - wrap.getBoundingClientRect().top + wrap.scrollTop;
    wrap.scrollTop = top - wrap.clientHeight / 2 + el.clientHeight / 2;
  }, [options.length]);

  return (
    <div className={styles.wheelCol}>
      <span className={styles.wheelLabel}>{label}</span>
      <div className={styles.wheel} ref={wrapRef}>
        {options.map((opt) => (
          <button
            key={`${label}-${opt.value}`}
            type="button"
            data-selected={opt.value === selected}
            className={opt.value === selected ? styles.optOn : styles.opt}
            onPointerDown={(e) => {
              e.preventDefault();
              onSelect(opt.value);
            }}
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
