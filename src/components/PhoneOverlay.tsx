"use client";

import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";

const OverlayTarget = createContext<HTMLElement | null>(null);

export function PhoneOverlayProvider({
  target,
  children,
}: {
  target: HTMLElement | null;
  children: ReactNode;
}) {
  return <OverlayTarget.Provider value={target}>{children}</OverlayTarget.Provider>;
}

export function PhoneOverlay({ children }: { children: ReactNode }) {
  const target = useContext(OverlayTarget);
  if (!target) return null;
  return createPortal(children, target);
}
