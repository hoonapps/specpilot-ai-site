import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Share2, Sparkles, Users } from "lucide-react";
import { LaunchConversionPanel } from "../launch/LaunchConversionPanel";
import { siteConfig } from "../site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SpecPilot AI 초대 | 컴퓨터 구매 의사결정 에이전트",
  description:
    "추천 코드로 들어온 사용자가 공개 베타 대기열에 등록하고 컴퓨터/노트북 구매 리포트를 바로 시작합니다.",
  keywords: [...siteConfig.keywords, "추천 초대", "공개 베타", "구매 리포트"],
  alternates: {
    canonical: "/join",
  },
  openGraph: {
    title: "SpecPilot AI 추천 초대",
    description:
      "컴퓨터와 노트북 구매 실패를 줄이는 AI 구매 리포트 공개 베타 초대",
    url: "/join",
    images: ["/product-workbench.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpecPilot AI 추천 초대",
    description:
      "컴퓨터와 노트북 구매 실패를 줄이는 AI 구매 리포트 공개 베타 초대",
    images: ["/product-workbench.png"],
  },
};

type JoinPageProps = {
  searchParams: Promise<{
    ref?: string;
    source?: string;
    report?: string;
  }>;
};

function sanitizeReferralCode(value: string | undefined) {
  return (value || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 48);
}

function sanitizeSource(value: string | undefined) {
  return value === "public-report" ? "public-report" : "specpilot-join-page";
}

function sanitizeReportRef(value: string | undefined) {
  return (value || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 64);
}

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const { ref, source, report } = await searchParams;
  const referralCode = sanitizeReferralCode(ref);
  const joinSource = sanitizeSource(source);
  const reportRef = sanitizeReportRef(report);

  return (
    <main className="launchPublicPage joinPublicPage">
      <header className="topbar launchPublicTopbar">
        <Link className="brand" href="/">
          <span className="brandMark">SP</span>
          <span>
            <strong>SpecPilot AI</strong>
            <span>Referral invite</span>
          </span>
        </Link>
        <nav>
          <Link href="/launch">런칭룸</Link>
          <Link href="/market/desktop-pc">데스크톱</Link>
          <Link href="/market/laptop">노트북</Link>
          <Link href="/#analysis">분석 시작</Link>
        </nav>
      </header>

      <section className="joinPublicHero">
        <div className="joinHeroCopy">
          <div className="sectionLabel">
            <Share2 size={16} />
            Referral invite
          </div>
          <h1>추천받은 구매 리포트 초대입니다</h1>
          <p>
            예산과 용도를 넣으면 데스크톱 PC와 노트북 후보를 TOP 3, 제외 후보,
            가격 타이밍, 결제 전 체크리스트까지 정리합니다.
          </p>
          <div className="launchPublicActions">
            <a className="primaryButton" href="#join-conversion">
              대기열 등록
              <ArrowRight size={18} />
            </a>
            <Link className="secondaryLaunchButton" href="/launch">
              공개 런칭룸 보기
            </Link>
          </div>
          <div className="launchPublicPills">
            <span className="pill ok">추천 코드 자동 적용</span>
            <span className="pill ok">공개 베타 우선순위 반영</span>
            <span className="pill muted">컴퓨터 · 노트북 구매 전용</span>
          </div>
        </div>
        <aside className="joinInviteCard">
          <span>초대 코드</span>
          <strong>{referralCode || "직접 등록"}</strong>
          <p>
            {referralCode
              ? "이 코드로 가입하면 추천 유입으로 집계되고 대기열 우선순위에 반영됩니다."
              : reportRef
                ? "공개 리포트를 보고 들어온 사용자는 대기열 등록 후 자기 추천 코드를 발급받습니다."
              : "추천 코드가 없어도 대기열에 등록할 수 있습니다."}
          </p>
        </aside>
      </section>

      <section className="launchPublicSection">
        <div className="launchPublicGrid three">
          <article className="launchPublicCard">
            <span className="pill ok">1</span>
            <h3>내 조건 입력</h3>
            <p>예산, 목적, 필수 조건, 제외 조건을 짧게 적습니다.</p>
          </article>
          <article className="launchPublicCard">
            <span className="pill ok">2</span>
            <h3>구매 리포트 확인</h3>
            <p>추천 후보와 제외 이유, 가격 타이밍, 리스크를 같이 봅니다.</p>
          </article>
          <article className="launchPublicCard">
            <span className="pill ok">3</span>
            <h3>추천 코드 공유</h3>
            <p>좋은 반응을 다시 초대 링크로 연결해 공개 베타 수요를 키웁니다.</p>
          </article>
        </div>
      </section>

      <div id="join-conversion">
        <LaunchConversionPanel
          initialReferralCode={referralCode}
          source={joinSource}
          surface="join"
          title={
            reportRef
              ? "공개 리포트 관심을 대기열과 추천 코드로 연결합니다"
              : "초대 코드를 대기열과 구매 수요로 연결합니다"
          }
          subtitle={
            reportRef
              ? `공유 리포트 ${reportRef}에서 들어온 관심을 제품 API의 추천 대기열, 수익화 대시보드, 성장 이벤트에 기록합니다. 가입 후 본인 초대 링크를 바로 공유할 수 있습니다.`
              : "추천 코드가 있으면 자동 적용됩니다. 가입과 요금제 관심은 제품 API의 추천 대기열, 수익화 대시보드, 성장 이벤트에 기록됩니다."
          }
        />
      </div>

      <section className="launchPublicSection joinTrustBand">
        <div>
          <div className="sectionLabel">
            <CheckCircle2 size={16} />
            왜 초대받았나요
          </div>
          <h2>최저가 링크가 아니라 구매 실패 가능성을 줄이는 도구입니다</h2>
          <p>
            SpecPilot AI는 가격만 보여주는 페이지가 아니라 호환성, 리뷰 리스크,
            실구매가, 구매 타이밍, 결제 전 검수를 하나의 리포트로 정리합니다.
          </p>
        </div>
        <div className="joinTrustList">
          <span>
            <Sparkles size={16} />
            첫 PC 구매 조건 진단
          </span>
          <span>
            <Users size={16} />
            팀 장비 구매 표준안
          </span>
          <span>
            <Share2 size={16} />
            공개 리포트 공유 검토
          </span>
        </div>
      </section>
    </main>
  );
}
