"use client";

import { useEffect, useState } from "react";
import { Copy, ExternalLink, LoaderCircle, Share2 } from "lucide-react";
import type { OpsStatus, PublicLaunchSharePack } from "../types";

type Status = "loading" | "ready" | "error";

const fallbackPack: PublicLaunchSharePack = {
  pack_version: "specpilot.public_launch_share_pack.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  share_score: 56,
  headline: "공유할 이유와 문구를 한 번에 제공합니다.",
  summary:
    "런칭룸, 반박 FAQ, 공개 proof를 묶어 카카오톡, 커뮤니티, 팀 공유 문구로 정리했습니다.",
  primary_url: "/launch",
  primary_copy:
    "컴퓨터와 노트북 구매 전에 최저가만 보지 말고 구매 리포트로 검토해보세요.\n\n/launch",
  variants: [
    {
      channel: "kakao",
      label: "카카오톡/지인 공유",
      audience: "컴퓨터나 노트북 구매를 앞둔 지인",
      share_url: "/launch?source=share-pack&utm_channel=kakao",
      headline: "컴퓨터 살 때 최저가만 보지 말고 리포트로 검토해봐",
      body: "예산과 용도만 넣으면 TOP 3, 제외 후보, 가격 타이밍, 결제 전 체크리스트까지 정리합니다.",
      cta_label: "공개 런칭룸 보기",
      copy_text:
        "컴퓨터 살 때 최저가만 보지 말고 리포트로 검토해봐\n\n예산과 용도만 넣으면 TOP 3, 제외 후보, 가격 타이밍, 결제 전 체크리스트까지 정리합니다.\n\n/launch?source=share-pack&utm_channel=kakao",
      tracking_event: "launch_share_kakao",
      proof_points: ["추천 이유와 제외 이유를 함께 표시", "공개 리포트 공유 검토"],
      disclosure: "제휴 여부와 추천 점수는 분리하며 가격은 결제 전 다시 확인해야 합니다.",
    },
    {
      channel: "community",
      label: "커뮤니티 공유",
      audience: "견적 조언을 구하는 커뮤니티 사용자",
      share_url: "/launch?source=share-pack&utm_channel=community",
      headline: "PC/노트북 구매 실패를 줄이는 AI 구매 리포트 공개 베타",
      body: "최저가 링크보다 목적 적합도, 호환성, 리뷰 리스크, 가격 타이밍, 결제 전 검수에 초점을 둡니다.",
      cta_label: "내 조건으로 분석",
      copy_text:
        "PC/노트북 구매 실패를 줄이는 AI 구매 리포트 공개 베타\n\n최저가 링크보다 목적 적합도, 호환성, 리뷰 리스크, 가격 타이밍, 결제 전 검수에 초점을 둡니다.\n\n/launch?source=share-pack&utm_channel=community",
      tracking_event: "launch_share_community",
      proof_points: ["추천 공정성 공개", "최저가 비교와 다른 점 설명"],
      disclosure: "제휴 여부와 추천 점수는 분리하며 가격은 결제 전 다시 확인해야 합니다.",
    },
  ],
  proof_strip: ["추천 기준 공개", "공개 리포트 토큰 격리"],
  trust_disclosures: [
    "제휴 여부와 추천 순위를 분리합니다.",
    "연락처와 주문번호는 공개 proof에 노출하지 않습니다.",
  ],
  measurement_events: ["launch_share_copy_click", "launch_share_analysis_start"],
  next_actions: ["공유 버튼 클릭을 성장 퍼널 이벤트로 남기세요."],
};

function tone(status: OpsStatus) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

export function LaunchSharePackPanel() {
  const [pack, setPack] = useState<PublicLaunchSharePack>(fallbackPack);
  const [status, setStatus] = useState<Status>("loading");
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadPack() {
      setStatus("loading");
      try {
        const response = await fetch("/api/specpilot/launch-share-pack?limit=8");
        if (!response.ok) {
          throw new Error(`launch share pack ${response.status}`);
        }
        const payload = (await response.json()) as {
          ok: boolean;
          pack?: PublicLaunchSharePack;
        };
        if (!payload.ok || !payload.pack) {
          throw new Error("launch share pack rejected");
        }
        if (alive) {
          setPack(payload.pack);
          setStatus("ready");
        }
      } catch {
        if (alive) {
          setPack(fallbackPack);
          setStatus("error");
        }
      }
    }

    void loadPack();
    return () => {
      alive = false;
    };
  }, []);

  async function copyText(channel: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedChannel(channel);
      window.setTimeout(() => setCopiedChannel(null), 1600);
    } catch {
      setCopiedChannel(null);
    }
  }

  return (
    <section className="launchPublicSection launchSharePack" id="launch-share-pack">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Share2 size={16} />
            공유 확산팩
          </div>
          <h2>{pack.headline}</h2>
          <p>{pack.summary}</p>
        </div>
        <div className="launchSharePackStatus">
          <span className={`pill ${tone(pack.status)}`}>
            {Math.round(pack.share_score)}점
          </span>
          {status === "loading" ? (
            <small>
              <LoaderCircle className="spin" size={14} />
              조회 중
            </small>
          ) : null}
          {status === "error" ? <small>제품 API 폴백</small> : null}
        </div>
      </div>

      <div className="launchSharePackHero">
        <div>
          <strong>대표 공유 링크</strong>
          <p>{pack.primary_url}</p>
        </div>
        <button type="button" onClick={() => copyText("primary", pack.primary_copy)}>
          <Copy size={16} />
          {copiedChannel === "primary" ? "복사됨" : "대표 문구 복사"}
        </button>
      </div>

      <div className="launchSharePackGrid">
        {pack.variants.slice(0, 4).map((variant) => (
          <article className="launchSharePackCard" key={variant.channel}>
            <div>
              <span className="pill ok">{variant.label}</span>
              <small>{variant.tracking_event}</small>
            </div>
            <h3>{variant.headline}</h3>
            <p>{variant.body}</p>
            <ul>
              {variant.proof_points.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <pre>{variant.copy_text}</pre>
            <div className="launchSharePackActions">
              <button type="button" onClick={() => copyText(variant.channel, variant.copy_text)}>
                <Copy size={15} />
                {copiedChannel === variant.channel ? "복사됨" : "문구 복사"}
              </button>
              <a href={variant.share_url}>
                {variant.cta_label}
                <ExternalLink size={14} />
              </a>
            </div>
            <small>{variant.disclosure}</small>
          </article>
        ))}
      </div>

      <div className="launchSharePackFooter">
        <div>
          <strong>공유 proof</strong>
          <div className="launchPublicPills">
            {pack.proof_strip.slice(0, 6).map((item) => (
              <span className="pill muted" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
        <div>
          <strong>측정 이벤트</strong>
          <ul>
            {pack.measurement_events.slice(0, 5).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>신뢰 고지</strong>
          <ul>
            {pack.trust_disclosures.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
