import type { Metadata } from "next";
import {
  BarChart3,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getJson } from "../../api/specpilot/_client";
import { siteConfig } from "../../site-config";
import type { Category, PublicCategoryMarketReport } from "../../types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    category: string;
  }>;
};

const categoryBySlug: Record<string, Category> = {
  "desktop-pc": "desktop_pc",
  laptop: "laptop",
};

function won(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "확인 필요";
  }
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
}

function statusTone(status: string | undefined) {
  if (status === "ok") {
    return "ok";
  }
  if (status === "blocker") {
    return "danger";
  }
  return "warn";
}

async function loadMarketReport(slug: string) {
  const category = categoryBySlug[slug];
  if (!category) {
    notFound();
  }
  try {
    return await getJson<PublicCategoryMarketReport>(
      `/public/market/category-reports/${encodeURIComponent(category)}`,
    );
  } catch {
    notFound();
  }
}

export async function generateStaticParams() {
  return [{ category: "desktop-pc" }, { category: "laptop" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const page = await loadMarketReport(category);

  return {
    title: `${page.title} | SpecPilot AI`,
    description: page.description,
    keywords: [...siteConfig.keywords, ...page.seo_keywords],
    alternates: {
      canonical: page.canonical_path,
    },
    openGraph: {
      title: page.title,
      description: page.share_text,
      type: "article",
      url: page.canonical_path,
      images: ["/product-workbench.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.share_text,
      images: ["/product-workbench.png"],
    },
  };
}

export default async function PublicMarketReportPage({ params }: PageProps) {
  const { category } = await params;
  const page = await loadMarketReport(category);
  const report = page.report;
  const leadPick = report.picks[0];

  return (
    <main className="publicReport">
      <header className="publicHero">
        <div>
          <a className="brand compactBrand" href="/">
            <span className="brandMark">SP</span>
            <span>
              <strong>SpecPilot AI</strong>
              <span>Monthly market report</span>
            </span>
          </a>
          <p className="sectionLabel">공개 월간 구매 리포트</p>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
          <div className="statusRow">
            <span className="pill ok">{report.report_month}</span>
            <span className="pill muted">{report.total_candidates}개 후보</span>
            <span className="pill muted">{page.slug}</span>
          </div>
        </div>
        <aside className="publicHeroCard">
          <span>이번 달 우선 추천</span>
          <strong>{leadPick?.model_name || "추천 후보 확인 필요"}</strong>
          <p>{leadPick?.benchmark_summary || report.summary}</p>
          <div className="priceBlock">
            <span>실구매가</span>
            <strong>{won(leadPick?.effective_price_krw)}</strong>
          </div>
        </aside>
      </header>

      <section className="publicGrid">
        <article className="publicPanel">
          <div className="sectionLabel">
            <ShieldCheck size={16} />
            리포트 요약
          </div>
          <h2>{report.headline}</h2>
          <p>{report.summary}</p>
          <dl className="sourceMetricGrid">
            <div>
              <dt>분석 후보</dt>
              <dd>{report.total_candidates}개</dd>
            </div>
            <div>
              <dt>구매 결과</dt>
              <dd>{report.workspace_signals.purchase_outcomes}</dd>
            </div>
            <div>
              <dt>구매 의향</dt>
              <dd>
                {Math.round(Number(report.workspace_signals.purchase_intent_rate) * 100)}
                %
              </dd>
            </div>
          </dl>
        </article>

        <article className="publicPanel">
          <div className="sectionLabel">
            <CheckCircle2 size={16} />
            바로 실행할 액션
          </div>
          <h2>내 조건으로 다시 좁히기</h2>
          <ul>
            {page.cta_cards.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <a className="miniCta" href="/#analysis">
            내 조건 분석하기 <ExternalLink size={14} />
          </a>
        </article>
      </section>

      <section className="publicSection">
        <div className="sectionHeader">
          <div>
            <p className="sectionLabel">추천 픽</p>
            <h2>가격대와 리스크를 같이 보고 고릅니다</h2>
          </div>
        </div>
        <div className="cards three publicCards">
          {report.picks.slice(0, 6).map((pick) => (
            <article className="card" key={pick.product_id}>
              <span className={`pill ${statusTone(pick.risk_status)}`}>
                {pick.role_label}
              </span>
              <h3>{pick.model_name}</h3>
              <p>{pick.benchmark_summary}</p>
              <div className="cardFooter">
                <strong>{won(pick.effective_price_krw)}</strong>
                <span>{pick.price_band}</span>
              </div>
              <ul>
                {[...pick.reasons, ...pick.watchouts].slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="publicGrid">
        <article className="publicPanel">
          <div className="sectionLabel">
            <BarChart3 size={16} />
            가격 구간
          </div>
          <h2>예산을 먼저 정리합니다</h2>
          <ul>
            {report.price_segments.map((segment) => (
              <li key={`${segment.category}-${segment.label}`}>
                {segment.label}: {won(segment.min_price_krw)} -{" "}
                {won(segment.max_price_krw)} · 권장 {won(segment.recommended_budget_krw)}
              </li>
            ))}
          </ul>
        </article>

        <article className="publicPanel">
          <div className="sectionLabel">
            <TimerReset size={16} />
            공개 전 체크리스트
          </div>
          <h2>가격과 신뢰 리스크를 다시 확인합니다</h2>
          <ul>
            {report.publishing_checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="publicSection">
        <div className="sectionHeader">
          <div>
            <p className="sectionLabel">리스크 신호</p>
            <h2>구매 전에 놓치기 쉬운 조건을 먼저 봅니다</h2>
          </div>
        </div>
        <div className="publicGrid">
          {report.risk_signals.map((signal) => (
            <article className="publicPanel" key={signal.title}>
              <div className="answerHeader">
                <span className={`pill ${statusTone(signal.status)}`}>
                  {signal.status}
                </span>
                <span className="pill muted">
                  {signal.affected_product_ids.length}개 영향
                </span>
              </div>
              <h2>{signal.title}</h2>
              <p>{signal.evidence}</p>
              <p>{signal.action}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="publicSection">
        <div className="sectionHeader">
          <div>
            <p className="sectionLabel">시장 신호</p>
            <h2>이번 달 구매 판단에 반영할 흐름</h2>
          </div>
        </div>
        <div className="scenarioGrid publicCards">
          {report.trend_cards.map((trend) => (
            <article className="scenarioCard" key={trend.title}>
              <span className="rank">{trend.category || "workspace"}</span>
              <h3>{trend.title}</h3>
              <p>{trend.signal}</p>
              <small>{trend.recommendation}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
