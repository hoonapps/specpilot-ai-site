"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ClipboardCheck,
  Loader2,
  Share2,
  Sparkles,
} from "lucide-react";
import type {
  BuyerPersonaQuizAnswer,
  BuyerPersonaQuizResult,
  PublicBuyerPersonaQuiz,
} from "../types";

type QuizEnvelope = {
  ok: boolean;
  quiz?: PublicBuyerPersonaQuiz;
  error?: string;
};

type ResultEnvelope = {
  ok: boolean;
  result?: BuyerPersonaQuizResult;
  error?: string;
};

const categoryLabel = {
  desktop_pc: "데스크톱 PC",
  laptop: "노트북",
};

function hrefFor(path: string) {
  if (path.startsWith("#")) {
    return `/${path}`;
  }
  return path;
}

function checklistHref(path: string) {
  if (path.startsWith("/public/buyer-checklist")) {
    return "/launch#buyer-checklist";
  }
  return hrefFor(path);
}

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function BuyerPersonaQuizPanel() {
  const [quiz, setQuiz] = useState<PublicBuyerPersonaQuiz | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [result, setResult] = useState<BuyerPersonaQuizResult | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "submitting" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  useEffect(() => {
    let cancelled = false;

    async function loadQuiz() {
      try {
        const response = await fetch("/api/specpilot/buyer-persona-quiz", {
          cache: "no-store",
        });
        const payload = (await response.json()) as QuizEnvelope;
        if (!response.ok || !payload.ok || !payload.quiz) {
          throw new Error(payload.error ?? "구매 성향 진단을 불러오지 못했습니다.");
        }
        if (cancelled) {
          return;
        }
        setQuiz(payload.quiz);
        setSelected(
          Object.fromEntries(
            payload.quiz.questions.map((question) => [
              question.question_id,
              question.options[0]?.option_id ?? "",
            ]),
          ),
        );
        setStatus("ready");
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            error instanceof Error
              ? error.message
              : "구매 성향 진단을 불러오지 못했습니다.",
          );
        }
      }
    }

    loadQuiz();

    return () => {
      cancelled = true;
    };
  }, []);

  const answers = useMemo<BuyerPersonaQuizAnswer[]>(() => {
    if (!quiz) {
      return [];
    }
    return quiz.questions
      .map((question) => ({
        question_id: question.question_id,
        option_id: selected[question.question_id],
      }))
      .filter((answer) => answer.option_id);
  }, [quiz, selected]);

  async function submitQuiz() {
    if (!quiz || status === "submitting") {
      return;
    }
    setStatus("submitting");
    setMessage("");
    setCopyStatus("idle");

    try {
      const response = await fetch("/api/specpilot/buyer-persona-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          source: "launch_page",
        }),
      });
      const payload = (await response.json()) as ResultEnvelope;
      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.error ?? "진단 결과를 만들지 못했습니다.");
      }
      setResult(payload.result);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "진단 결과를 만들지 못했습니다.",
      );
    }
  }

  async function copyShareText() {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.share_copy);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <section className="launchPublicSection launchPersonaQuiz">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Sparkles size={16} />
            30초 구매 성향 진단
          </div>
          <h2>{quiz?.headline ?? "내 구매 상황에 맞는 시작점을 먼저 찾습니다"}</h2>
          <p>
            {quiz?.summary ??
              "컴퓨터와 노트북 구매 목적, 위험 요인, 일정, 예산을 빠르게 고르면 분석 요청 문구와 체크리스트가 자동으로 정리됩니다."}
          </p>
        </div>
        <span className="pill ok">
          {result ? `${Math.round(result.confidence_score)}점` : "무료 진단"}
        </span>
      </div>

      {status === "loading" ? (
        <div className="launchPersonaLoading">
          <Loader2 size={18} />
          진단 질문을 불러오는 중
        </div>
      ) : null}

      {message ? <p className="launchPersonaError">{message}</p> : null}

      {quiz ? (
        <div className="launchPersonaQuizBody">
          <div className="launchPersonaQuestionGrid">
            {quiz.questions.map((question) => (
              <article className="launchPersonaQuestion" key={question.question_id}>
                <span>{question.title}</span>
                <p>{question.helper}</p>
                <div className="launchPersonaOptions">
                  {question.options.map((option) => (
                    <button
                      className={
                        selected[question.question_id] === option.option_id
                          ? "active"
                          : ""
                      }
                      key={option.option_id}
                      type="button"
                      aria-pressed={selected[question.question_id] === option.option_id}
                      onClick={() =>
                        setSelected((current) => ({
                          ...current,
                          [question.question_id]: option.option_id,
                        }))
                      }
                    >
                      <strong>{option.label}</strong>
                      <small>{option.description}</small>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="launchPersonaActionRow">
            <button
              className="primaryButton"
              type="button"
              onClick={submitQuiz}
              disabled={status === "submitting"}
            >
              {status === "submitting" ? (
                <Loader2 className="spinIcon" size={18} />
              ) : (
                <ClipboardCheck size={18} />
              )}
              진단 결과 보기
            </button>
            <small>{quiz.next_actions.slice(0, 1).join(" ")}</small>
          </div>

          {result ? (
            <div className="launchPersonaResult" aria-live="polite">
              <div>
                <span className="pill ok">{result.persona_label}</span>
                <h3>{result.headline}</h3>
                <p>{result.summary}</p>
              </div>

              <div className="launchPersonaResultGrid">
                <article>
                  <span>추천 카테고리</span>
                  <strong>{categoryLabel[result.category]}</strong>
                </article>
                <article>
                  <span>예산 기준</span>
                  <strong>{formatWon(result.recommended_budget_krw)}</strong>
                </article>
                <article>
                  <span>권장 플랜</span>
                  <strong>{result.recommended_plan_id}</strong>
                </article>
              </div>

              <div className="launchPersonaPrefill">
                <span>분석 폼에 붙여 넣을 요청</span>
                <p>{result.analysis_prefill}</p>
              </div>

              <div className="launchPersonaColumns">
                <div>
                  <strong>판단 근거</strong>
                  <ul>
                    {result.proof_points.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>다음 액션</strong>
                  <ul>
                    {result.next_actions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="launchPersonaActions">
                <a className="miniCta" href={hrefFor(result.primary_cta_path)}>
                  {result.primary_cta_label}
                  <ArrowRight size={16} />
                </a>
                <a className="miniCta secondary" href={checklistHref(result.checklist_path)}>
                  체크리스트 보기
                </a>
                <button type="button" onClick={copyShareText}>
                  <Share2 size={16} />
                  {copyStatus === "copied"
                    ? "복사 완료"
                    : copyStatus === "failed"
                      ? "복사 실패"
                      : "결과 공유 문구 복사"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
