export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function clampDay(year: number, month: number, day: number): number {
  return Math.min(day, daysInMonth(year, month));
}

export function formatBirthDay(value: { year: number; month: number; day: number }): string {
  return `${value.year}年${value.month}月${value.day}日`;
}

export function formatPrice(n: number): string {
  return `NT$${n.toLocaleString("zh-TW")}`;
}
