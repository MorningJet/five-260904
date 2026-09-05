import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { color?: string };

function Svg({ children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden {...rest}>
      {children}
    </svg>
  );
}

/** 單人排盤：平面羅盤＋五行點＋沉香珠 */
export function FeatCastIcon(props: SVGProps<SVGSVGElement>) {
  const dots = [
    { cx: 24, cy: 9, fill: "#62A572" },
    { cx: 37.5, cy: 18.5, fill: "#E06A55" },
    { cx: 33.5, cy: 35.5, fill: "#C49655" },
    { cx: 14.5, cy: 35.5, fill: "#E8A33A" },
    { cx: 10.5, cy: 18.5, fill: "#5B90B0" },
  ];
  return (
    <Svg {...props}>
      <circle cx="24" cy="24" r="18.5" stroke="#C4A06A" strokeWidth="1.4" />
      <circle cx="24" cy="24" r="13.5" stroke="#E2C9A0" strokeWidth="1.1" />
      {dots.map((d) => (
        <circle key={`${d.cx}-${d.cy}`} cx={d.cx} cy={d.cy} r="2.4" fill={d.fill} />
      ))}
      <circle cx="24" cy="24" r="5.2" fill="#6B3D2A" />
      <circle cx="22.6" cy="22.6" r="1.5" fill="#E8D2B0" opacity="0.55" />
    </Svg>
  );
}

/** 雙人合盤：兩枚平面心形相疊 */
export function FeatPairIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path
        d="M16.2 14.2c-3.4 0-6 2.7-6 6.1 0 6.4 7.4 11.2 13.8 15.2 6.4-4 13.8-8.8 13.8-15.2 0-3.4-2.6-6.1-6-6.1-2.1 0-4 .9-5.2 2.5-1.2-1.6-3.1-2.5-5.2-2.5Z"
        fill="#F3C7C0"
        stroke="#C45C6A"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M28.6 16.4c-2.6 0-4.6 2-4.6 4.6 0 4.9 5.6 8.6 10.4 11.6 4.8-3 10.4-6.7 10.4-11.6 0-2.6-2-4.6-4.6-4.6-1.6 0-3 .7-3.9 1.9-.9-1.2-2.3-1.9-3.9-1.9Z"
        fill="#9A3B2F"
        stroke="#9A3B2F"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HeartGlyph({ color = "#C45C6A", ...props }: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M24 40.2C16.6 35.4 10 29.6 10 22.6 10 18.2 13.4 15 17.6 15c2.4 0 4.6 1.1 6.4 3 1.8-1.9 4-3 6.4-3C34.6 15 38 18.2 38 22.6c0 7-6.6 12.8-14 17.6Z"
        fill={`${color}33`}
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ShieldGlyph({ color = "#7A6AA8", ...props }: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M24 8.5 38 13.2v11.2c0 8.2-6.4 13.6-14 16.1-7.6-2.5-14-7.9-14-16.1V13.2L24 8.5Z"
        fill={`${color}28`}
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M24 18v12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M18.5 24h11" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

function ChatGlyph({ color = "#C47A5A", ...props }: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M12 13.5h24a4 4 0 0 1 4 4v13a4 4 0 0 1-4 4H22l-7.5 6v-6H12a4 4 0 0 1-4-4v-13a4 4 0 0 1 4-4Z"
        fill={`${color}28`}
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="24" r="1.7" fill={color} />
      <circle cx="24" cy="24" r="1.7" fill={color} />
      <circle cx="30" cy="24" r="1.7" fill={color} />
    </Svg>
  );
}

function HandsGlyph({ color = "#3D8A8A", ...props }: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M11 22.5c0-2 1.6-3.6 3.6-3.6h6.2c.8 0 1.5.7 1.5 1.5v11.2c0 1.6-1.3 2.9-2.9 2.9h-2.2c-3.4 0-6.2-2.8-6.2-6.2v-5.8Z"
        fill={`${color}28`}
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M37 22.5c0-2-1.6-3.6-3.6-3.6h-6.2c-.8 0-1.5.7-1.5 1.5v11.2c0 1.6 1.3 2.9 2.9 2.9h2.2c3.4 0 6.2-2.8 6.2-6.2v-5.8Z"
        fill={`${color}28`}
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M20.5 21.2h7" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

function FlameGlyph({ color = "#D06A3A", ...props }: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M24 8.5c2.4 6.2-3.4 8.8-2.2 14.2 3.6-2.2 6.2-6.6 8.8-5.2 1.8 6.6-2 12.4-6.6 16.2-4.6-3.8-8.4-9.6-6.6-16.2 2.8-1.2 5.2 2.2 6.6-9Z"
        fill={`${color}33`}
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HugGlyph({ color = "#B06A8A", ...props }: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="18.5" cy="16" r="4.2" fill={`${color}28`} stroke={color} strokeWidth="1.6" />
      <circle cx="29.5" cy="16" r="4.2" fill={`${color}28`} stroke={color} strokeWidth="1.6" />
      <path
        d="M10.5 34.5c1.2-6.4 5.4-9.6 11.2-9.6h4.6c5.8 0 10 3.2 11.2 9.6"
        fill={`${color}22`}
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ClockGlyph({ color = "#9A3B2F", ...props }: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="24" cy="24" r="14.5" fill={`${color}18`} stroke={color} strokeWidth="1.7" />
      <path d="M24 15.5V24l7 4.2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="1.6" fill={color} />
    </Svg>
  );
}

function StarGlyph({ color = "#C49A3A", ...props }: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M24 9.5 27.8 19l10.2 1.1-7.6 6.8 2.2 10.1L24 32.2 15.4 37l2.2-10.1-7.6-6.8L20.2 19 24 9.5Z"
        fill={`${color}33`}
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PuzzleGlyph({ color = "#6A8F5A", ...props }: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M14 16.5h7.2c0-3.2 2.4-5.2 4.8-5.2s4.8 2 4.8 5.2H38c1 0 1.8.8 1.8 1.8v7.2c-3.2 0-5.2 2.4-5.2 4.8s2 4.8 5.2 4.8v7.2c0 1-.8 1.8-1.8 1.8H26.8c0-3.2-2.4-5.2-4.8-5.2s-4.8 2-4.8 5.2H14c-1 0-1.8-.8-1.8-1.8V30.1c3.2 0 5.2-2.4 5.2-4.8s-2-4.8-5.2-4.8V18.3c0-1 .8-1.8 1.8-1.8Z"
        fill={`${color}28`}
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CoinGlyph({ color = "#B08948", ...props }: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="24" cy="24" r="14.5" fill={`${color}22`} stroke={color} strokeWidth="1.7" />
      <circle cx="24" cy="24" r="9.2" stroke={color} strokeWidth="1.3" />
      <path d="M24 17.5v13M19 21.2h10M19 26.8h10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

const GLYPHS = {
  heart: HeartGlyph,
  shield: ShieldGlyph,
  chat: ChatGlyph,
  hands: HandsGlyph,
  flame: FlameGlyph,
  hug: HugGlyph,
  clock: ClockGlyph,
  star: StarGlyph,
  puzzle: PuzzleGlyph,
  coin: CoinGlyph,
} as const;

export type AxisGlyphKind = keyof typeof GLYPHS;

export function AxisGlyph({ kind, color, ...props }: IconProps & { kind: AxisGlyphKind }) {
  const Glyph = GLYPHS[kind] ?? StarGlyph;
  return <Glyph color={color} {...props} />;
}
