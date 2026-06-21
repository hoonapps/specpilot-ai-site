"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  LoaderCircle,
  Send,
  ShieldAlert,
  UsersRound,
} from "lucide-react";
import type {
  Category,
  PublicRequirementsConsensusKit,
  RequirementsConsensusRequest,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  budget: string;
  context: string;
  timing: string;
  buyerMust: string;
  buyerBreakers: string;
  approverMust: string;
  approverBreakers: string;
  reviewerMust: string;
  reviewerBreakers: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  budget: "2200000",
  context: "QHD 게임과 영상 편집용 첫 데스크톱",
  timing: "within_14_days",
  buyerMust: "RTX 4070급 GPU\nRAM 32GB",
  buyerBreakers: "해외 리퍼",
  approverMust: "국내 AS\n반품 7일",
  approverBreakers: "반품 불가",
  reviewerMust: "업그레이드 가능\nSSD 1TB",
  reviewerBreakers: "FreeDOS",
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

function payloadFromForm(form: FormState): RequirementsConsensusRequest {
  const budget = parseNumber(form.budget);
  return {
    category: form.category,
    purchase_context: form.context,
    shared_budget_krw: budget,
    target_timing: form.timing,
    stakeholders: [
      {
        name: "구매자",
        role: "owner",
        priority: "high",
        max_budget_krw: budget,
        use_cases: ["QHD 게임", "영상 편집"],
        must_haves: lines(form.buyerMust),
        nice_to_haves: ["Windows 11"],
        deal_breakers: lines(form.buyerBreakers),
        timeline: "within_7_days",
        risk_tolerance: "medium",
      },
      {
        name: "가족/승인자",
        role: "approver",
        priority: "medium",
        max_budget_krw: budget ? Math.max(300_000, budget - 100_000) : null,
        use_cases: ["장기 사용", "실패 비용 방지"],
        must_haves: lines(form.approverMust),
        nice_to_haves: [],
        deal_breakers: lines(form.approverBreakers),
        timeline: "within_14_days",
        risk_tolerance: "low",
      },
      {
        name: "커뮤니티 검토자",
        role: "reviewer",
        priority: "low",
        max_budget_krw: budget ? budget + 100_000 : null,
        use_cases: ["부품 업그레이드", "가격 타이밍"],
        must_haves: lines(form.reviewerMust),
        nice_to_haves: ["가격 대기 가능"],
        deal_breakers: lines(form.reviewerBreakers),
        timeline: "wait_for_discount",
        risk_tolerance: "medium",
      },
    ],
    source: "launch_requirements_consensus",
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

export function RequirementsConsensusPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicRequirementsConsensusKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/requirements-consensus-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`requirements consensus ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicRequirementsConsensusKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("requirements consensus rejected");
      }
      setKit(payload.kit);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function copyShare() {
    if (!kit) {
      return;
    }
    try {
      await navigator.clipboard.writeText(kit.share_copy);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <section className="launchPublicSection launchRequirementsConsensus" id="requirements-consensus">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <UsersRound size={16} />
            구매 조건 합의
          </div>
          <h2>가족, 팀, 커뮤니티 의견을 후보 검색 전에 같은 조건표로 묶습니다.</h2>
          <p>
            예산, 용도, 필수 조건, 제외 조건이 서로 충돌하는지 먼저 보고 합의된 조건을
            분석 요청으로 바로 넘깁니다.
          </p>
        </div>
        <span className="pill ok">분석 전 합의</span>
      </div>

      <div className="launchRequirementsConsensusGrid">
        <article className="launchRequirementsConsensusForm">
          <div className="launchRequirementsConsensusControls">
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
              예산
              <input value={form.budget} onChange={(event) => update("budget", event.target.value)} />
            </label>
            <label>
              구매 일정
              <select value={form.timing} onChange={(event) => update("timing", event.target.value)}>
                <option value="within_7_days">7일 안</option>
                <option value="within_14_days">14일 안</option>
                <option value="within_30_days">30일 안</option>
                <option value="wait_for_discount">할인 대기</option>
              </select>
            </label>
          </div>

          <label>
            구매 맥락
            <input value={form.context} onChange={(event) => update("context", event.target.value)} />
          </label>

          <div className="launchRequirementsStakeholderGrid">
            <label>
              구매자 필수 조건
              <textarea value={form.buyerMust} onChange={(event) => update("buyerMust", event.target.value)} />
            </label>
            <label>
              구매자 제외 조건
              <textarea
                value={form.buyerBreakers}
                onChange={(event) => update("buyerBreakers", event.target.value)}
              />
            </label>
            <label>
              승인자 필수 조건
              <textarea
                value={form.approverMust}
                onChange={(event) => update("approverMust", event.target.value)}
              />
            </label>
            <label>
              승인자 제외 조건
              <textarea
                value={form.approverBreakers}
                onChange={(event) => update("approverBreakers", event.target.value)}
              />
            </label>
            <label>
              커뮤니티 필수 조건
              <textarea
                value={form.reviewerMust}
                onChange={(event) => update("reviewerMust", event.target.value)}
              />
            </label>
            <label>
              커뮤니티 제외 조건
              <textarea
                value={form.reviewerBreakers}
                onChange={(event) => update("reviewerBreakers", event.target.value)}
              />
            </label>
          </div>

          <button className="primaryButton" type="button" onClick={buildKit} disabled={status === "loading"}>
            {status === "loading" ? <LoaderCircle className="spin" size={16} /> : <Send size={16} />}
            조건 합의표 생성
          </button>
          {status === "error" ? <p className="formError">조건 합의표를 생성하지 못했습니다.</p> : null}
        </article>

        <article className="launchRequirementsConsensusResult">
          {kit ? (
            <>
              <div className="launchRequirementsConsensusScore">
                <span className={`pill ${tone(kit.consensus_status)}`}>{kit.consensus_status}</span>
                <strong>{kit.consensus_score}점</strong>
                <small>{kit.budget_krw?.toLocaleString("ko-KR") ?? "예산 미입력"}원</small>
              </div>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>

              <div className="launchRequirementsConsensusColumns">
                <div>
                  <strong>합의된 필수 조건</strong>
                  <ul>
                    {kit.agreed_must_haves.slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>제외 조건</strong>
                  <ul>
                    {kit.agreed_exclusions.slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="launchRequirementsConflictList">
                {kit.conflicts.slice(0, 4).map((conflict) => (
                  <article className={tone(conflict.status)} key={conflict.conflict_id}>
                    <span>
                      {iconFor(conflict.status)}
                      {conflict.issue}
                    </span>
                    <p>{conflict.resolution_rule}</p>
                  </article>
                ))}
              </div>

              <div className="launchRequirementsStakeholders">
                {kit.stakeholders.slice(0, 3).map((stakeholder) => (
                  <article key={stakeholder.name}>
                    <span className={`pill ${tone(stakeholder.status)}`}>{stakeholder.priority}</span>
                    <strong>{stakeholder.name}</strong>
                    <p>{stakeholder.accepted_terms.slice(0, 3).join(" · ")}</p>
                  </article>
                ))}
              </div>

              <div className="launchRequirementsConsensusActions">
                <LaunchAnalysisLink
                  className="primaryButton"
                  handoff={{
                    source: "requirements-consensus-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.recommended_request.category,
                    budget_krw: kit.recommended_request.budget_krw ?? undefined,
                    purpose: kit.recommended_request.purpose,
                    must_haves: kit.recommended_request.must_haves,
                    exclusions: kit.recommended_request.exclusions,
                  }}
                >
                  <ClipboardCheck size={16} />
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" className="secondaryButton" onClick={copyShare}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "공유 문구 복사"}
                </button>
              </div>
              {copyStatus === "error" ? <p className="formError">공유 문구 복사에 실패했습니다.</p> : null}
            </>
          ) : (
            <div className="emptyState">
              <UsersRound size={24} />
              <strong>의견이 갈리기 전에 예산과 제외 조건을 먼저 고정하세요.</strong>
              <p>합의된 조건만 분석 요청으로 넘기면 후보 비교와 승인 브리프가 흔들리지 않습니다.</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
