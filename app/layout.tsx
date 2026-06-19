import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://specpilot-ai-site.vercel.app"),
  title: "SpecPilot AI | 컴퓨터 구매 의사결정 에이전트",
  description:
    "데스크톱 PC와 노트북 구매 조건을 분석해 추천, 구매 판정, 가격 타이밍, 공유 브리프를 제공합니다.",
  openGraph: {
    title: "SpecPilot AI",
    description:
      "컴퓨터 견적과 노트북 구매를 위한 AI 의사결정 에이전트",
    type: "website",
    images: ["/product-workbench.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
