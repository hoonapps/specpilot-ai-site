import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Monitor,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { getJson } from "../api/specpilot/_client";
import type { PublicLaunchRoom } from "../types";

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

function tone(status: PublicLaunchRoom["status"]) {
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
  const { room, isFallback } = await loadLaunchRoom();
  const heroPills = room.proof_strip.slice(0, 3);

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
