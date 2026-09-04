import type { ReactNode } from "react";
import PhoneShell from "@/components/PhoneShell";
import "./layout.css";

export const metadata = {
  title: "五行沉香 · 喜用手串",
  description: "依出生時間排出八字、定五行喜用，並推薦沉香手串。",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PhoneShell>{children}</PhoneShell>
      </body>
    </html>
  );
}
