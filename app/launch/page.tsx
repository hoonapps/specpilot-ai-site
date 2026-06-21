import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { absoluteUrl, siteConfig } from "../site-config";
import { LaunchQuestionAnswer } from "./LaunchQuestionAnswer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SpecPilot AI | 컴퓨터·노트북 구매 질문 답변",
  description:
    "컴퓨터와 노트북 구매 질문을 입력하면 결제 가능 여부, 위험 신호, 추가 확인 증거를 바로 답변하는 AI 구매 의사결정 데모입니다.",
  keywords: [
    ...siteConfig.keywords,
    "컴퓨터 구매 질문",
    "노트북 구매 질문",
    "견적 검수",
    "구매 답변 AI",
  ],
  alternates: {
    canonical: "/launch",
  },
  openGraph: {
    title: "SpecPilot AI - 구매 질문에 바로 답하는 AI",
    description:
      "컴퓨터와 노트북 견적, 상품 정보, 최종가를 붙여 넣으면 지금 결제해도 되는지 답변합니다.",
    url: "/launch",
    images: [
      {
        url: "/launch/opengraph-image",
        width: 1200,
        height: 630,
        alt: "SpecPilot AI 구매 질문 답변 데모",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpecPilot AI - 구매 질문 답변",
    description: "컴퓨터와 노트북 견적을 붙여 넣고 구매 가능 여부를 바로 확인하세요.",
    images: ["/launch/twitter-image"],
  },
};

export default function LaunchPage() {
  const launchStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "ShoppingApplication",
    operatingSystem: "Web",
    url: absoluteUrl("/launch"),
    image: absoluteUrl("/product-workbench.png"),
    description:
      "컴퓨터와 노트북 구매 질문을 입력하면 결제 가능 여부, 위험 신호, 추가 확인 증거를 답변하는 AI 구매 의사결정 데모입니다.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
      availability: "https://schema.org/InStock",
    },
    audience: {
      "@type": "Audience",
      audienceType: "컴퓨터와 노트북 구매자",
    },
    featureList: [
      "구매 질문 답변",
      "최종가와 조건 리스크 확인",
      "증거 요청과 커뮤니티 답변 생성",
      "기능별 구매 의사결정 도구 분리",
    ],
  };

  return (
    <main className="answerFirstPage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(launchStructuredData),
        }}
      />
      <nav className="answerTopbar" aria-label="SpecPilot launch navigation">
        <Link className="answerBrand" href="/">
          <span>SP</span>
          <strong>SpecPilot AI</strong>
        </Link>
        <div>
          <Link href="/launch/guide">사용법</Link>
        </div>
      </nav>

      <section className="answerHero">
        <div className="answerHeroCopy">
          <span className="answerEyebrow">PC · Laptop purchase decision agent</span>
          <h1>컴퓨터 구매 질문에 답부터 주는 AI</h1>
          <p>
            사용자가 보고 싶은 건 수십 개 기능이 아니라 “이거 사도 되는지”입니다.
            SpecPilot AI는 견적, 상품 문구, 최종가, 리뷰 리스크를 받아 결제 가능 여부와
            추가 확인 증거를 먼저 답합니다.
          </p>
          <div className="answerHeroActions">
            <a className="answerPrimaryLink" href="#ask">
              질문 입력하기
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <div className="answerHeroProof">
          <div>
            <ShieldCheck size={18} />
            <strong>결제 전 안전성</strong>
            <span>최종가, 옵션명, AS/반품 조건을 먼저 확인</span>
          </div>
          <div>
            <BookOpen size={18} />
            <strong>답변 근거</strong>
            <span>리스크와 추가 증거를 답변 안에 같이 표시</span>
          </div>
        </div>
      </section>

      <LaunchQuestionAnswer />

      <section className="answerPortfolio">
        <div>
          <span className="answerEyebrow">What this project proves</span>
          <h2>이력서에 도움이 되려면 기능 수보다 판단 구조가 보여야 합니다.</h2>
        </div>
        <div className="answerPortfolioGrid">
          <article>
            <strong>제품 판단</strong>
            <p>최저가 검색이 아니라 구매 실패를 줄이는 문제로 좁혔습니다.</p>
          </article>
          <article>
            <strong>실행 구조</strong>
            <p>FastAPI 제품 API, Next.js 프론트, 공개 프록시, 검증 스크립트를 분리했습니다.</p>
          </article>
          <article>
            <strong>출시 품질</strong>
            <p>CI, 시각 회귀, 메타 검수, PDF 기획서, 한글 README까지 관리합니다.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
