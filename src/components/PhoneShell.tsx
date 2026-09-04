"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getOrCreateDeviceId } from "@/lib/castQuota";
import { DEFAULT_DEVICE_ID, DEVICE_PRESETS, getDevice } from "@/lib/devices";
import { PhoneOverlayProvider } from "./PhoneOverlay";
import styles from "./PhoneShell.module.css";

const STORAGE_KEY = "five-preview-device";

export default function PhoneShell({ children }: { children: ReactNode }) {
  const [previewId, setPreviewId] = useState(DEFAULT_DEVICE_ID);
  const device = useMemo(() => getDevice(previewId), [previewId]);
  const [scale, setScale] = useState(1);
  const [appDeviceId, setAppDeviceId] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && DEVICE_PRESETS.some((d) => d.id === saved)) setPreviewId(saved);
    setAppDeviceId(getOrCreateDeviceId());
  }, []);

  useEffect(() => {
    const fit = () => {
      const native = window.matchMedia("(max-width: 700px), (hover: none) and (pointer: coarse) and (max-height: 500px)").matches
        || window.matchMedia("(hover: none) and (pointer: coarse) and (max-width: 900px)").matches;
      if (native) {
        setScale(1);
        return;
      }
      const padX = 48;
      const padY = 108;
      const next = Math.min(
        1,
        (window.innerWidth - padX) / (device.width + 24),
        (window.innerHeight - padY) / (device.height + 24),
      );
      setScale(Math.max(0.42, next));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [device.width, device.height]);

  const onDeviceChange = (id: string) => {
    setPreviewId(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  };

  const [overlayRoot, setOverlayRoot] = useState<HTMLDivElement | null>(null);

  return (
    <PhoneOverlayProvider target={overlayRoot}>
    <div className={styles.stage}>
      <div className={styles.toolbar}>
        <label htmlFor="device-select">預覽機型</label>
        <select
          id="device-select"
          value={previewId}
          onChange={(e) => onDeviceChange(e.target.value)}
        >
          {DEVICE_PRESETS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} · {d.width}×{d.height}
            </option>
          ))}
        </select>
        {appDeviceId ? (
          <button
            type="button"
            className={styles.idChip}
            onClick={() => {
              void navigator.clipboard.writeText(appDeviceId);
            }}
            title="點一下即可複製裝置編號"
          >
            裝置編號 {appDeviceId}
          </button>
        ) : null}
      </div>

      <div
        className={styles.scaleWrap}
        style={{
          width: device.width + 24,
          height: device.height + 24,
          transform: `scale(${scale})`,
        }}
      >
        <div className={styles.device}>
          <div className={styles.island} aria-hidden />
          <div className={styles.screen}>
            <div className={styles.scroll}>{children}</div>
            <div className={styles.overlayRoot} ref={setOverlayRoot} />
          </div>
        </div>
      </div>
    </div>
    </PhoneOverlayProvider>
  );
}
