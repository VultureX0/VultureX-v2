import {
  Factory,
  Handshake,
  Leaf,
  Lightbulb,
  Megaphone,
  Rocket,
  ShieldAlert,
  Sparkles,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { HubIconKey } from "@/lib/knowledge-hub";

const HUB_ICONS: Record<HubIconKey, LucideIcon> = {
  sparkles: Sparkles,
  rocket: Rocket,
  factory: Factory,
  wallet: Wallet,
  megaphone: Megaphone,
  wrench: Wrench,
  lightbulb: Lightbulb,
  leaf: Leaf,
  shield: ShieldAlert,
  users: Users,
  handshake: Handshake,
};

export function HubIcon({
  name,
  size = 16,
  className = "",
}: {
  name: HubIconKey;
  size?: number;
  className?: string;
}) {
  const Icon = HUB_ICONS[name];
  return <Icon size={size} className={className} aria-hidden="true" />;
}
