import type { Metadata } from "next";
import "./globals.css";
import { absoluteUrl, siteConfig } from "./site-config";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: "SpecPilot AI | 컴퓨터 구매 의사결정 에이전트",
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "SpecPilot AI | 컴퓨터 구매 의사결정 에이전트",
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    type: "website",
    images: ["/product-workbench.png"],
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpecPilot AI | 컴퓨터 구매 의사결정 에이전트",
    description: siteConfig.description,
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
