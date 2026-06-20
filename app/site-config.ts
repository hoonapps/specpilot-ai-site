export const siteConfig = {
  name: "SpecPilot AI",
  shortName: "SpecPilot",
  description:
    "컴퓨터와 노트북 구매 조건을 분석해 추천, 구매 판정, 가격 타이밍, 결제 전 검수까지 정리하는 AI 의사결정 에이전트입니다.",
  keywords: [
    "컴퓨터 구매",
    "노트북 추천",
    "PC 견적",
    "컴퓨터 견적",
    "구매 의사결정",
    "가격 타이밍",
    "결제 전 검수",
    "SpecPilot AI",
  ],
};

export function siteUrl() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const url = configured || "https://specpilot-ai-site.vercel.app";
  return url.replace(/\/+$/, "");
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${normalizedPath}`;
}
