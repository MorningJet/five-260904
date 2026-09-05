import type { CSSProperties } from "react";
import { AxisGlyph } from "@/components/FlatIcons";
import { AXIS_ICON, AXIS_ICON_FALLBACK } from "@/lib/hepan/axisIcons";
import type { RadarAxis } from "@/lib/hepan/radar";
import styles from "./HepanRadar.module.css";

const CX = 180;
const CY = 148;
const RING = 88;
const START = -Math.PI / 2;

function pt(i: number, n: number, r: number) {
  const a = START + (i * 2 * Math.PI) / n;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

function badgeStyle(i: number, n: number): CSSProperties {
  const a = START + (i * 2 * Math.PI) / n;
  const x = 50 + 34 * Math.cos(a);
  const y = 50 + 38 * Math.sin(a);
  return { left: `${x}%`, top: `${y}%` };
}

export default function HepanRadar({ axes }: { axes: RadarAxis[] }) {
  const n = axes.length;
  const rings = [0.25, 0.5, 0.75, 1];
  const valuePts = axes.map((axis, i) => pt(i, n, (axis.score / 100) * RING));

  return (
    <div className={styles.wrap}>
      <svg viewBox="0 20 360 256" className={styles.svg} role="img" aria-label="合盤雷達圖">
        {rings.map((t) => {
          const pts = axes.map((_, i) => pt(i, n, RING * t));
          return (
            <polygon
              key={t}
              points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
              fill={t === 1 ? "rgba(255,248,240,0.6)" : "none"}
              stroke={t === 1 ? "#d4b49a" : "#ead9c2"}
              strokeWidth={t === 1 ? 1.4 : 0.85}
              strokeDasharray={t === 1 ? undefined : "3.5 3.5"}
            />
          );
        })}
        {axes.map((_, i) => {
          const end = pt(i, n, RING);
          return (
            <line
              key={`spoke-${i}`}
              x1={CX}
              y1={CY}
              x2={end.x}
              y2={end.y}
              stroke="#ead9c2"
              strokeWidth="0.9"
            />
          );
        })}
        <polygon
          points={valuePts.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="rgba(196, 92, 106, 0.22)"
          stroke="#c45c6a"
          strokeWidth="1.8"
        />
        {valuePts.map((p, i) => (
          <circle key={`dot-${i}`} cx={p.x} cy={p.y} r="4" fill="#7ec8c8" stroke="#fff" strokeWidth="1.4" />
        ))}
      </svg>
      <div className={styles.badges}>
        {axes.map((axis, i) => {
          const icon = AXIS_ICON[axis.label] ?? AXIS_ICON_FALLBACK;
          return (
            <div key={axis.key} className={styles.badge} style={badgeStyle(i, n)}>
              <AxisGlyph kind={icon.kind} color={icon.color} className={styles.icon} />
              <span className={styles.caption} style={{ color: icon.color }}>
                {axis.label}
                <b>{axis.score}</b>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
