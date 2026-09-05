"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import styles from "./BannerCarousel.module.css";

const SLIDES = [
  {
    src: "/shop/banner-intro.jpg",
    alt: "五行沉香手串實拍",
    tone: "dark" as const,
    kicker: "五行沉香",
    title: "依八字喜用，配一串沉香",
    hint: "選香 · 排盤 · 把五行收在腕上",
  },
  {
    src: "/shop/banner-promo.jpg",
    alt: "沉香手串實拍",
    tone: "light" as const,
    kicker: "新店開業",
    title: "全場免運費",
    hint: "沉香入腕 · 免運直達",
  },
];

const INTERVAL_MS = 4500;
const SWIPE_PX = 40;

export default function BannerCarousel() {
  const n = SLIDES.length;
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const paused = useRef(false);
  const dragging = useRef(false);
  const startX = useRef(0);

  const go = useCallback((next: number) => {
    setAnimate(true);
    setIndex(next);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (paused.current || dragging.current) return;
      go(index + 1);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [go, index]);

  const onTransitionEnd = () => {
    if (index < n && index >= 0) return;
    setAnimate(false);
    setIndex(index >= n ? 0 : n - 1);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    paused.current = true;
    startX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    paused.current = false;
    const dx = e.clientX - startX.current;
    if (dx <= -SWIPE_PX) go(index + 1);
    else if (dx >= SWIPE_PX) go(index - 1);
  };

  const visual = ((index % n) + n) % n;
  const loopSlides = [SLIDES[n - 1], ...SLIDES, SLIDES[0]];
  const offset = index + 1;

  return (
    <section
      className={styles.wrap}
      aria-roledescription="carousel"
      aria-label="店面宣傳"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") paused.current = true;
      }}
      onPointerLeave={() => {
        paused.current = false;
      }}
    >
      <div
        className={styles.viewport}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className={`${styles.track} ${animate ? styles.anim : ""}`}
          style={{ transform: `translateX(-${offset * 100}%)` }}
          onTransitionEnd={onTransitionEnd}
        >
          {loopSlides.map((slide, i) => (
            <article key={`${slide.src}-${i}`} className={styles.slide}>
              <img className={styles.img} src={slide.src} alt={slide.alt} draggable={false} />
              <div className={`${styles.copy} ${styles[slide.tone]}`}>
                <p className={styles.kicker}>{slide.kicker}</p>
                <p className={styles.title}>{slide.title}</p>
                <p className={styles.hint}>{slide.hint}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className={styles.dots} role="tablist" aria-label="宣傳圖切換">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            className={`${styles.dot} ${i === visual ? styles.dotOn : ""}`}
            aria-selected={i === visual}
            aria-label={`第 ${i + 1} 張`}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </section>
  );
}
