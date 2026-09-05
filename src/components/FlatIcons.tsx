import type { SVGProps } from "react";

const DOTS = ["#62A572", "#E06A55", "#C49655", "#E8A33A", "#5B90B0"] as const;

function Svg({ children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden {...rest}>
      {children}
    </svg>
  );
}

function Luopan({
  cx,
  cy,
  scale,
  start = -Math.PI / 2,
}: {
  cx: number;
  cy: number;
  scale: number;
  start?: number;
}) {
  const outer = 18.5 * scale;
  const inner = 13.5 * scale;
  const bead = 5.2 * scale;
  const orbit = 15.2 * scale;
  const dotR = 2.4 * scale;
  const hi = 1.5 * scale;
  return (
    <g>
      <circle cx={cx} cy={cy} r={outer} stroke="#C4A06A" strokeWidth="1.25" />
      <circle cx={cx} cy={cy} r={inner} stroke="#E2C9A0" strokeWidth="1" />
      {DOTS.map((fill, i) => {
        const a = start + (i * 2 * Math.PI) / 5;
        return <circle key={fill} cx={cx + orbit * Math.cos(a)} cy={cy + orbit * Math.sin(a)} r={dotR} fill={fill} />;
      })}
      <circle cx={cx} cy={cy} r={bead} fill="#6B3D2A" />
      <circle cx={cx - hi * 0.9} cy={cy - hi * 0.9} r={hi} fill="#E8D2B0" opacity="0.55" />
    </g>
  );
}

/** 單人排盤：平面羅盤＋五行點＋沉香珠 */
export function FeatCastIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <Luopan cx={24} cy={24} scale={1} />
    </Svg>
  );
}

/** 雙人合盤：兩枚同一套羅盤相疊對參 */
export function FeatPairIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <Luopan cx={15.4} cy={25.4} scale={0.74} start={-Math.PI / 2 - 0.22} />
      <Luopan cx={32.4} cy={22.4} scale={0.74} start={-Math.PI / 2 + 0.28} />
    </Svg>
  );
}
