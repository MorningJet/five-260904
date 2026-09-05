import { WUXING_LABEL, WUXING_THEME, type Wuxing } from "@/lib/bazi/constants";
import type { BaziResult } from "@/lib/bazi/types";
import type { HepanResult } from "@/lib/hepan/engine";
import styles from "./WuxingChart.module.css";

const ORDER: Wuxing[] = ["fire", "earth", "metal", "water", "wood"];

const NODE_R = 22;
const CX = 180;
const CY = 128;
const RING = 82;
const STEP = (2 * Math.PI) / 5;
const START = -Math.PI / 2;

const GOD_LAYOUT: Record<
  Wuxing,
  { x: number; y: number; anchor: "start" | "middle" | "end" }
> = {
  fire: { x: 0, y: -28, anchor: "middle" },
  earth: { x: 32, y: -4, anchor: "start" },
  metal: { x: 32, y: 2, anchor: "start" },
  water: { x: -32, y: 2, anchor: "end" },
  wood: { x: -32, y: -4, anchor: "end" },
};

function nodeAngle(i: number) {
  return START + i * STEP;
}

function polar(i: number) {
  const a = nodeAngle(i);
  return { x: CX + RING * Math.cos(a), y: CY + RING * Math.sin(a) };
}

function along(
  from: { x: number; y: number },
  to: { x: number; y: number },
  dist: number,
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: from.x + (dx / len) * dist, y: from.y + (dy / len) * dist };
}

function mix(a: { x: number; y: number }, b: { x: number; y: number }, t: number) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

export default function DualWuxingChart({
  a,
  b,
  hepan,
}: {
  a: BaziResult;
  b: BaziResult;
  hepan: HepanResult;
}) {
  const nodes = ORDER.map((el, i) => ({ el, ...polar(i) }));

  return (
    <div className={styles.wrap}>
      <svg viewBox="0 0 360 232" className={styles.svg} role="img" aria-label="雙人合盤五行圖">
        <defs>
          <marker
            id="arrShengDual"
            viewBox="0 0 12 12"
            refX="10"
            refY="6"
            markerWidth="6.5"
            markerHeight="6.5"
            orient="auto"
          >
            <path d="M0 1.5 L12 6 L0 10.5 Z" fill="#7A4E2A" />
          </marker>
          <marker
            id="arrKeDual"
            viewBox="0 0 12 12"
            refX="10"
            refY="6"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0 2 L12 6 L0 10 Z" fill="#C2A07A" />
          </marker>
        </defs>

        <g
          opacity="0.42"
          fill="none"
          stroke="#E8D4A8"
          strokeWidth="1.35"
          strokeLinecap="round"
          transform="translate(180 128) scale(0.76) translate(-180 -190)"
        >
          <path d="M110 168c18-28 52-32 74-8 22-26 58-22 72 10" />
          <path d="M96 198c22-22 50-18 64 6 18-20 46-16 60 8" />
          <path d="M128 132c14-18 40-20 54-2 16-16 40-12 50 8" />
          <path d="M150 230c20-16 44-12 56 8 14-14 36-10 48 8" />
          <path d="M188 118c12-14 32-14 44 2 12-12 30-10 40 8" />
          <path d="M86 220c10-12 26-12 36 2 10-10 24-8 34 6" />
          <circle cx="180" cy="190" r="62" stroke="#EEDDBC" strokeWidth="0.7" />
        </g>

        <circle cx={CX} cy={CY} r="18" fill="#fffaf4" stroke="#d8a499" strokeWidth="1.1" />
        <text x={CX} y={CY + 5} textAnchor="middle" fill="#9a3b2f" className={styles.el}>
          {hepan.centerGlyph}
        </text>

        {nodes.map((from, i) => {
          const to = nodes[(i + 2) % nodes.length];
          const p0 = along(from, to, NODE_R + 2);
          const p1 = along(to, from, NODE_R + 14);
          const span = Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1;
          const gap = 12 / span;
          const aEnd = mix(p0, p1, 0.5 - gap);
          const bStart = mix(p0, p1, 0.5 + gap);
          const mid = mix(p0, p1, 0.5);
          return (
            <g key={`k-${from.el}`}>
              <line x1={p0.x} y1={p0.y} x2={aEnd.x} y2={aEnd.y} stroke="#C2A07A" strokeWidth="1.15" />
              <line
                x1={bStart.x}
                y1={bStart.y}
                x2={p1.x}
                y2={p1.y}
                stroke="#C2A07A"
                strokeWidth="1.15"
                markerEnd="url(#arrKeDual)"
              />
              <text x={mid.x} y={mid.y + 4} textAnchor="middle" className={styles.ke}>
                克
              </text>
            </g>
          );
        })}

        {nodes.map((n) => {
          const theme = WUXING_THEME[n.el];
          const pct = Math.round(hepan.combinedPercents[n.el]);
          const pctA = Math.round(a.percents[n.el]);
          const pctB = Math.round(b.percents[n.el]);
          const isA = n.el === a.dayMasterElement;
          const isB = n.el === b.dayMasterElement;
          const side = GOD_LAYOUT[n.el];
          return (
            <g key={n.el}>
              <circle
                cx={n.x}
                cy={n.y}
                r={NODE_R}
                fill={theme.fill}
                stroke={theme.stroke}
                strokeWidth="1.4"
              />
              <text x={n.x} y={n.y - 1} textAnchor="middle" fill={theme.ink} className={styles.el}>
                {WUXING_LABEL[n.el]}
              </text>
              <text x={n.x} y={n.y + 13} textAnchor="middle" fill={theme.ink} className={styles.pct}>
                {pct}%
              </text>
              {n.el === "fire" ? (
                <text
                  x={n.x + side.x}
                  y={n.y + side.y}
                  textAnchor={side.anchor}
                  fill={theme.ink}
                  className={styles.god}
                >
                  甲{pctA} 乙{pctB}
                </text>
              ) : (
                <>
                  <text
                    x={n.x + side.x}
                    y={n.y + side.y}
                    textAnchor={side.anchor}
                    fill={theme.ink}
                    className={styles.god}
                  >
                    甲{pctA}
                  </text>
                  <text
                    x={n.x + side.x}
                    y={n.y + side.y + 15}
                    textAnchor={side.anchor}
                    fill={theme.ink}
                    className={styles.god}
                  >
                    乙{pctB}
                  </text>
                </>
              )}
              {isA || isB ? (
                <g>
                  <rect
                    x={n.x - 16}
                    y={n.y + NODE_R - 7}
                    width="32"
                    height="15"
                    rx="7.5"
                    fill={theme.badge}
                  />
                  <text
                    x={n.x}
                    y={n.y + NODE_R + 3.5}
                    textAnchor="middle"
                    fill="#fff"
                    className={styles.ri}
                  >
                    {isA && isB ? "雙日" : isA ? "甲日" : "乙日"}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}

        {nodes.map((from, i) => {
          const a0 = nodeAngle(i);
          const pad = NODE_R / RING + 0.14;
          const startA = a0 + pad;
          const endA = a0 + STEP - pad;
          const x1 = CX + RING * Math.cos(startA);
          const y1 = CY + RING * Math.sin(startA);
          const x2 = CX + RING * Math.cos(endA);
          const y2 = CY + RING * Math.sin(endA);
          const midA = a0 + STEP / 2;
          const lx = CX + (RING + 13) * Math.cos(midA);
          const ly = CY + (RING + 13) * Math.sin(midA);
          return (
            <g key={`s-${from.el}`}>
              <path
                d={`M ${x1} ${y1} A ${RING} ${RING} 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke="#7A4E2A"
                strokeWidth="1.7"
                strokeLinecap="round"
                markerEnd="url(#arrShengDual)"
              />
              <text x={lx} y={ly + 4} textAnchor="middle" className={styles.sheng}>
                生
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
