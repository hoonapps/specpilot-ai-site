"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Copy,
  LoaderCircle,
  ScanLine,
  ShieldAlert,
} from "lucide-react";
import type {
  Category,
  PublicShoppingCartIntakeKit,
  ShoppingCartIntakeRequest,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  budget: string;
  purpose: string;
  cartText: string;
};

const demoCart = [
  "Ryzen 7 7800X3D 430,000원",
  "RTX 4070 SUPER 12GB 910,000원",
  "DDR5 RAM 32GB 145,000원",
  "NVMe SSD 1TB 110,000원",
  "B650 메인보드 210,000원",
  "750W 파워 120,000원",
  "ATX 케이스 95,000원",
  "Windows 11 Home 160,000원",
].join("\n");

const demoForm: FormState = {
  category: "desktop_pc",
  budget: "2200000",
  purpose: "qhd_creator",
  cartText: demoCart,
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function payloadFromForm(form: FormState): ShoppingCartIntakeRequest {
  return {
    category: form.category,
    cart_text: form.cartText,
    items: [],
    budget_krw: parseNumber(form.budget) ?? 2_200_000,
    purpose: form.purpose,
    source: "launch_shopping_cart_intake",
  };
}

function tone(status: string) {
  if (status === "ok" || status === "ready") {
    return "ok";
  }
  return status === "blocker" || status === "hold" ? "danger" : "warn";
}

function verdictLabel(verdict: string) {
  if (verdict === "ready") {
    return "검수 가능";
  }
  if (verdict === "verify") {
    return "확인 필요";
  }
  return "결제 보류";
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

function money(value: number | null) {
  return value === null ? "미입력" : `${value.toLocaleString("ko-KR")}원`;
}

export function ShoppingCartIntakePanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicShoppingCartIntakeKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function intakeCart() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/shopping-cart-intake-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`shopping cart intake ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicShoppingCartIntakeKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("shopping cart intake rejected");
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
    <section className="launchPublicSection launchCartIntake" id="cart-intake">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <ClipboardList size={16} />
            장바구니 인테이크
          </div>
          <h2>쇼핑몰 장바구니를 그대로 붙여 넣어 검수 흐름으로 바꿉니다.</h2>
          <p>
            여러 부품이나 노트북 후보를 한 번에 넣으면 총액, 예산 차이, 필수 슬롯 누락,
            옵션/사양 검수 prefill을 만듭니다.
          </p>
        </div>
        <span className="pill ok">붙여넣기 시작</span>
      </div>

      <div className="launchCartIntakeGrid">
        <article className="launchCartIntakeForm">
          <div className="launchCartIntakeControls">
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
              <input
                inputMode="numeric"
                value={form.budget}
                onChange={(event) => update("budget", event.target.value)}
              />
            </label>
            <label>
              목적
              <select value={form.purpose} onChange={(event) => update("purpose", event.target.value)}>
                <option value="qhd_creator">QHD 게임·영상 편집</option>
                <option value="portable_creator">휴대형 크리에이터</option>
                <option value="team_office">팀/사무 구매</option>
                <option value="4k_creator">4K 고성능 작업</option>
              </select>
            </label>
          </div>
          <label>
            장바구니 텍스트
            <textarea
              rows={9}
              value={form.cartText}
              onChange={(event) => update("cartText", event.target.value)}
            />
          </label>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void intakeCart()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <ScanLine size={18} />}
            장바구니 읽기
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              장바구니 인테이크를 만들지 못했습니다. 텍스트와 예산을 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchCartIntakeResult" aria-live="polite">
          {kit ? (
            <>
              <span className={`pill ${tone(kit.verdict)}`}>{verdictLabel(kit.verdict)}</span>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchCartIntakeMetrics">
                <div>
                  <span>총액</span>
                  <strong>{money(kit.cart_total_krw)}</strong>
                </div>
                <div>
                  <span>예산 차이</span>
                  <strong>{money(kit.budget_delta_krw)}</strong>
                </div>
                <div>
                  <span>준비도</span>
                  <strong>{Math.round(kit.readiness_score)}점</strong>
                </div>
              </div>
              <div className="launchCartIntakeSlots">
                <div>
                  <strong>확인된 슬롯</strong>
                  <p>{kit.detected_slots.length ? kit.detected_slots.join(", ") : "없음"}</p>
                </div>
                <div>
                  <strong>누락 슬롯</strong>
                  <p>{kit.missing_slots.length ? kit.missing_slots.join(", ") : "없음"}</p>
                </div>
              </div>
              <div className="launchCartIntakeLines">
                {kit.lines.slice(0, 6).map((line) => (
                  <article className={line.status} key={line.line_id}>
                    <span>{iconFor(line.status)} {line.normalized_role}</span>
                    <strong>{line.title}</strong>
                    <p>{line.recommendation}</p>
                    <small>{line.evidence}</small>
                  </article>
                ))}
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "shopping-cart-intake-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: kit.scanner_prefill.budget_krw,
                    purpose: kit.scanner_prefill.product_title,
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" onClick={() => void copyShare()}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "장바구니 공유"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 장바구니 요약을 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill warn">여러 항목 지원</span>
              <h3>부품 하나씩 묻기 전에 장바구니 전체를 먼저 정리하세요.</h3>
              <p>
                항목명과 가격이 여러 줄로 있어도 총액, 핵심 부품 누락, 위험 조건을 먼저
                잡아냅니다.
              </p>
              <ul>
                <li>CPU/GPU/RAM/SSD/메인보드/파워/케이스 누락을 확인합니다.</li>
                <li>노트북은 RAM, SSD, OS와 리퍼/해외 조건을 먼저 봅니다.</li>
                <li>결과는 옵션/사양 검수와 승인 브리프로 이어집니다.</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
