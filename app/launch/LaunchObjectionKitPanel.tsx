"use client";

import { useEffect, useState } from "react";
import { CircleHelp, ExternalLink, LoaderCircle, ShieldCheck } from "lucide-react";
import type { OpsStatus, PublicLaunchObjectionKit } from "../types";

type Status = "loading" | "ready" | "error";

const fallbackKit: PublicLaunchObjectionKit = {
  kit_version: "specpilot.public_launch_objection_kit.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  objection_score: 58,
  headline: "첫 방문자 질문부터 바로 답합니다.",
  summary:
    "최저가 비교, 제휴 편향, 가격 최신성, 개인정보, 초보자 난이도, 팀 구매 질문을 공개 런칭 페이지 답변으로 정리했습니다.",
  primary_cta: "내 조건으로 차이 확인",
  primary_cta_path: "/#analysis",
  objections: [
    {
      key: "vs_price_comparison",
      question: "최저가 비교 사이트와 뭐가 다른가요?",
      status: "ok",
      short_answer:
        "최저가 링크가 아니라 예산, 목적, 호환성, 리뷰 리스크, 구매 타이밍, 결제 전 검수를 한 리포트로 묶습니다.",
      proof_points: [
        "TOP 3와 제외 후보를 같이 보여줍니다.",
        "가격 대기/즉시 결제/검수 후 구매를 나눕니다.",
        "공개 리포트로 같은 근거를 검토할 수 있습니다.",
      ],
      evidence_paths: ["/market/desktop-pc", "/market/laptop", "/#analysis"],
      cta_label: "내 조건으로 비교",
      cta_path: "/#analysis",
    },
    {
      key: "affiliate_bias",
      question: "제휴 링크 때문에 추천이 치우치지 않나요?",
      status: "ok",
      short_answer:
        "추천 점수와 제휴 링크 노출을 분리하고 제휴/비제휴 대안을 함께 관리합니다.",
      proof_points: [
        "추천 공정성 기준을 공개합니다.",
        "제휴 링크 단독 노출은 정책 경고를 띄웁니다.",
        "목적 적합도와 가격 점수를 분리합니다.",
      ],
      evidence_paths: ["/#launch-proof-hub"],
      cta_label: "추천 기준 보기",
      cta_path: "/#launch-proof-hub",
    },
    {
      key: "fresh_price",
      question: "가격과 재고가 바뀌면 믿을 수 있나요?",
      status: "warning",
      short_answer:
        "수집 시각, 캐시 기준, 목표가 알림, 결제 직전 옵션명 검수로 가격 변동 리스크를 줄입니다.",
      proof_points: [
        "가격 알림과 URL 모니터를 운영합니다.",
        "최종 결제 금액을 다시 대조합니다.",
        "변동 리스크를 구매 타이밍에 표시합니다.",
      ],
      evidence_paths: ["/#deal-timing"],
      cta_label: "구매 타이밍 확인",
      cta_path: "/#deal-timing",
    },
  ],
  comparisons: [
    {
      criterion: "판단 단위",
      price_comparison_sites: "상품/부품별 가격과 판매처",
      specpilot_ai: "구매 목적별 TOP 3, 제외 후보, 대안 시나리오",
      why_it_matters: "싼 상품을 찾는 것과 실패 가능성이 낮은 선택은 다릅니다.",
    },
    {
      criterion: "구매 직전 리스크",
      price_comparison_sites: "가격 변동과 옵션 차이는 사용자가 직접 확인",
      specpilot_ai: "옵션명, 최종 결제 금액, 판매자 답변 검수",
      why_it_matters: "결제 화면에서 바뀌는 조건이 실제 실패 원인이 됩니다.",
    },
  ],
  trust_badges: [
    "제휴 여부와 추천 순위 분리",
    "공개 리포트 토큰 격리",
    "연락처 원문 대신 마스킹 저장",
  ],
  channel_replies: [
    "최저가만 보는 도구가 아니라 예산/용도/호환성/리뷰 리스크/구매 타이밍을 한 리포트로 묶습니다.",
    "제휴 링크 여부는 추천 점수와 분리하고 추천 이유와 제외 이유를 같이 남깁니다.",
  ],
  next_actions: [
    "커뮤니티 공유 문구에 제휴 편향/가격 최신성 답변을 함께 넣으세요.",
  ],
};

function tone(status: OpsStatus) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function pathFor(path: string) {
  if (!path || path.includes("{")) {
    return "/#analysis";
  }
  if (path === "/policy/privacy" || path === "/policy/trust-center") {
    return "/#launch-proof-hub";
  }
  if (path.startsWith("/#") || path.startsWith("/")) {
    return path;
  }
  if (path.startsWith("#")) {
    return `/${path}`;
  }
  return path;
}

export function LaunchObjectionKitPanel() {
  const [kit, setKit] = useState<PublicLaunchObjectionKit>(fallbackKit);
  const [status, setStatus] = useState<Status>("loading");
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadKit() {
      setStatus("loading");
      try {
        const response = await fetch("/api/specpilot/launch-objection-kit?limit=8");
        if (!response.ok) {
          throw new Error(`launch objection kit ${response.status}`);
        }
        const payload = (await response.json()) as {
          ok: boolean;
          kit?: PublicLaunchObjectionKit;
        };
        if (!payload.ok || !payload.kit) {
          throw new Error("launch objection kit rejected");
        }
        if (alive) {
          setKit(payload.kit);
          setIsFallback(false);
          setStatus("ready");
        }
      } catch {
        if (alive) {
          setKit(fallbackKit);
          setIsFallback(true);
          setStatus("error");
        }
      }
    }

    void loadKit();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="launchPublicSection launchObjectionKit" id="launch-objections">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <CircleHelp size={16} />
            런칭 반박 FAQ
          </div>
          <h2>{kit.headline}</h2>
          <p>{kit.summary}</p>
        </div>
        <div className="launchObjectionScore">
          <span className={`pill ${tone(kit.status)}`}>
            {Math.round(kit.objection_score)}점
          </span>
          {status === "loading" ? (
            <small>
              <LoaderCircle className="spin" size={14} />
              조회 중
            </small>
          ) : null}
          {isFallback ? <small>제품 API 폴백</small> : null}
        </div>
      </div>

      <div className="launchObjectionHero">
        <div>
          <strong>최저가 비교와 다른 점</strong>
          <p>
            가격만 낮추는 답이 아니라, 실제로 살 때 틀리기 쉬운 옵션, 호환성,
            리뷰 리스크, 구매 타이밍을 같은 근거로 묶습니다.
          </p>
        </div>
        <a className="button primary" href={pathFor(kit.primary_cta_path)}>
          {kit.primary_cta}
          <ExternalLink size={16} />
        </a>
      </div>

      <div className="launchObjectionGrid">
        {kit.objections.slice(0, 6).map((item) => (
          <article className="launchObjectionCard" key={item.key}>
            <div>
              <span className={`pill ${tone(item.status)}`}>{item.status}</span>
              <ShieldCheck size={18} />
            </div>
            <h3>{item.question}</h3>
            <p>{item.short_answer}</p>
            <ul>
              {item.proof_points.slice(0, 3).map((proof) => (
                <li key={proof}>{proof}</li>
              ))}
            </ul>
            <div className="launchObjectionLinks">
              {item.evidence_paths.slice(0, 2).map((path) => (
                <a href={pathFor(path)} key={path}>
                  근거
                  <ExternalLink size={13} />
                </a>
              ))}
              <a href={pathFor(item.cta_path)}>{item.cta_label}</a>
            </div>
          </article>
        ))}
      </div>

      <div className="launchObjectionCompare">
        <div className="launchObjectionCompareHeader">
          <strong>비교표</strong>
          <span>가격 탐색에서 구매 결정으로</span>
        </div>
        <div className="launchObjectionCompareRows">
          {kit.comparisons.slice(0, 4).map((item) => (
            <article key={item.criterion}>
              <strong>{item.criterion}</strong>
              <div>
                <span>일반 가격 비교</span>
                <p>{item.price_comparison_sites}</p>
              </div>
              <div>
                <span>SpecPilot AI</span>
                <p>{item.specpilot_ai}</p>
              </div>
              <small>{item.why_it_matters}</small>
            </article>
          ))}
        </div>
      </div>

      <div className="launchObjectionFooter">
        <div>
          <strong>신뢰 배지</strong>
          <div className="launchPublicPills">
            {kit.trust_badges.slice(0, 6).map((badge) => (
              <span className="pill muted" key={badge}>
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div>
          <strong>복사용 답변</strong>
          <ul>
            {kit.channel_replies.slice(0, 3).map((reply) => (
              <li key={reply}>{reply}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
