import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Coins,
  Compass,
  Flame,
  GitMerge,
  HandHelping,
  Heart,
  HeartHandshake,
  Hourglass,
  Infinity as InfinityIcon,
  MessageCircle,
  Mountain,
  ShieldCheck,
  Smile,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import type { AxisIconName } from "@/lib/hepan/axisIcons";

const ICONS: Record<AxisIconName, LucideIcon> = {
  heart: Heart,
  sparkles: Sparkles,
  shield: ShieldCheck,
  mountain: Mountain,
  chat: MessageCircle,
  helping: HandHelping,
  badge: BadgeCheck,
  users: Users,
  flame: Flame,
  zap: Zap,
  handshake: HeartHandshake,
  hourglass: Hourglass,
  infinity: InfinityIcon,
  compass: Compass,
  smile: Smile,
  merge: GitMerge,
  coins: Coins,
};

export default function RadarAxisIcon({
  name,
  color,
  className,
}: {
  name: AxisIconName;
  color: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Sparkles;
  return (
    <Icon
      className={className}
      color={color}
      fill={color}
      fillOpacity={0.22}
      strokeWidth={2.1}
      absoluteStrokeWidth
      aria-hidden
    />
  );
}
