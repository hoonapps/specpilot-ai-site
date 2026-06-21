"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  LoaderCircle,
  MessageSquareReply,
  ShieldAlert,
} from "lucide-react";
import type {
  Category,
  CommunityReplyKitRequest,
  PublicCommunityReplyKit,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  channel: string;
  buyerQuestion: string;
  productTitle: string;
  sellerName: string;
  candidateSummary: string;
  budget: string;
  finalPrice: string;
  usageContext: string;
  riskNotes: string;
  readyEvidence: string;
  missingEvidence: string;
  replyTone: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  channel: "community",
  buyerQuestion: "이 RTX 4070 SUPER 견적 오늘 결제해도 될까요?",
  productTitle: "Creator RTX 4070 SUPER Build",
  sellerName: "PC Mall",
  candidateSummary:
    "RTX 4070 SUPER, Ryzen 7, RAM 32GB, SSD 1TB, Windows 11, 국내 AS 24개월, 반품 14일, 최종가 2,165,000원",
  budget: "2200000",
  finalPrice: "2165000",
  usageContext: "QHD 편집과 게임",
  riskNotes: "팬 소음 후기가 일부 있음\n배송 예정일 확인 필요",
  readyEvidence: "최종 결제 금액\n옵션명\n국내 AS 24개월",
  missingEvidence: "배송 예정일",
  replyTone: "helpful",
};

function parseNumber(value: string, fallback: number | null = null) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function lines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function payloadFromForm(form: FormState): CommunityReplyKitRequest {
  return {
    category: form.category,
    community_channel: form.channel,
    buyer_question: form.buyerQuestion,
    product_title: form.productTitle,
    seller_name: form.sellerName,
    candidate_summary: form.candidateSummary,
    budget_krw: parseNumber(form.budget, 2_200_000) ?? 2_200_000,
    final_price_krw: parseNumber(form.finalPrice),
    usage_context: form.usageContext,
    risk_notes: lines(form.riskNotes),
    ready_evidence: lines(form.readyEvidence),
    missing_evidence: lines(form.missingEvidence),
    reply_tone: form.replyTone,
    source: "launch_community_reply",
  };
}

function tone(status: string) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function iconFor(status: string) {
  if (status === "ok") {
    return <CheckCircle2 size={15} />;
  }
  if (status === "blocker") {
    return <ShieldAlert size={15} />;
  }
  return <AlertTriangle size={15} />;
}

function labelFor(status: string) {
  if (status === "ok") {
    return "공유 가능";
  }
  if (status === "blocker") {
    return "구매 보류";
  }
  return "확인 요청";
}

export function CommunityReplyPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicCommunityReplyKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/community-reply-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`community reply ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicCommunityReplyKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("community reply rejected");
      }
      setKit(payload.kit);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function copyReply() {
    if (!kit?.primary_reply) {
      return;
    }
    try {
      await navigator.clipboard.writeText(kit.primary_reply);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <section className="launchPublicSection launchCommunityReply" id="community-reply">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <MessageSquareReply size={16} />
            커뮤니티 구매 답변
          </div>
          <h2>“이 견적 어때요?” 질문을 안전한 답글과 증거 요청으로 바꿉니다.</h2>
          <p>
            커뮤니티, 카톡, 팀 채팅에 바로 붙여 넣을 수 있는 답글을 만들고, 결제 전 빠진
            증거를 구매 여정으로 이어줍니다.
          </p>
        </div>
        <span className="pill warn">reply kit</span>
      </div>

      <div className="launchCommunityReplyGrid">
        <article className="launchCommunityReplyForm">
          <div className="launchCommunityReplyControls">
            <label>
              카테고리
              <select
                value={form.category}
                onChange={(event) => update("category", event.target.value as Category)}
              >
                <option value="desktop_pc">데스크톱 PC</option>
                <option value="laptop">노트북</option>
              </select>
            </label>
            <label>
              채널
              <select value={form.channel} onChange={(event) => update("channel", event.target.value)}>
                <option value="community">커뮤니티</option>
                <option value="kakao">카카오톡</option>
                <option value="team">팀 채팅</option>
              </select>
            </label>
          </div>
          <label>
            질문
            <textarea
              rows={2}
              value={form.buyerQuestion}
              onChange={(event) => update("buyerQuestion", event.target.value)}
            />
          </label>
          <div className="launchCommunityReplyControls">
            <label>
              제품명
              <input
                value={form.productTitle}
                onChange={(event) => update("productTitle", event.target.value)}
              />
            </label>
            <label>
              판매자
              <input value={form.sellerName} onChange={(event) => update("sellerName", event.target.value)} />
            </label>
          </div>
          <label>
            후보 요약
            <textarea
              rows={4}
              value={form.candidateSummary}
              onChange={(event) => update("candidateSummary", event.target.value)}
            />
          </label>
          <div className="launchCommunityReplyControls dense">
            <label>
              예산
              <input inputMode="numeric" value={form.budget} onChange={(event) => update("budget", event.target.value)} />
            </label>
            <label>
              최종가
              <input
                inputMode="numeric"
                value={form.finalPrice}
                onChange={(event) => update("finalPrice", event.target.value)}
              />
            </label>
            <label>
              용도
              <input
                value={form.usageContext}
                onChange={(event) => update("usageContext", event.target.value)}
              />
            </label>
          </div>
          <div className="launchCommunityReplyControls">
            <label>
              리스크 메모
              <textarea rows={4} value={form.riskNotes} onChange={(event) => update("riskNotes", event.target.value)} />
            </label>
            <label>
              준비 증거
              <textarea
                rows={4}
                value={form.readyEvidence}
                onChange={(event) => update("readyEvidence", event.target.value)}
              />
            </label>
          </div>
          <label>
            누락 증거
            <textarea
              rows={3}
              value={form.missingEvidence}
              onChange={(event) => update("missingEvidence", event.target.value)}
            />
          </label>

          <button className="primaryButton" type="button" onClick={buildKit} disabled={status === "loading"}>
            {status === "loading" ? <LoaderCircle size={17} className="spinIcon" /> : <MessageSquareReply size={17} />}
            답글 만들기
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">커뮤니티 답글을 만들지 못했습니다. 입력값과 서버 상태를 확인하세요.</p>
          ) : null}
        </article>

        <article className="launchCommunityReplyResult" aria-live="polite">
          {kit ? (
            <>
              <div className={`launchCommunityReplyScore ${tone(kit.reply_status)}`}>
                <span>{labelFor(kit.reply_status)}</span>
                <strong>{Math.round(kit.reply_score)}점</strong>
                <small>{kit.community_channel}</small>
              </div>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchCommunityReplyPrimary">
                <strong>복사용 답글</strong>
                <span>{kit.primary_reply}</span>
              </div>
              <div className="launchCommunityReplyCards">
                {kit.reply_cards.map((card) => (
                  <article className={tone(card.status)} key={card.card_id}>
                    <span>
                      {iconFor(card.status)}
                      {card.label}
                    </span>
                    <strong>{card.use_when}</strong>
                    <small>{card.copy_text}</small>
                  </article>
                ))}
              </div>
              <div className="launchCommunityReplyColumns">
                <div>
                  <strong>증거 요청</strong>
                  <ul>
                    {kit.evidence_requests.slice(0, 5).map((item) => (
                      <li key={item.evidence_id}>{item.request_text}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>게시 규칙</strong>
                  <ul>
                    {kit.posting_rules.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="primaryButton"
                  handoff={{
                    source: "community-reply-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: payloadFromForm(form).budget_krw,
                    purpose: "community_purchase_reply",
                    must_haves: kit.evidence_requests.slice(0, 3).map((item) => item.label),
                    exclusions: kit.risk_flags,
                  }}
                  eventLabel="launch_community_reply_analysis"
                  eventSurface="launch_community_reply"
                >
                  분석으로 넘기기
                </LaunchAnalysisLink>
                <button className="secondaryLaunchButton" type="button" onClick={copyReply}>
                  <Copy size={16} />
                  답글 복사
                </button>
              </div>
              {copyStatus === "copied" ? <p className="launchPersonaError success">복사했습니다.</p> : null}
              {copyStatus === "error" ? (
                <p className="launchPersonaError">클립보드 권한이 없어 답글을 복사하지 못했습니다.</p>
              ) : null}
            </>
          ) : (
            <div className="launchCommunityReplyEmpty">
              <MessageSquareReply size={32} />
              <h3>견적 질문에 바로 답할 수 있는 문구를 만듭니다.</h3>
              <p>
                가격만 보고 추천하지 않고, 최종가, 옵션명, 반품/AS, 후기 리스크를 같이 확인하는
                답글을 생성합니다.
              </p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
