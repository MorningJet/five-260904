export type DevicePreset = {
  id: string;
  name: string;
  width: number;
  height: number;
};

/** CSS 邏輯解析度（pt / CSS px），用於 PC 預覽畫框 */
export const DEVICE_PRESETS: DevicePreset[] = [
  { id: "iphone-17-pro-max", name: "iPhone 17 Pro Max", width: 440, height: 956 },
  { id: "iphone-17-pro", name: "iPhone 17 Pro", width: 402, height: 874 },
  { id: "iphone-17", name: "iPhone 17", width: 402, height: 874 },
  { id: "iphone-air", name: "iPhone Air", width: 420, height: 912 },
  { id: "iphone-16e", name: "iPhone 16e", width: 390, height: 844 },
  { id: "iphone-se", name: "iPhone SE", width: 375, height: 667 },
  { id: "pixel-9-pro", name: "Pixel 9 Pro", width: 412, height: 892 },
  { id: "galaxy-s25", name: "Galaxy S25", width: 360, height: 780 },
];

export const DEFAULT_DEVICE_ID = "iphone-17-pro-max";

export function getDevice(id: string): DevicePreset {
  return DEVICE_PRESETS.find((d) => d.id === id) ?? DEVICE_PRESETS[0];
}
