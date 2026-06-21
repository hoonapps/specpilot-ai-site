"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  LoaderCircle,
  MessageSquareQuote,
  ShieldAlert,
  Vote,
} from "lucide-react";
import type {
  Category,
  PublicReviewerQuickCardKit,
  ReviewerQuickCardRequest,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  buyerDecision: string;
  finalPrice: string;
  budget: string;
  confidencePercent: string;
  blockerCount: string;
  warningCount: string;
  keyReasons: string;
  watchouts: string;
  missingEvidence: string;
  reviewerRole: string;
  reviewDeadline: string;
  shareChannel: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  buyerDecision: "verify",
  finalPrice: "2165000",
  budget: "2200000",
  confidencePercent: "76",
  blockerCount: "0",
  warningCount: "2",
  keyReasons: "QHD 편집 목적에 GPU/RAM이 맞음\n예산 안\n국내 AS",
  watchouts: "배송 예정일\n카드 할인 조건",
  missingEvidence: "AS 조건\n배송 예정일",
  reviewerRole: "family",
  reviewDeadline: "오늘 22시 전",
  shareChannel: "kakao",
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function payloadFromForm(form: FormState): ReviewerQuickCardRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    buyer_decision: form.buyerDecision,
    final_price_krw: parseNumber(form.finalPrice),
    budget_krw: parseNumber(form.budget),
    confidence_percent: parseNumber(form.confidencePercent) ?? 0,
    blocker_count: parseNumber(form.blockerCount) ?? 0,
    warning_count: parseNumber(form.warningCount) ?? 0,
    key_reasons: lines(form.keyReasons),
    watchouts: lines(form.watchouts),
    missing_evidence: lines(form.missingEvidence),
    reviewer_role: form.reviewerRole,
    review_deadline: form.reviewDeadline,
    share_channel: form.shareChannel,
    source: "launch_reviewer_quick_card",
  };
}

function tone(status: string) {
  if (status === "ok" || status === "ready") {
    return "ok";
  }
  return status === "blocker" || status === "hold" ? "danger" : "warn";
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

function won(value: number | null) {
  if (value === null) {
    return "미입력";
  }
  return `${value.toLocaleString("ko-KR")}원`;
}

export function ReviewerQuickCardPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicReviewerQuickCardKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/reviewer-quick-card-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`reviewer quick card ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicReviewerQuickCardKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("reviewer quick card rejected");
      }
      setKit(payload.kit);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function copyText(text: string | undefined) {
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  const request = payloadFromForm(form);

  return (
    <section className="launchPublicSection launchReviewerQuick" id="reviewer-quick-card">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Vote size={16} />
            30초 검토
          </div>
          <h2>가족, 팀, 커뮤니티가 승인·증거 요청·반대 중 하나로 바로 답할 수 있게 만듭니다.</h2>
          <p>
            구매 실행 계획을 공유하기 전에 검토자가 봐야 할 예산, 증거, 리스크를 짧은 카드로
            압축하고 복사용 답장 문구를 제공합니다.
          </p>
        </div>
        <span className="pill warn">공유 검토</span>
      </div>

      <div className="launchReviewerQuickGrid">
        <article className="launchReviewerQuickForm">
          <div className="launchReviewerQuickControls">
            <label>
              카테고리
              <select value={form.category} onChange={(event) => update("category", event.target.value as Category)}>
                <option value="desktop_pc">데스크톱 PC</option>
                <option value="laptop">노트북</option>
              </select>
            </label>
            <label>
              구매자 판단
              <select value={form.buyerDecision} onChange={(event) => update("buyerDecision", event.target.value)}>
                <option value="verify">확인 후 구매</option>
                <option value="buy_now">바로 구매</option>
                <option value="hold">보류</option>
              </select>
            </label>
          </div>
          <div className="launchReviewerQuickControls">
            <label>
              제품명
              <input value={form.productTitle} onChange={(event) => update("productTitle", event.target.value)} />
            </label>
            <label>
              검토 기한
              <input value={form.reviewDeadline} onChange={(event) => update("reviewDeadline", event.target.value)} />
            </label>
          </div>
          <div className="launchReviewerQuickControls dense">
            <label>
              최종가
              <input inputMode="numeric" value={form.finalPrice} onChange={(event) => update("finalPrice", event.target.value)} />
            </label>
            <label>
              예산
              <input inputMode="numeric" value={form.budget} onChange={(event) => update("budget", event.target.value)} />
            </label>
            <label>
              확신도
              <input inputMode="numeric" value={form.confidencePercent} onChange={(event) => update("confidencePercent", event.target.value)} />
            </label>
          </div>
          <div className="launchReviewerQuickControls dense">
            <label>
              blocker
              <input inputMode="numeric" value={form.blockerCount} onChange={(event) => update("blockerCount", event.target.value)} />
            </label>
            <label>
              warning
              <input inputMode="numeric" value={form.warningCount} onChange={(event) => update("warningCount", event.target.value)} />
            </label>
            <label>
              공유 채널
              <select value={form.shareChannel} onChange={(event) => update("shareChannel", event.target.value)}>
                <option value="kakao">카카오톡</option>
                <option value="slack">Slack</option>
                <option value="community">커뮤니티</option>
              </select>
            </label>
          </div>
          <div className="launchReviewerQuickControls">
            <label>
              핵심 근거
              <textarea rows={4} value={form.keyReasons} onChange={(event) => update("keyReasons", event.target.value)} />
            </label>
            <label>
              남은 확인점
              <textarea rows={4} value={form.watchouts} onChange={(event) => update("watchouts", event.target.value)} />
            </label>
          </div>
          <label>
            누락 증거
            <textarea rows={3} value={form.missingEvidence} onChange={(event) => update("missingEvidence", event.target.value)} />
          </label>
          <button className="primaryButton" type="button" onClick={() => void buildKit()} disabled={status === "loading"}>
            {status === "loading" ? <LoaderCircle size={18} /> : <MessageSquareQuote size={18} />}
            30초 검토 카드 생성
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              30초 검토 카드를 만들지 못했습니다. 가격, 리스크, 누락 증거를 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchReviewerQuickResult" aria-live="polite">
          {kit ? (
            <>
              <span className={`pill ${tone(kit.review_status)}`}>{kit.review_status}</span>
              <h3>{kit.headline}</h3>
              <p>{kit.buyer_summary}</p>
              <div className="launchReviewerQuickScore">
                <strong>{kit.review_score}점</strong>
                <span>{kit.reviewer_instruction}</span>
              </div>
              <div className="launchReviewerQuickVotes">
                {kit.vote_options.map((option) => (
                  <article className={tone(option.status)} key={option.vote_id}>
                    <span>
                      {iconFor(option.status)}
                      {option.label}
                    </span>
                    <p>{option.description}</p>
                    <button type="button" onClick={() => void copyText(option.reply_text)}>
                      <Copy size={15} />
                      답장 복사
                    </button>
                  </article>
                ))}
              </div>
              <div className="launchReviewerQuickChecks">
                {kit.risk_checks.map((check) => (
                  <article className={tone(check.status)} key={check.check_id}>
                    <span>
                      {iconFor(check.status)}
                      {check.label}
                    </span>
                    <p>{check.evidence}</p>
                    <small>{check.reviewer_action}</small>
                  </article>
                ))}
              </div>
              <div className="launchReviewerQuickColumns">
                <div>
                  <strong>검토 질문</strong>
                  <ul>
                    {kit.reviewer_questions.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>필수 증거</strong>
                  <ul>
                    {kit.required_evidence.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "reviewer-quick-card-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: request.budget_krw ?? undefined,
                    purpose: kit.product_title,
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" onClick={() => void copyText(kit.share_copy)}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "검토 카드 복사"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 검토 문구를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill warn">응답 마찰 제거</span>
              <h3>긴 리포트를 보내기 전에 검토자가 바로 누를 수 있는 답변 카드를 만듭니다.</h3>
              <p>
                승인, 증거 요청, 반대/보류 응답을 같은 카드에서 제공해 공유받은 사람이
                “좋아 보여”가 아니라 구체적인 검토 결과를 남기게 합니다.
              </p>
              <ul>
                <li>예산, 증거, 리스크를 30초 체크로 압축합니다.</li>
                <li>조건부 승인과 반대 문구를 바로 복사합니다.</li>
                <li>구매 실행 패키지의 reviewer gate에 붙일 수 있습니다.</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
