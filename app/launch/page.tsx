import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  MessageSquareQuote,
  Monitor,
  Rocket,
  ShieldCheck,
  Star,
} from "lucide-react";
import { getJson } from "../api/specpilot/_client";
import type {
  PublicBuyerChecklist,
  PublicLaunchRoom,
  PublicSocialProofWall,
} from "../types";
import { LaunchConversionPanel } from "./LaunchConversionPanel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SpecPilot AI 런칭룸 | 컴퓨터 구매 의사결정 에이전트",
  description:
    "데스크톱 PC와 노트북 구매 결정을 위한 공개 데모, 시장 리포트, proof strip, CTA를 한 화면에서 확인합니다.",
  openGraph: {
    title: "SpecPilot AI 런칭룸",
    description:
      "컴퓨터와 노트북 구매를 위한 AI 의사결정 에이전트 공개 데모룸",
    images: ["/product-workbench.png"],
  },
};

const fallbackRoom: PublicLaunchRoom = {
  room_version: "specpilot.public_launch_room.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  launch_score: 62,
  headline: "컴퓨터와 노트북 구매 결정을 리포트로 정리하는 AI 에이전트",
  hero_message:
    "예산, 목적, 필수 조건, 제외 조건을 입력하면 추천 후보, 구매 타이밍, 리스크, 공유용 브리프까지 한 번에 정리합니다.",
  share_title: "SpecPilot AI 공개 데모",
  share_text:
    "데스크톱 PC와 노트북 구매를 앞둔 사람에게 조건 진단, 가격 타이밍, 구매 실행 체크리스트를 보여주는 공개 데모입니다.",
  primary_cta: "구매 조건 분석 시작",
  primary_cta_path: "#workspace",
  proof_strip: [
    "데스크톱 PC와 노트북 카테고리 지원",
    "추천 이유와 제외 이유를 함께 표시",
    "공개 리포트와 구매 링크 거버넌스 제공",
  ],
  demo_cards: [
    {
      key: "creator-desktop",
      title: "영상 편집용 데스크톱",
      status: "ok",
      metric: "예산 200만원 · QHD 144Hz",
      body: "성능, 업그레이드 여지, 가격 타이밍을 함께 비교합니다.",
      cta_label: "데모 조건 적용",
      cta_path: "/#workspace",
    },
    {
      key: "student-laptop",
      title: "대학생 노트북",
      status: "ok",
      metric: "휴대성 · 배터리 · A/S",
      body: "가벼운 작업과 장기 사용 리스크를 기준으로 후보를 좁힙니다.",
      cta_label: "노트북 리포트 보기",
      cta_path: "/market/laptop",
    },
    {
      key: "team-purchase",
      title: "팀 장비 구매",
      status: "warning",
      metric: "여러 명의 조건 취합",
      body: "공유 브리프와 결제 전 검수로 내부 승인 흐름을 줄입니다.",
      cta_label: "공개 리포트 흐름 확인",
      cta_path: "/#share",
    },
  ],
  launch_cards: [
    {
      key: "proof",
      title: "추천 근거 공개",
      status: "ok",
      metric: "proof strip",
      body: "추천 결과만 보여주지 않고 검수 기준과 공개 설명 문구를 함께 제공합니다.",
      cta_label: "검증 허브",
      cta_path: "/#proof-hub",
    },
    {
      key: "market",
      title: "카테고리 리포트",
      status: "ok",
      metric: "desktop_pc · laptop",
      body: "월간 추천 픽, 가격 구간, 리스크 신호를 공개 페이지로 분리합니다.",
      cta_label: "시장 리포트",
      cta_path: "/market/desktop-pc",
    },
    {
      key: "growth",
      title: "출시 반응 수집",
      status: "warning",
      metric: "waitlist · pricing intent",
      body: "대기열, 요금제 관심, 피드백을 제품 개선 신호로 연결합니다.",
      cta_label: "런칭 지표 확인",
      cta_path: "/#launch-pulse",
    },
  ],
  market_links: [
    {
      category: "desktop_pc",
      title: "데스크톱 PC 구매 리포트",
      path: "/market/desktop-pc",
      share_text: "영상 편집과 게임용 데스크톱 구성을 점검합니다.",
      lead_pick: "Creator RTX 4070 SUPER Build",
      risk_count: 2,
    },
    {
      category: "laptop",
      title: "노트북 구매 리포트",
      path: "/market/laptop",
      share_text: "휴대성, 배터리, A/S 리스크를 함께 비교합니다.",
      lead_pick: "CreatorBook 14 Pro",
      risk_count: 2,
    },
  ],
  secondary_ctas: [
    "공개 리포트를 지인에게 공유",
    "목표가 알림을 걸고 기다리기",
    "구매 후 결과를 학습 데이터로 남기기",
  ],
  channel_posts: [
    "컴퓨터 견적 고민을 리포트 형태로 정리해 주는 SpecPilot AI 공개 데모입니다.",
    "추천 후보뿐 아니라 제외 이유, 구매 타이밍, 결제 전 체크리스트까지 확인할 수 있습니다.",
  ],
  next_actions: [
    "첫 구매 조건을 입력해 리포트 생성",
    "시장 리포트 링크를 커뮤니티에 공유",
    "피드백과 구매 의향을 수집해 우선순위 조정",
  ],
};

const fallbackSocialProofWall: PublicSocialProofWall = {
  wall_version: "specpilot.public_social_proof_wall.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  proof_score: 48,
  headline: "첫 반응이 쌓이기 전에도 신뢰 기준부터 공개합니다.",
  summary:
    "추천 기준, 공개 리포트, 개인정보 마스킹 기준을 먼저 보여주고 첫 사용자 반응을 proof로 쌓습니다.",
  metric_cards: {
    feedback_count: 0,
    average_satisfaction: 0,
    purchase_intent_rate: "0%",
    purchase_outcomes: 0,
    completed_purchase_outcomes: 0,
    public_share_views: 0,
    referral_waitlist: 0,
    referred_signup_count: 0,
  },
  proof_strip: [
    "연락처 원문 없이 공개 proof를 만듭니다",
    "만족도 4점 이상 또는 구매 결과만 선별합니다",
    "제휴 링크 여부는 추천 순위와 분리합니다",
  ],
  items: [
    {
      proof_id: "fallback_trust_center",
      kind: "trust",
      title: "추천 기준을 먼저 공개합니다",
      body: "제휴 여부와 추천 순위를 분리하고, 가격 출처와 캐시 기준을 공개합니다.",
      metric: "Trust Center 공개",
      persona: "첫 방문자",
      source_label: "공개 신뢰 정책",
      rating: null,
      status: "warning",
      created_at: null,
    },
    {
      proof_id: "fallback_share_loop",
      kind: "trust",
      title: "공유 검토 루프를 준비했습니다",
      body: "구매 리포트를 토큰 기반 공개 페이지로 전환해 같은 근거를 함께 검토할 수 있습니다.",
      metric: "공개 리포트 준비",
      persona: "가족·팀 검토자",
      source_label: "제품 기본 proof",
      rating: null,
      status: "warning",
      created_at: null,
    },
  ],
  trust_notes: [
    "사용자 연락처, 주문번호, 원문 이메일은 공개하지 않습니다.",
    "가격과 제휴 조건은 추천 공정성 Trust Center 기준을 따릅니다.",
  ],
  cta_cards: [
    "내 조건으로 구매 리포트 만들기",
    "공개 베타 대기열 등록",
    "추천 기준 Trust Center 보기",
  ],
  next_actions: [
    "첫 공개 사용자에게 피드백과 구매 결과 회수 CTA를 강하게 노출하세요.",
  ],
};

const fallbackBuyerChecklist: PublicBuyerChecklist = {
  checklist_version: "specpilot.public_buyer_checklist.fallback",
  generated_at: new Date(0).toISOString(),
  category: "desktop_pc",
  persona: "first_pc_buyer",
  budget_krw: 2_200_000,
  headline: "데스크톱 PC 구매 전 7개 항목만 확인하면 실패 가능성을 줄일 수 있습니다.",
  summary:
    "예산, 필수 조건, 실구매가, 옵션명, 판매자 답변, 결제 전 증거를 한 장으로 정리합니다.",
  readiness_score: 64,
  budget_fit: "예산은 맞지만 쿠폰 종료, 배송비, 옵션 변경을 결제 직전 확인해야 합니다.",
  primary_cta_label: "내 조건으로 분석 시작",
  primary_cta_anchor: "#analysis",
  analysis_prefill:
    "데스크톱을 220만원 안에서 추천해줘. 가격 타이밍과 결제 전 검수까지 같이 봐줘.",
  sections: [
    {
      section_id: "fit",
      title: "용도와 필수 조건",
      summary: "성능보다 먼저 사용 목적과 제외 조건을 고정합니다.",
      items: [
        {
          item_id: "purpose",
          label: "주 사용 목적을 한 문장으로 고정",
          status: "ok",
          why_it_matters: "같은 예산에서도 게임, 개발, 영상 편집 우선순위가 다릅니다.",
          user_input_hint: "예: QHD 게임과 영상 편집, 32GB RAM, RTX 4070급",
          failure_if_missing: "필요 없는 성능에 과투자할 수 있습니다.",
        },
      ],
    },
    {
      section_id: "checkout",
      title: "결제 전 검수",
      summary: "모델명, 옵션명, 최종 결제 금액을 주문 직전에 대조합니다.",
      items: [
        {
          item_id: "option_name",
          label: "리포트 후보와 주문 옵션명 일치 확인",
          status: "blocker",
          why_it_matters: "동일 시리즈라도 RAM, SSD, GPU 옵션이 다를 수 있습니다.",
          user_input_hint: "장바구니 옵션명과 판매 페이지 모델명을 붙여 넣으세요.",
          failure_if_missing: "비슷한 이름의 하위 옵션을 주문할 수 있습니다.",
        },
      ],
    },
  ],
  red_flags: [
    "최종 결제 금액이 리포트 가격보다 높아졌는데 이유를 설명할 수 없음",
    "판매 페이지 모델명과 장바구니 옵션명이 다름",
    "리뷰 반복 불만이나 AS 조건을 확인하지 않음",
  ],
  evidence_to_capture: [
    "최종 결제 화면의 총액, 배송비, 쿠폰/카드 혜택",
    "장바구니 옵션명과 판매 페이지 모델명",
    "판매자 답변, 배송 예정일, 반품/AS 조건",
  ],
  share_copy:
    "데스크톱 PC 구매 전에 SpecPilot AI 체크리스트로 실구매가, 옵션명, 결제 전 검수 항목을 확인했습니다.",
  next_actions: [
    "체크리스트의 입력 힌트를 분석 요청에 붙여 넣으세요.",
    "상위 후보가 나오면 공개 리포트로 주변 검토를 먼저 받으세요.",
  ],
};

async function loadLaunchRoom(): Promise<{
  room: PublicLaunchRoom;
  isFallback: boolean;
}> {
  try {
    const room = await getJson<PublicLaunchRoom>("/public/launch-room?limit=8");
    return { room, isFallback: false };
  } catch {
    return { room: fallbackRoom, isFallback: true };
  }
}

async function loadSocialProofWall(): Promise<{
  wall: PublicSocialProofWall;
  isFallback: boolean;
}> {
  try {
    const wall = await getJson<PublicSocialProofWall>(
      "/public/social-proof-wall?limit=8",
    );
    return { wall, isFallback: false };
  } catch {
    return { wall: fallbackSocialProofWall, isFallback: true };
  }
}

async function loadBuyerChecklist(): Promise<{
  checklist: PublicBuyerChecklist;
  isFallback: boolean;
}> {
  try {
    const checklist = await getJson<PublicBuyerChecklist>(
      "/public/buyer-checklist?category=desktop_pc&budget_krw=2200000&persona=creator_gamer",
    );
    return { checklist, isFallback: false };
  } catch {
    return { checklist: fallbackBuyerChecklist, isFallback: true };
  }
}

function tone(status: PublicLaunchRoom["status"] | PublicSocialProofWall["status"]) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function hrefFor(path: string) {
  if (path.startsWith("#")) {
    return `/${path}`;
  }
  return path;
}

export default async function LaunchPage() {
  const [
    { room, isFallback },
    { wall, isFallback: proofFallback },
    { checklist, isFallback: checklistFallback },
  ] = await Promise.all([
    loadLaunchRoom(),
    loadSocialProofWall(),
    loadBuyerChecklist(),
  ]);
  const heroPills = room.proof_strip.slice(0, 3);
  const proofMetricCards = [
    ["피드백", wall.metric_cards.feedback_count ?? 0],
    ["만족도", wall.metric_cards.average_satisfaction ?? 0],
    ["구매 의향", wall.metric_cards.purchase_intent_rate ?? "0%"],
    ["추천 유입", wall.metric_cards.referred_signup_count ?? 0],
  ];

  return (
    <main className="launchPublicPage">
      <header className="topbar launchPublicTopbar">
        <Link className="brand" href="/">
          <span className="brandMark">SP</span>
          <span>
            <strong>SpecPilot AI</strong>
            <span>Computer buying agent</span>
          </span>
        </Link>
        <nav>
          <Link href="/#workspace">분석 시작</Link>
          <Link href="/market/desktop-pc">데스크톱</Link>
          <Link href="/market/laptop">노트북</Link>
          <Link href="/#proof-hub">검증 허브</Link>
        </nav>
      </header>

      <section className="launchPublicHero">
        <div className="launchPublicHeroContent">
          <div className="sectionLabel">
            <Rocket size={16} />
            Public launch room
          </div>
          <h1>{room.headline}</h1>
          <p>{room.hero_message}</p>
          <div className="launchPublicActions">
            <a className="primaryButton" href={hrefFor(room.primary_cta_path)}>
              {room.primary_cta}
              <ArrowRight size={18} />
            </a>
            <Link className="secondaryLaunchButton" href="/market/desktop-pc">
              시장 리포트 보기
              <ExternalLink size={17} />
            </Link>
          </div>
          <div className="launchPublicPills">
            {heroPills.map((item) => (
              <span className="pill ok" key={item}>
                {item}
              </span>
            ))}
            {isFallback ? <span className="pill warn">제품 API 폴백</span> : null}
          </div>
        </div>
      </section>

      <section className="launchPublicMetrics" aria-label="런칭룸 지표">
        <article>
          <span>런칭 점수</span>
          <strong>{Math.round(room.launch_score)}점</strong>
          <p>{room.status}</p>
        </article>
        <article>
          <span>공개 데모</span>
          <strong>{room.demo_cards.length}개</strong>
          <p>바로 적용할 구매 상황</p>
        </article>
        <article>
          <span>시장 리포트</span>
          <strong>{room.market_links.length}개</strong>
          <p>데스크톱 PC와 노트북</p>
        </article>
        <article>
          <span>공유 문구</span>
          <strong>{room.channel_posts.length}개</strong>
          <p>커뮤니티와 지인 공유용</p>
        </article>
      </section>

      <section className="launchPublicSection launchBuyerChecklist">
        <div className="sectionHeader">
          <div>
            <div className="sectionLabel">
              <CheckCircle2 size={16} />
              Buyer checklist
            </div>
            <h2>{checklist.headline}</h2>
            <p>{checklist.summary}</p>
          </div>
          <span className={`pill ${tone(checklist.sections[0]?.items[0]?.status ?? "warning")}`}>
            준비도 {Math.round(checklist.readiness_score)}점
          </span>
        </div>
        <div className="launchBuyerChecklistGrid">
          <article className="launchBuyerChecklistLead">
            <span>{checklist.category === "desktop_pc" ? "Desktop PC" : "Laptop"}</span>
            <strong>{checklist.budget_krw.toLocaleString("ko-KR")}원</strong>
            <p>{checklist.budget_fit}</p>
            <a className="miniCta" href={hrefFor(checklist.primary_cta_anchor)}>
              {checklist.primary_cta_label}
            </a>
            {checklistFallback ? (
              <small>체크리스트 API 폴백</small>
            ) : (
              <small>{checklist.checklist_version}</small>
            )}
          </article>
          {checklist.sections.slice(0, 3).map((section) => (
            <article className="launchBuyerChecklistSection" key={section.section_id}>
              <span>{section.title}</span>
              <p>{section.summary}</p>
              <ul>
                {section.items.slice(0, 2).map((item) => (
                  <li key={item.item_id}>
                    <strong>{item.label}</strong>
                    <small>{item.failure_if_missing}</small>
                    <span className={`pill ${tone(item.status)}`}>{item.status}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="launchBuyerChecklistFooter">
          <div>
            <strong>결제 전 캡처할 증거</strong>
            <ul>
              {checklist.evidence_to_capture.slice(0, 4).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>위험 신호</strong>
            <ul>
              {checklist.red_flags.slice(0, 4).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="launchPublicSection launchSocialProofWall">
        <div className="sectionHeader">
          <div>
            <div className="sectionLabel">
              <MessageSquareQuote size={16} />
              Social proof wall
            </div>
            <h2>{wall.headline}</h2>
            <p>{wall.summary}</p>
          </div>
          <span className={`pill ${tone(wall.status)}`}>
            {Math.round(wall.proof_score)}점
          </span>
        </div>
        <div className="launchSocialProofMetrics">
          {proofMetricCards.map(([label, value]) => (
            <article key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
        <div className="launchSocialProofGrid">
          {wall.items.slice(0, 6).map((item) => (
            <article className="launchSocialProofCard" key={item.proof_id}>
              <div>
                <span className={`pill ${tone(item.status)}`}>{item.source_label}</span>
                {item.rating ? (
                  <span className="launchRating">
                    <Star size={14} />
                    {item.rating}/5
                  </span>
                ) : null}
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <small>{item.metric}</small>
              <strong>{item.persona}</strong>
            </article>
          ))}
        </div>
        <div className="launchSocialProofFooter">
          <div className="launchPublicPills">
            {wall.proof_strip.slice(0, 4).map((item) => (
              <span className="pill ok" key={item}>
                {item}
              </span>
            ))}
            {proofFallback ? <span className="pill warn">proof API 폴백</span> : null}
          </div>
          <ul>
            {wall.trust_notes.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="launchPublicSection">
        <div className="sectionHeader">
          <div>
            <div className="sectionLabel">
              <Monitor size={16} />
              데모 진입점
            </div>
            <h2>구매 상황별로 바로 체험합니다</h2>
          </div>
          <span className={`pill ${tone(room.status)}`}>
            {room.room_version}
          </span>
        </div>
        <div className="launchPublicGrid three">
          {room.demo_cards.map((card) => (
            <article className="launchPublicCard" key={card.key}>
              <span className={`pill ${tone(card.status)}`}>{card.status}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <strong>{card.metric}</strong>
              <a className="miniCta" href={hrefFor(card.cta_path)}>
                {card.cta_label}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="launchPublicSection">
        <div className="sectionHeader">
          <div>
            <div className="sectionLabel">
              <ShieldCheck size={16} />
              출시 proof
            </div>
            <h2>추천 결과를 외부에 설명할 근거를 함께 둡니다</h2>
          </div>
          <Link className="miniCta" href="/#proof-hub">
            검증 허브
          </Link>
        </div>
        <div className="launchPublicGrid">
          {room.launch_cards.map((card) => (
            <article className="launchPublicCard" key={card.key}>
              <span className={`pill ${tone(card.status)}`}>{card.metric}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <a className="miniCta" href={hrefFor(card.cta_path)}>
                {card.cta_label}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="launchPublicSection">
        <div className="sectionHeader">
          <div>
            <div className="sectionLabel">
              <BarChart3 size={16} />
              공개 시장 리포트
            </div>
            <h2>컴퓨터와 노트북 구매 페이지로 검색 유입을 받습니다</h2>
          </div>
        </div>
        <div className="launchMarketGrid">
          {room.market_links.map((item) => (
            <a className="launchMarketCard" href={item.path} key={item.path}>
              <span>{item.category === "desktop_pc" ? "Desktop PC" : "Laptop"}</span>
              <h3>{item.title}</h3>
              <p>{item.share_text}</p>
              <dl>
                <div>
                  <dt>대표 후보</dt>
                  <dd>{item.lead_pick}</dd>
                </div>
                <div>
                  <dt>리스크</dt>
                  <dd>{item.risk_count}개</dd>
                </div>
              </dl>
            </a>
          ))}
        </div>
      </section>

      <LaunchConversionPanel />

      <section className="launchPublicSection launchSharePanel">
        <div>
          <div className="sectionLabel">
            <CheckCircle2 size={16} />
            공유 문구
          </div>
          <h2>{room.share_title}</h2>
          <p>{room.share_text}</p>
          <ul>
            {room.channel_posts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>다음 액션</strong>
          <ul>
            {room.next_actions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="launchPublicPills">
            {room.secondary_ctas.map((item) => (
              <span className="pill muted" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
