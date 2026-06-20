"use client";

import { useEffect, useState } from "react";
import { Copy, ImageIcon, LoaderCircle, Newspaper, Send } from "lucide-react";
import type { LaunchMediaKit, OpsStatus } from "../types";

type Status = "loading" | "ready" | "error";

const fallbackMediaKit: LaunchMediaKit = {
  kit_version: "specpilot.launch_media_kit.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  media_score: 56,
  headline: "외부 소개에 바로 쓸 수 있는 런칭 미디어 키트를 준비합니다.",
  summary:
    "대표 이미지, 런칭룸 링크, proof, 채널별 피치, 사용 가이드를 하나의 패키지로 묶습니다.",
  metric_cards: {
    media_score: 56,
    assets: 2,
    pitches: 2,
    growth_events: 0,
  },
  hero_statement:
    "SpecPilot AI는 컴퓨터와 노트북 구매 실패를 줄이는 AI 구매 리포트입니다.",
  proof_points: [
    "최저가보다 목적 적합도, 호환성, 리뷰 리스크, 가격 타이밍을 함께 봅니다.",
    "공개 런칭룸과 커뮤니티 대응 키트를 함께 제공합니다.",
  ],
  assets: [
    {
      key: "product_workbench",
      label: "제품 워크벤치 이미지",
      kind: "image",
      path: "/product-workbench.png",
      usage: "런칭 글과 뉴스레터 대표 이미지",
      alt_text: "SpecPilot AI 컴퓨터 구매 의사결정 워크벤치 화면",
      tracking_event: "launch_media_asset_product_workbench",
    },
    {
      key: "launch_room",
      label: "공개 런칭룸",
      kind: "page",
      path: "/launch",
      usage: "외부 소개 글의 기본 링크",
      alt_text: "SpecPilot AI 공개 런칭룸",
      tracking_event: "launch_media_asset_launch_room",
    },
  ],
  pitches: [
    {
      channel: "newsletter",
      audience: "AI 도구 뉴스레터 운영자",
      headline: "컴퓨터·노트북 구매 실패를 줄이는 AI 구매 리포트",
      body: "예산과 목적을 넣으면 후보 비교, 가격 타이밍, 결제 전 검수를 정리합니다.",
      cta_label: "런칭룸 보기",
      cta_path: "/launch",
      copy_text:
        "컴퓨터·노트북 구매 실패를 줄이는 AI 구매 리포트\n\n예산과 목적을 넣으면 후보 비교, 가격 타이밍, 결제 전 검수를 정리합니다.\n\n런칭룸 보기: /launch",
    },
  ],
  usage_guidelines: [
    "대표 링크는 /launch로 통일하세요.",
    "최저가 보장이나 구매 성공 보장 표현은 쓰지 마세요.",
  ],
  tracking_events: ["launch_media_pitch_copy", "launch_media_asset_click"],
  next_actions: ["제품 API 연결 후 실제 미디어 키트를 확인하세요."],
};

function tone(status: OpsStatus) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function formatMetric(value: number | string) {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toLocaleString("ko-KR") : String(Math.round(value));
  }
  return value;
}

export function LaunchMediaKitPanel() {
  const [kit, setKit] = useState<LaunchMediaKit>(fallbackMediaKit);
  const [status, setStatus] = useState<Status>("loading");
  const [copiedKey, setCopiedKey] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadKit() {
      setStatus("loading");
      try {
        const response = await fetch("/api/specpilot/launch-media-kit?limit=8");
        if (!response.ok) {
          throw new Error(`launch media kit ${response.status}`);
        }
        const payload = (await response.json()) as {
          ok: boolean;
          kit?: LaunchMediaKit;
        };
        if (!payload.ok || !payload.kit) {
          throw new Error("launch media kit rejected");
        }
        if (alive) {
          setKit(payload.kit);
          setStatus("ready");
        }
      } catch {
        if (alive) {
          setKit(fallbackMediaKit);
          setStatus("error");
        }
      }
    }

    void loadKit();
    return () => {
      alive = false;
    };
  }, []);

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
    } catch {
      setCopiedKey("");
    }
  }

  return (
    <section className="launchPublicSection launchMediaKit" id="launch-media-kit">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Newspaper size={16} />
            런칭 미디어 키트
          </div>
          <h2>{kit.headline}</h2>
          <p>{kit.summary}</p>
        </div>
        <div className="launchMediaStatus">
          <span className={`pill ${tone(kit.status)}`}>
            {kit.status} · {Math.round(kit.media_score)}점
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

      <div className="launchMediaMetricGrid">
        {Object.entries(kit.metric_cards)
          .slice(0, 8)
          .map(([key, value]) => (
            <article key={key}>
              <span>{key.replaceAll("_", " ")}</span>
              <strong>{formatMetric(value)}</strong>
            </article>
          ))}
      </div>

      <article className="launchMediaHeroStatement">
        <span className="pill muted">소개 문장</span>
        <p>{kit.hero_statement}</p>
      </article>

      <div className="launchMediaGrid">
        <div className="launchMediaColumn">
          <strong>
            <ImageIcon size={16} />
            공개 자산
          </strong>
          {kit.assets.slice(0, 6).map((asset) => (
            <article className="launchMediaAsset" key={asset.key}>
              <div>
                <span className="pill muted">{asset.kind}</span>
                <a href={asset.path}>{asset.path}</a>
              </div>
              <h3>{asset.label}</h3>
              <p>{asset.usage}</p>
              <small>{asset.alt_text}</small>
            </article>
          ))}
        </div>

        <div className="launchMediaColumn">
          <strong>
            <Send size={16} />
            채널별 피치
          </strong>
          {kit.pitches.slice(0, 6).map((pitch) => (
            <article className="launchMediaPitch" key={`${pitch.channel}-${pitch.headline}`}>
              <div>
                <span className="pill muted">{pitch.channel}</span>
                <button
                  type="button"
                  onClick={() => copyText(pitch.channel, pitch.copy_text)}
                >
                  <Copy size={14} />
                  {copiedKey === pitch.channel ? "복사됨" : "피치 복사"}
                </button>
              </div>
              <h3>{pitch.headline}</h3>
              <p>{pitch.audience}</p>
              <small>{pitch.body}</small>
            </article>
          ))}
        </div>
      </div>

      <div className="launchMediaFooter">
        <div>
          <strong>사용 가이드</strong>
          <ul>
            {kit.usage_guidelines.slice(0, 6).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>다음 액션</strong>
          <ul>
            {kit.next_actions.slice(0, 6).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="launchMediaEvents">
            {kit.tracking_events.slice(0, 5).map((item) => (
              <span className="pill muted" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
