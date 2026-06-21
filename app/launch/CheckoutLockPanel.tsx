"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  LoaderCircle,
  LockKeyhole,
  Send,
  ShieldAlert,
} from "lucide-react";
import type {
  Category,
  CheckoutLockRequest,
  PublicCheckoutLockKit,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  budget: string;
  candidateId: string;
  lockedTitle: string;
  lockedSeller: string;
  lockedPrice: string;
  cpu: string;
  gpu: string;
  ramGb: string;
  storageGb: string;
  osName: string;
  warrantyMonths: string;
  returnDays: string;
  checkoutTitle: string;
  checkoutSeller: string;
  checkoutOptions: string;
  checkoutTotal: string;
  quantity: string;
  paymentMethod: string;
  evidenceText: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  budget: "2200000",
  candidateId: "candidate_a",
  lockedTitle: "Creator RTX 4070 SUPER Build",
  lockedSeller: "PC Mall",
  lockedPrice: "2165000",
  cpu: "Ryzen 7 7800X3D",
  gpu: "RTX 4070 SUPER",
  ramGb: "32",
  storageGb: "1000",
  osName: "Windows 11",
  warrantyMonths: "24",
  returnDays: "14",
  checkoutTitle: "Creator RTX 4070 SUPER Build",
  checkoutSeller: "PC Mall",
  checkoutOptions: "Ryzen 7 7800X3D / RTX 4070 SUPER / RAM 32GB / SSD 1TB / Windows 11",
  checkoutTotal: "2150000",
  quantity: "1",
  paymentMethod: "카드 결제",
  evidenceText: "재고 있음, 오늘 출고, AS 24개월, 반품 14일, 무료배송",
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function payloadFromForm(form: FormState): CheckoutLockRequest {
  return {
    category: form.category,
    budget_krw: parseNumber(form.budget) ?? 2_200_000,
    locked_candidate: {
      candidate_id: form.candidateId,
      title: form.lockedTitle,
      seller_name: form.lockedSeller,
      locked_price_krw: parseNumber(form.lockedPrice) ?? 0,
      cpu: form.cpu,
      gpu: form.gpu,
      ram_gb: parseNumber(form.ramGb),
      storage_gb: parseNumber(form.storageGb),
      os_name: form.osName,
      warranty_months: parseNumber(form.warrantyMonths),
      return_window_days: parseNumber(form.returnDays),
      evidence_locked: [],
    },
    checkout_title: form.checkoutTitle,
    checkout_seller_name: form.checkoutSeller,
    checkout_option_text: form.checkoutOptions,
    checkout_total_krw: parseNumber(form.checkoutTotal),
    checkout_quantity: parseNumber(form.quantity) ?? 1,
    shipping_fee_krw: 0,
    coupon_discount_krw: 0,
    payment_method: form.paymentMethod,
    evidence_text: form.evidenceText,
    source: "launch_checkout_lock",
  };
}

function money(value: number | null) {
  return value == null ? "미입력" : `${value.toLocaleString("ko-KR")}원`;
}

function tone(status: string) {
  if (status === "ok" || status === "locked") {
    return "ok";
  }
  return status === "blocker" || status === "blocked" ? "danger" : "warn";
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

export function CheckoutLockPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicCheckoutLockKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/checkout-lock-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`checkout lock ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicCheckoutLockKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("checkout lock rejected");
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
    <section className="launchPublicSection launchCheckoutLock" id="checkout-lock">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <LockKeyhole size={16} />
            체크아웃 잠금
          </div>
          <h2>고른 1순위가 결제 화면에서 바뀌지 않았는지 잠급니다.</h2>
          <p>
            후보 비교의 상품명, 판매자, 잠금가, 사양, 보증/반품 기준을 결제 직전 화면과
            대조해 조건 변경, 수량 실수, 증거 누락을 차단합니다.
          </p>
        </div>
        <span className="pill warn">결제 버튼 직전</span>
      </div>

      <div className="launchCheckoutLockGrid">
        <article className="launchCheckoutLockForm">
          <div className="launchCheckoutLockControls">
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
              잠금가
              <input
                value={form.lockedPrice}
                onChange={(event) => update("lockedPrice", event.target.value)}
              />
            </label>
            <label>
              최종 결제 금액
              <input
                value={form.checkoutTotal}
                onChange={(event) => update("checkoutTotal", event.target.value)}
              />
            </label>
          </div>

          <div className="launchCheckoutLockColumns">
            <div>
              <strong>후보 비교 잠금 기준</strong>
              <label>
                상품명
                <input
                  value={form.lockedTitle}
                  onChange={(event) => update("lockedTitle", event.target.value)}
                />
              </label>
              <label>
                판매자
                <input
                  value={form.lockedSeller}
                  onChange={(event) => update("lockedSeller", event.target.value)}
                />
              </label>
              <div className="launchCheckoutLockMiniGrid">
                <label>
                  CPU
                  <input value={form.cpu} onChange={(event) => update("cpu", event.target.value)} />
                </label>
                <label>
                  GPU
                  <input value={form.gpu} onChange={(event) => update("gpu", event.target.value)} />
                </label>
                <label>
                  RAM
                  <input value={form.ramGb} onChange={(event) => update("ramGb", event.target.value)} />
                </label>
                <label>
                  SSD
                  <input
                    value={form.storageGb}
                    onChange={(event) => update("storageGb", event.target.value)}
                  />
                </label>
              </div>
            </div>
            <div>
              <strong>최종 결제 화면</strong>
              <label>
                결제 화면 상품명
                <input
                  value={form.checkoutTitle}
                  onChange={(event) => update("checkoutTitle", event.target.value)}
                />
              </label>
              <label>
                결제 화면 판매자
                <input
                  value={form.checkoutSeller}
                  onChange={(event) => update("checkoutSeller", event.target.value)}
                />
              </label>
              <label>
                결제 화면 옵션명
                <textarea
                  value={form.checkoutOptions}
                  onChange={(event) => update("checkoutOptions", event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="launchCheckoutLockControls compact">
            <label>
              OS
              <input value={form.osName} onChange={(event) => update("osName", event.target.value)} />
            </label>
            <label>
              보증 개월
              <input
                value={form.warrantyMonths}
                onChange={(event) => update("warrantyMonths", event.target.value)}
              />
            </label>
            <label>
              반품 일수
              <input
                value={form.returnDays}
                onChange={(event) => update("returnDays", event.target.value)}
              />
            </label>
            <label>
              수량
              <input value={form.quantity} onChange={(event) => update("quantity", event.target.value)} />
            </label>
          </div>

          <label>
            배송/재고/AS/반품 증거
            <textarea
              value={form.evidenceText}
              onChange={(event) => update("evidenceText", event.target.value)}
            />
          </label>

          <button className="primaryButton" type="button" onClick={buildKit} disabled={status === "loading"}>
            {status === "loading" ? <LoaderCircle className="spin" size={16} /> : <Send size={16} />}
            체크아웃 잠금 검수
          </button>
          {status === "error" ? <p className="formError">잠금 검수를 생성하지 못했습니다.</p> : null}
        </article>

        <article className="launchCheckoutLockResult">
          {kit ? (
            <>
              <div className="launchCheckoutLockHero">
                <span className={`pill ${tone(kit.lock_status)}`}>{kit.lock_status}</span>
                <strong>{kit.lock_score}점</strong>
                <small>잠금가 대비 {money(kit.price_delta_krw)}</small>
              </div>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>

              <div className="launchCheckoutLockChecks">
                {kit.checks.slice(0, 8).map((check) => (
                  <div key={check.check_id} className={`launchCheckoutLockCheck ${tone(check.status)}`}>
                    <span>{iconFor(check.status)}</span>
                    <div>
                      <strong>{check.label}</strong>
                      <small>
                        기준 {check.locked} · 현재 {check.observed}
                      </small>
                      <p>{check.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="launchCheckoutLockColumns">
                <div>
                  <strong>중단 조건</strong>
                  <ul>
                    {kit.stop_conditions.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>결제 전 캡처</strong>
                  <ul>
                    {kit.capture_checklist.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="launchCheckoutLockActions">
                <LaunchAnalysisLink
                  className="primaryButton"
                  handoff={{
                    source: "checkout-lock-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: payloadFromForm(form).budget_krw,
                    purpose: "checkout_lock",
                  }}
                >
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
              <LockKeyhole size={24} />
              <strong>1순위 후보와 최종 결제 화면을 같은 기준으로 잠그세요.</strong>
              <p>상품명, 판매자, 사양, 최종가가 바뀌면 결제 전 바로 보류 사유로 분리합니다.</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
