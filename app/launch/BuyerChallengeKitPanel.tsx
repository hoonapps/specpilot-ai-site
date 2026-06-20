"use client";

import { useState } from "react";
import {
  Clipboard,
  Copy,
  MessageCircle,
  Share2,
  ShieldCheck,
} from "lucide-react";
import type { PublicBuyerChallengeKit } from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type BuyerChallengeKitPanelProps = {
  kit: PublicBuyerChallengeKit;
  isFallback?: boolean;
};

function hrefFor(path: string) {
  if (path.startsWith("#")) {
    return `/${path}`;
  }
  if (path.startsWith("/public/buyer-checklist")) {
    return "/launch#buyer-checklist";
  }
  if (path.startsWith("/public/mistake-cost-calculator")) {
    return "/launch#mistake-cost";
  }
  if (path.startsWith("/public/buyer-persona-quiz")) {
    return "/launch#persona-quiz";
  }
  return path;
}

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function variantIcon(channel: string) {
  if (channel === "team") {
    return <ShieldCheck size={17} />;
  }
  if (channel === "community") {
    return <Share2 size={17} />;
  }
  return <MessageCircle size={17} />;
}

export function BuyerChallengeKitPanel({
  kit,
  isFallback = false,
}: BuyerChallengeKitPanelProps) {
  const [copiedChannel, setCopiedChannel] = useState<string>("");
  const [copyFailed, setCopyFailed] = useState(false);

  async function copyVariant(channel: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedChannel(channel);
      setCopyFailed(false);
    } catch {
      setCopiedChannel("");
      setCopyFailed(true);
    }
  }

  return (
    <section
      className="launchPublicSection launchBuyerChallenge"
      id="buyer-challenge"
    >
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Share2 size={16} />
            구매 챌린지 공유 키트
          </div>
          <h2>{kit.headline}</h2>
          <p>{kit.summary}</p>
        </div>
        <span className="pill ok">
          {formatWon(kit.budget_krw)}
        </span>
      </div>

      <div className="launchBuyerChallengeGrid">
        <article className="launchBuyerChallengeLead">
          <span>{kit.challenge_title}</span>
          <strong>{kit.category === "desktop_pc" ? "Desktop PC" : "Laptop"}</strong>
          <p>{kit.analysis_prefill}</p>
          <div className="launchBuyerChallengeActions">
            <LaunchAnalysisLink
              className="miniCta"
              handoff={{
                source: "buyer-challenge-kit",
                label: kit.primary_cta_label,
                query: kit.analysis_prefill,
                category: kit.category,
                budget_krw: kit.budget_krw,
                purpose: kit.persona,
              }}
            >
              {kit.primary_cta_label}
            </LaunchAnalysisLink>
            <a className="miniCta secondary" href={hrefFor(kit.checklist_path)}>
              체크리스트 보기
            </a>
          </div>
          <div className="launchPublicPills">
            {kit.hashtags.slice(0, 5).map((tag) => (
              <span className="pill muted" key={tag}>
                {tag}
              </span>
            ))}
            {isFallback ? <span className="pill warn">공유 키트 폴백</span> : null}
          </div>
        </article>

        <div className="launchBuyerChallengeSteps">
          {kit.challenge_steps.map((step) => (
            <article key={step.step_id}>
              <span>{step.title}</span>
              <p>{step.action}</p>
              <small>{step.proof}</small>
            </article>
          ))}
        </div>
      </div>

      <div className="launchBuyerChallengeShareGrid">
        {kit.share_variants.map((variant) => (
          <article className="launchBuyerChallengeShareCard" key={variant.channel}>
            <div>
              <span className="pill ok">
                {variantIcon(variant.channel)}
                {variant.label}
              </span>
              <button
                type="button"
                onClick={() => copyVariant(variant.channel, variant.copy_text)}
              >
                {copiedChannel === variant.channel ? (
                  <Clipboard size={16} />
                ) : (
                  <Copy size={16} />
                )}
                {copiedChannel === variant.channel ? "복사됨" : "복사"}
              </button>
            </div>
            <h3>{variant.headline}</h3>
            <p>{variant.body}</p>
            <pre>{variant.copy_text}</pre>
          </article>
        ))}
      </div>

      {copyFailed ? (
        <p className="launchPersonaError">
          클립보드 권한이 없어 복사하지 못했습니다. 문구를 직접 선택해 복사하세요.
        </p>
      ) : null}

      <div className="launchBuyerChallengeProof">
        <div>
          <strong>공유 전에 고정되는 근거</strong>
          <ul>
            {kit.proof_points.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>다음 액션</strong>
          <ul>
            {kit.next_actions.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
