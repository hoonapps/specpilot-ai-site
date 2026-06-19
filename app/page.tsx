"use client";

import Image from "next/image";
import {
  Activity,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Cpu,
  ExternalLink,
  Gauge,
  Laptop,
  Loader2,
  Monitor,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type Category = "desktop_pc" | "laptop";

type AnalyzePayload = {
  query: string;
  category: Category;
  budget_krw: number;
  purpose: string;
  must_haves: string[];
  exclusions: string[];
  channels: string[];
};

type Recommendation = {
  rank: number;
  product: {
    id: string;
    model_name: string;
    option_summary: string;
  };
  price: {
    effective_price_krw: number;
  };
  score: {
    total_score: number;
    compatibility: number;
  };
  fit_summary: string;
};

type DealWindow = {
  product_id: string;
  model_name: string;
  label: string;
  status: "ok" | "warning" | "blocker";
  current_price_krw: number;
  target_price_krw: number;
  fair_price_band_krw: string;
  urgency: string;
  volatility_risk: string;
  wait_reason: string;
  buy_trigger: string;
  monitoring_plan: string[];
};

type AnalyzeResponse = {
  graph_trace_id: string;
  report: {
    summary: string;
    purchase_timing: string;
    final_pick_id: string | null;
    top_recommendations: Recommendation[];
    purchase_decision: {
      label: string;
      confidence: number;
      reason: string;
      next_steps: string[];
    };
    share_brief: {
      headline: string;
      verdict_label: string;
      key_reasons: string[];
      watchouts: string[];
      copy_text: string;
    };
    deal_windows: DealWindow[];
    source_health: string[];
  };
  quality_audit?: {
    quality_score: number;
    estimated_cost_krw: number;
    launch_blockers: string[];
  };
};

const apiBase =
  process.env.NEXT_PUBLIC_SPECPILOT_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

const starterPayload: AnalyzePayload = {
  query:
    "영상 편집과 게임용 데스크톱 200만원 안에서 맞춰줘. QHD 144Hz 모니터를 쓰고 업그레이드 여지도 있었으면 좋겠어.",
  category: "desktop_pc",
  budget_krw: 2_000_000,
  purpose: "Premiere Pro, DaVinci Resolve, QHD gaming",
  must_haves: ["QHD 144Hz", "32GB RAM", "업그레이드 여지"],
  exclusions: ["중고", "리퍼", "출처 없는 가격"],
  channels: ["price_compare", "open_market", "official_store"],
};

const demoResponse: AnalyzeResponse = {
  graph_trace_id: "demo_trace",
  report: {
    summary:
      "영상 편집과 QHD 게이밍 목적에는 가격, 호환성, 리뷰 리스크를 함께 본 TOP 3 비교가 적합합니다.",
    purchase_timing:
      "현재 3개 후보가 예산 안입니다. 재고 한정/쿠폰 조건은 결제 직전에 다시 확인하세요.",
    final_pick_id: "build-001",
    top_recommendations: [
      {
        rank: 1,
        product: {
          id: "build-001",
          model_name: "Creator RTX 4070 SUPER Build",
          option_summary:
            "Ryzen 7 7800X3D / RTX 4070 SUPER / 32GB / 1TB / 750W",
        },
        price: { effective_price_krw: 1_925_000 },
        score: { total_score: 93.4, compatibility: 96 },
        fit_summary:
          "QHD 144Hz와 영상 편집을 동시에 커버하고 AM5 업그레이드 여지가 좋습니다.",
      },
      {
        rank: 2,
        product: {
          id: "build-003",
          model_name: "Intel Creator RTX 4070 Build",
          option_summary: "Core i7-14700 / RTX 4070 / 32GB / 2TB / 750W",
        },
        price: { effective_price_krw: 2_085_000 },
        score: { total_score: 89.1, compatibility: 92 },
        fit_summary:
          "멀티코어 작업과 2TB SSD가 강하지만 냉각과 보드 옵션을 확인해야 합니다.",
      },
      {
        rank: 3,
        product: {
          id: "build-002",
          model_name: "Balanced RTX 4060 Ti Build",
          option_summary: "Ryzen 5 7500F / RTX 4060 Ti / 32GB / 1TB / 650W",
        },
        price: { effective_price_krw: 1_590_000 },
        score: { total_score: 84.7, compatibility: 94 },
        fit_summary:
          "예산 여유가 크지만 QHD 고주사율 게임은 옵션 타협이 필요합니다.",
      },
    ],
    purchase_decision: {
      label: "가격 대기",
      confidence: 86.2,
      reason: "1순위 점수는 높지만 목표가까지 차이가 있어 알림 후 결제가 유리합니다.",
      next_steps: [
        "목표가 알림을 켜고 재조회 주기를 확인하세요.",
        "최종 결제 화면의 배송비, 조립비, 카드 혜택을 다시 확인하세요.",
        "공유 브리프로 주변 검토를 받으세요.",
      ],
    },
    share_brief: {
      headline: "Creator RTX 4070 SUPER Build 공유 검토 브리프",
      verdict_label: "가격 대기",
      key_reasons: [
        "QHD 144Hz와 편집 워크플로를 동시에 만족합니다.",
        "실구매가와 호환성 점수가 균형적입니다.",
        "옵션 검수표로 주요 부품을 결제 전 대조할 수 있습니다.",
      ],
      watchouts: [
        "가격비교 묶음 견적은 재고가 빠르게 바뀔 수 있습니다.",
        "케이스 GPU 길이와 쿨러 높이를 숫자로 확인해야 합니다.",
      ],
      copy_text:
        "SpecPilot AI 검토 요청: 1순위 후보의 가격, 옵션명, 호환성 리스크를 결제 전 한 번 더 봐주세요.",
    },
    deal_windows: [
      {
        product_id: "build-001",
        model_name: "Creator RTX 4070 SUPER Build",
        label: "가격 대기",
        status: "warning",
        current_price_krw: 1_925_000,
        target_price_krw: 1_848_000,
        fair_price_band_krw: "1,809,500원 ~ 1,963,500원",
        urgency: "목표가 알림 우선",
        volatility_risk:
          "쿠폰/카드 혜택 의존도가 있어 결제 단계에서 가격이 바뀔 수 있습니다.",
        wait_reason: "목표가까지 77,000원 차이가 있어 즉시 결제 매력이 낮습니다.",
        buy_trigger:
          "1,848,000원 이하 또는 동급 대체 후보가 나오면 다시 비교하세요.",
        monitoring_plan: [
          "7일마다 목표가 도달 여부를 확인하세요.",
          "품절, 판매처 변경, 쿠폰 종료 시 비교표를 다시 생성하세요.",
        ],
      },
    ],
    source_health: [
      "가격 출처 3종 연결",
      "출처 링크와 캐시 정책 표시",
      "제휴 여부와 추천 기준 분리",
    ],
  },
  quality_audit: {
    quality_score: 91.5,
    estimated_cost_krw: 48,
    launch_blockers: [],
  },
};

function won(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function Home() {
  const [payload, setPayload] = useState({
    query: starterPayload.query,
    category: starterPayload.category,
    budget: String(starterPayload.budget_krw),
    purpose: starterPayload.purpose,
    mustHaves: starterPayload.must_haves.join(", "),
    exclusions: starterPayload.exclusions.join(", "),
  });
  const [result, setResult] = useState<AnalyzeResponse>(demoResponse);
  const [isDemo, setIsDemo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("데모 리포트");

  const top = result.report.top_recommendations[0];
  const dealWindow = result.report.deal_windows[0];
  const quality = result.quality_audit;

  const formPayload = useMemo<AnalyzePayload>(
    () => ({
      query: payload.query,
      category: payload.category,
      budget_krw: Number(payload.budget || 0),
      purpose: payload.purpose,
      must_haves: splitList(payload.mustHaves),
      exclusions: splitList(payload.exclusions),
      channels: ["price_compare", "open_market", "official_store"],
    }),
    [payload],
  );

  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatusText("제품 API 분석 중");
    try {
      const response = await fetch(`${apiBase}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formPayload),
      });
      if (!response.ok) {
        throw new Error(`API ${response.status}`);
      }
      const data = (await response.json()) as AnalyzeResponse;
      setResult(data);
      setIsDemo(false);
      setStatusText(`Trace ${data.graph_trace_id}`);
    } catch {
      setResult(demoResponse);
      setIsDemo(true);
      setStatusText("API 미연결 데모");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <div className="brandMark">S</div>
          <div>
            <strong>SpecPilot AI</strong>
            <span>Computer purchase agent</span>
          </div>
        </div>
        <nav>
          <a href="https://github.com/hoonapps/specpilot-ai" target="_blank">
            제품 API <ExternalLink size={14} />
          </a>
          <a href="#analysis">분석</a>
          <a href="#trust">신뢰 정책</a>
        </nav>
      </header>

      <section className="workspace" id="analysis">
        <aside className="controlPanel">
          <div className="sectionLabel">
            <Sparkles size={16} />
            구매 조건
          </div>
          <h1>컴퓨터와 노트북 구매 결정을 리포트로 끝냅니다</h1>
          <form onSubmit={analyze} className="analysisForm">
            <label>
              요청
              <textarea
                value={payload.query}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    query: event.target.value,
                  }))
                }
              />
            </label>
            <div className="fieldGrid">
              <label>
                카테고리
                <select
                  value={payload.category}
                  onChange={(event) =>
                    setPayload((current) => ({
                      ...current,
                      category: event.target.value as Category,
                    }))
                  }
                >
                  <option value="desktop_pc">데스크톱 PC</option>
                  <option value="laptop">노트북</option>
                </select>
              </label>
              <label>
                예산
                <input
                  inputMode="numeric"
                  value={payload.budget}
                  onChange={(event) =>
                    setPayload((current) => ({
                      ...current,
                      budget: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <label>
              사용 목적
              <input
                value={payload.purpose}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    purpose: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              필수 조건
              <input
                value={payload.mustHaves}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    mustHaves: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              제외 조건
              <input
                value={payload.exclusions}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    exclusions: event.target.value,
                  }))
                }
              />
            </label>
            <button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="spin" size={18} /> : <Activity size={18} />}
              분석 실행
            </button>
          </form>
        </aside>

        <section className="decisionBoard">
          <div className="statusRow">
            <span className={isDemo ? "pill warn" : "pill ok"}>{statusText}</span>
            <span className="pill muted">API {apiBase}</span>
          </div>

          <div className="heroGrid">
            <article className="decisionCard">
              <div className="sectionLabel">
                <ShieldCheck size={16} />
                구매 판정
              </div>
              <h2>{result.report.purchase_decision.label}</h2>
              <p>{result.report.purchase_decision.reason}</p>
              <div className="metricRow">
                <div>
                  <span>확신도</span>
                  <strong>{result.report.purchase_decision.confidence}점</strong>
                </div>
                <div>
                  <span>품질 점수</span>
                  <strong>{quality?.quality_score ?? 0}점</strong>
                </div>
              </div>
            </article>
            <div className="visualPanel">
              <Image
                src="/product-workbench.png"
                alt="SpecPilot AI 구매 분석 워크벤치 프리뷰"
                fill
                sizes="(max-width: 900px) 100vw, 44vw"
                priority
              />
            </div>
          </div>

          <section className="summaryPanel">
            <div>
              <div className="sectionLabel">
                <Monitor size={16} />
                최종 후보
              </div>
              <h2>{top.product.model_name}</h2>
              <p>{top.fit_summary}</p>
            </div>
            <div className="priceBlock">
              <span>실구매가</span>
              <strong>{won(top.price.effective_price_krw)}</strong>
            </div>
          </section>

          <section className="cards three">
            {result.report.top_recommendations.map((item) => (
              <article className="card" key={item.product.id}>
                <span className="rank">TOP {item.rank}</span>
                <h3>{item.product.model_name}</h3>
                <p>{item.product.option_summary}</p>
                <div className="cardFooter">
                  <strong>{won(item.price.effective_price_krw)}</strong>
                  <span>{item.score.total_score}점</span>
                </div>
              </article>
            ))}
          </section>

          <section className="cards two">
            <article className="card accent">
              <div className="sectionLabel">
                <TimerReset size={16} />
                구매 타이밍
              </div>
              <h3>{dealWindow.label}</h3>
              <p>{dealWindow.wait_reason}</p>
              <dl className="dealGrid">
                <div>
                  <dt>현재가</dt>
                  <dd>{won(dealWindow.current_price_krw)}</dd>
                </div>
                <div>
                  <dt>목표가</dt>
                  <dd>{won(dealWindow.target_price_krw)}</dd>
                </div>
                <div>
                  <dt>적정가 밴드</dt>
                  <dd>{dealWindow.fair_price_band_krw}</dd>
                </div>
              </dl>
              <p>{dealWindow.buy_trigger}</p>
            </article>

            <article className="card">
              <div className="sectionLabel">
                <ClipboardCheck size={16} />
                공유 브리프
              </div>
              <h3>{result.report.share_brief.headline}</h3>
              <ul>
                {result.report.share_brief.key_reasons.slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>
        </section>
      </section>

      <section className="signalStrip" id="trust">
        <article>
          <Cpu size={20} />
          <strong>호환성 검수</strong>
          <span>소켓, 파워, 케이스, RAM, GPU 옵션</span>
        </article>
        <article>
          <Clock3 size={20} />
          <strong>가격 타이밍</strong>
          <span>목표가, 적정가 밴드, 재고/쿠폰 변동</span>
        </article>
        <article>
          <Bell size={20} />
          <strong>알림 전환</strong>
          <span>목표가 도달 평가와 발송 큐 이벤트</span>
        </article>
        <article>
          <Gauge size={20} />
          <strong>운영 품질</strong>
          <span>품질 점수, 예상 비용, 공개 차단 사유</span>
        </article>
      </section>

      <section className="trustPanel">
        <div>
          <div className="sectionLabel">
            <Laptop size={16} />
            제품 상태
          </div>
          <h2>출시 전 검수 기준을 화면 안에 노출합니다</h2>
          <p>
            추천 순위와 제휴 가능성, 출처 신뢰도, 가격 캐시 정책을 분리해
            사용자가 결제 전 리스크를 직접 확인하게 합니다.
          </p>
        </div>
        <div className="trustList">
          {result.report.source_health.map((item) => (
            <div key={item}>
              <CheckCircle2 size={18} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
