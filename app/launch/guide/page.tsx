import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "SpecPilot AI 사용법 | 포트폴리오 설명",
  description:
    "SpecPilot AI가 무엇을 하려고 했고, 무엇을 만들었고, 포트폴리오에서 어떤 역량을 보여주는지 설명합니다.",
  alternates: {
    canonical: "/launch/guide",
  },
};

const guideItems = [
  {
    title: "무엇을 하려고 했나",
    body: "컴퓨터와 노트북 구매에서 사용자가 겪는 문제를 최저가 검색이 아니라 구매 실패 방지 문제로 다시 정의했습니다.",
  },
  {
    title: "무엇을 만들었나",
    body: "질문을 입력하면 결제 가능 여부, 위험 신호, 추가 확인 증거, 복사용 답변을 반환하는 AI 구매 의사결정 데모를 만들었습니다.",
  },
  {
    title: "어떻게 쓰나",
    body: "상품명, 장바구니 문구, 최종가, 리뷰 리스크를 붙여 넣고 답변 받기를 누릅니다. 결과는 커뮤니티나 가족에게 복사하거나 분석 화면으로 넘길 수 있습니다.",
  },
  {
    title: "왜 포트폴리오에 도움이 되나",
    body: "FastAPI 제품 API, Next.js 프론트, 디자인 토큰, CI, 시각 회귀 검수, 공개 런칭 메타데이터까지 제품 출시 흐름 전체를 보여줍니다.",
  },
];

export default function LaunchGuidePage() {
  return (
    <main className="answerGuidePage">
      <nav className="answerTopbar" aria-label="SpecPilot guide navigation">
        <Link className="answerBrand" href="/launch">
          <span>SP</span>
          <strong>SpecPilot AI</strong>
        </Link>
        <div>
          <Link href="/launch">질문하기</Link>
          <Link href="/launch/tools">기능별 데모</Link>
        </div>
      </nav>

      <section className="answerGuideHero">
        <span className="answerEyebrow">How to read this portfolio</span>
        <h1>기능을 많이 만든 프로젝트가 아니라, 구매 판단을 제품화한 프로젝트입니다.</h1>
        <p>
          이 프로젝트는 사용자가 “이거 사도 돼?”라고 묻는 순간부터 결제 전 확인, 공유
          검토, 구매 후 기록까지 이어지는 구매 의사결정 시스템을 보여줍니다.
        </p>
        <Link className="answerPrimaryLink" href="/launch#ask">
          직접 질문해보기
          <ArrowRight size={16} />
        </Link>
      </section>

      <section className="answerGuideGrid">
        {guideItems.map((item) => (
          <article key={item.title}>
            <CheckCircle2 size={18} />
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="answerGuideNote">
        <h2>면접에서 이렇게 설명하면 됩니다.</h2>
        <p>
          “단순 추천 앱이 아니라 구매 실패를 줄이는 의사결정 에이전트를 만들었습니다.
          제품 API와 공개 웹을 분리했고, 런칭 페이지는 질문-답변 중심으로 단순화했습니다.
          기능별 도구는 별도 페이지로 분리해 첫 방문자의 인지 부하를 줄였고, CI와 시각
          회귀 검수로 공개 배포 품질을 관리했습니다.”
        </p>
      </section>
    </main>
  );
}
