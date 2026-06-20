"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  LoaderCircle,
  MessageSquareText,
  Send,
  ShieldAlert,
} from "lucide-react";
import type {
  Category,
  PublicPurchaseApprovalBriefKit,
  PurchaseApprovalBriefRequest,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  verdict: "ready" | "verify" | "hold";
  budget: string;
  cartTotal: string;
  blockerCount: string;
  warningCount: string;
  keyReasons: string;
  missingEvidence: string;
  audience: string;
  deadline: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  verdict: "verify",
  budget: "2200000",
  cartTotal: "2185000",
  blockerCount: "0",
  warningCount: "2",
  keyReasons: "QHD 편집과 게임 목적에 GPU/RAM은 맞음\n배송 예정일과 AS 답변은 캡처 필요",
  missingEvidence: "배송 예정일\nAS 조건",
  audience: "family",
  deadline: "오늘 22시 전",
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function lines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function payloadFromForm(form: FormState): PurchaseApprovalBriefRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    verdict: form.verdict,
    budget_krw: parseNumber(form.budget) ?? 2_200_000,
    cart_total_krw: parseNumber(form.cartTotal),
    blocker_count: parseNumber(form.blockerCount) ?? 0,
    warning_count: parseNumber(form.warningCount) ?? 0,
    key_reasons: lines(form.keyReasons),
    missing_evidence: lines(form.missingEvidence),
    audience: form.audience,
    decision_deadline: form.deadline,
    source: "launch_purchase_approval_brief",
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

export function PurchaseApprovalBriefPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicPurchaseApprovalBriefKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildBrief() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/purchase-approval-brief-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`purchase approval brief ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicPurchaseApprovalBriefKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("purchase approval brief rejected");
      }
      setKit(payload.kit);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function copyShare(copyText?: string) {
    const text = copyText ?? kit?.share_copy;
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

  return (
    <section className="launchPublicSection launchApprovalBrief" id="approval-brief">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <ClipboardCheck size={16} />
            구매 승인 브리프
          </div>
          <h2>결제 전 30초 승인 질문으로 바꿉니다.</h2>
          <p>
            검수 결과를 가족, 팀, 커뮤니티에 보낼 수 있는 찬성/반대 투표 문구와 승인 조건으로
            압축합니다.
          </p>
        </div>
        <span className="pill warn">공유 승인</span>
      </div>

      <div className="launchApprovalGrid">
        <article className="launchApprovalForm">
          <div className="launchApprovalControls">
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
              판정
              <select
                value={form.verdict}
                onChange={(event) => update("verdict", event.target.value as FormState["verdict"])}
              >
                <option value="ready">승인 가능</option>
                <option value="verify">확인 필요</option>
                <option value="hold">결제 보류</option>
              </select>
            </label>
            <label>
              공유 대상
              <select value={form.audience} onChange={(event) => update("audience", event.target.value)}>
                <option value="family">가족/지인</option>
                <option value="team">팀 승인</option>
                <option value="community">커뮤니티</option>
                <option value="self">본인 체크</option>
              </select>
            </label>
          </div>
          <label>
            후보명
            <input
              value={form.productTitle}
              onChange={(event) => update("productTitle", event.target.value)}
            />
          </label>
          <div className="launchApprovalControls dense">
            <label>
              예산
              <input
                inputMode="numeric"
                value={form.budget}
                onChange={(event) => update("budget", event.target.value)}
              />
            </label>
            <label>
              총액
              <input
                inputMode="numeric"
                value={form.cartTotal}
                onChange={(event) => update("cartTotal", event.target.value)}
              />
            </label>
            <label>
              Blocker
              <input
                inputMode="numeric"
                value={form.blockerCount}
                onChange={(event) => update("blockerCount", event.target.value)}
              />
            </label>
            <label>
              Warning
              <input
                inputMode="numeric"
                value={form.warningCount}
                onChange={(event) => update("warningCount", event.target.value)}
              />
            </label>
          </div>
          <label>
            핵심 근거
            <textarea
              rows={3}
              value={form.keyReasons}
              onChange={(event) => update("keyReasons", event.target.value)}
            />
          </label>
          <div className="launchApprovalControls dense">
            <label>
              누락 증거
              <textarea
                rows={3}
                value={form.missingEvidence}
                onChange={(event) => update("missingEvidence", event.target.value)}
              />
            </label>
            <label>
              승인 마감
              <input value={form.deadline} onChange={(event) => update("deadline", event.target.value)} />
            </label>
          </div>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void buildBrief()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <Send size={18} />}
            승인 브리프 생성
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              구매 승인 브리프를 만들지 못했습니다. 입력값을 확인하고 다시 시도하세요.
            </p>
          ) : null}
        </article>

        <article className="launchApprovalResult" aria-live="polite">
          {kit ? (
            <>
              <span className={`pill ${tone(kit.priority)}`}>{kit.priority}</span>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchApprovalQuestion">
                <MessageSquareText size={18} />
                <strong>{kit.approval_question}</strong>
                <small>{kit.decision_rule}</small>
              </div>
              <div className="launchApprovalVoteGrid">
                {kit.vote_options.map((option) => (
                  <article className={option.status} key={option.option_id}>
                    <span>{iconFor(option.status)} {option.label}</span>
                    <p>{option.description}</p>
                    <small>{option.when_to_choose}</small>
                  </article>
                ))}
              </div>
              <div className="launchApprovalEvidence">
                <div>
                  <strong>승인 조건</strong>
                  <ul>
                    {kit.approve_conditions.slice(0, 4).map((condition) => (
                      <li key={condition}>{condition}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>반대 사유</strong>
                  <ul>
                    {kit.reject_reasons.slice(0, 4).map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchApprovalCopyGrid">
                {kit.copy_variants.map((variant) => (
                  <button
                    type="button"
                    key={variant.channel}
                    onClick={() => void copyShare(variant.copy_text)}
                  >
                    <Copy size={16} />
                    <span>{variant.label}</span>
                    <small>{variant.cta_label}</small>
                  </button>
                ))}
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "purchase-approval-brief-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: payloadFromForm(form).budget_krw,
                    purpose: kit.product_title,
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" onClick={() => void copyShare()}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "전체 브리프 복사"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 승인 브리프를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill warn">승인 전 공유</span>
              <h3>긴 검수 결과를 찬성/반대 한 줄 답변으로 줄입니다.</h3>
              <p>
                구매 후보, 총액, blocker/warning, 누락 증거를 넣으면 승인 질문과 채널별 복사
                문구가 만들어집니다.
              </p>
              <ul>
                <li>가족에게는 쉽게, 팀에는 승인 기준 중심으로 보냅니다.</li>
                <li>커뮤니티에는 반대 사유를 받을 수 있는 문구로 바꿉니다.</li>
                <li>승인 조건을 분석 prefill로 넘겨 최종 리포트를 이어서 만듭니다.</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
