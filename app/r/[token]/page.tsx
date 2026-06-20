import {
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getJson, productPublicUrl } from "../../api/specpilot/_client";
import type { PublicReport } from "../../types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

function won(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "확인 필요";
  }
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
}

function statusTone(status: string | undefined) {
  if (status === "ok") {
    return "ok";
  }
  if (status === "blocker") {
    return "danger";
  }
  return "warn";
}

async function loadPublicReport(token: string) {
  try {
    return await getJson<PublicReport>(
      `/public/reports/${encodeURIComponent(token)}`,
    );
  } catch {
    notFound();
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params;
  const report = await loadPublicReport(token);

  return {
    title: `${report.title} | SpecPilot AI`,
    description:
      report.response.report.share_brief?.copy_text ||
      "SpecPilot AI 공개 구매 검토 리포트",
  };
}

export default async function PublicReportPage({ params }: PageProps) {
  const { token } = await params;
  const report = await loadPublicReport(token);
  const purchase = report.response.report;
  const decision = purchase.purchase_decision;
  const shareBrief = purchase.share_brief;
  const execution = purchase.execution_plan;
  const conversion = report.conversion_cta;
  const top = purchase.top_recommendations[0];
  const dealWindow =
    purchase.deal_windows.find((item) => item.product_id === purchase.final_pick_id) ||
    purchase.deal_windows[0];
  const links = report.purchase_links
    .filter((link) => link.active)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 6);

  return (
    <main className="publicReport">
      <header className="publicHero">
        <div>
          <a className="brand compactBrand" href="/">
            <span className="brandMark">SP</span>
            <span>
              <strong>SpecPilot AI</strong>
              <span>Public purchase report</span>
            </span>
          </a>
          <p className="sectionLabel">공개 구매 검토 리포트</p>
          <h1>{report.title}</h1>
          <p>{purchase.summary}</p>
          <div className="statusRow">
            <span className={`pill ${statusTone(decision?.label)}`}>
              {decision?.label || "판정 대기"}
            </span>
            <span className="pill muted">
              공유 조회 {report.share_views.toLocaleString("ko-KR")}회
            </span>
            <span className="pill muted">{report.shared_at.slice(0, 10)}</span>
          </div>
          <div className="publicHeroActions">
            <a className="primaryButton" href={conversion.primary_path}>
              {conversion.primary_label}
            </a>
            <a className="secondaryLaunchButton" href={conversion.secondary_path}>
              {conversion.secondary_label}
            </a>
          </div>
        </div>
        <aside className="publicHeroCard">
          <span>최종 후보</span>
          <strong>{top?.product.model_name || report.top_model_name || "확인 필요"}</strong>
          <p>{top?.fit_summary || "공유 리포트에서 구매 조건과 후보 근거를 확인하세요."}</p>
          <div className="priceBlock">
            <span>실구매가</span>
            <strong>{won(top?.price.effective_price_krw)}</strong>
          </div>
        </aside>
      </header>

      <section className="publicConversionPanel">
        <div>
          <p className="sectionLabel">Public report conversion</p>
          <h2>{conversion.headline}</h2>
          <p>{conversion.body}</p>
          <div className="statusRow">
            <span className="pill ok">Ref {conversion.report_ref}</span>
            <span className="pill muted">{conversion.source}</span>
            <span className="pill muted">{conversion.surface}</span>
          </div>
          <div className="publicHeroActions">
            <a className="primaryButton" href={conversion.primary_path}>
              {conversion.primary_label}
            </a>
            <a className="secondaryLaunchButton" href={conversion.secondary_path}>
              {conversion.secondary_label}
            </a>
          </div>
        </div>
        <div className="publicConversionLists">
          <div>
            <strong>다음 액션</strong>
            <ul>
              {conversion.next_actions.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>전환 근거</strong>
            <ul>
              {conversion.proof_points.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="publicGrid">
        <article className="publicPanel">
          <div className="sectionLabel">
            <ShieldCheck size={16} />
            구매 판정
          </div>
          <h2>{decision?.label || "판정 대기"}</h2>
          <p>{decision?.reason || purchase.purchase_timing}</p>
          <dl className="sourceMetricGrid">
            <div>
              <dt>확신도</dt>
              <dd>{decision?.confidence ?? 0}점</dd>
            </div>
            <div>
              <dt>후보 수</dt>
              <dd>{purchase.top_recommendations.length}개</dd>
            </div>
          </dl>
          <ul>
            {(decision?.next_steps || []).slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="publicPanel">
          <div className="sectionLabel">
            <ClipboardCheck size={16} />
            공유 브리프
          </div>
          <h2>{shareBrief?.headline || "공유 검토 브리프"}</h2>
          <p>{shareBrief?.copy_text || "결제 전 핵심 근거를 함께 검토하세요."}</p>
          <ul>
            {(shareBrief?.key_reasons || []).slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="publicSection">
        <div className="sectionHeader">
          <div>
            <p className="sectionLabel">TOP 추천 후보</p>
            <h2>가격, 호환성, 리뷰 리스크를 함께 비교합니다</h2>
          </div>
        </div>
        <div className="cards three publicCards">
          {purchase.top_recommendations.slice(0, 3).map((item) => (
            <article className="card" key={item.product.id}>
              <span className="rank">TOP {item.rank}</span>
              <h3>{item.product.model_name}</h3>
              <p>{item.product.option_summary}</p>
              <div className="cardFooter">
                <strong>{won(item.price.effective_price_krw)}</strong>
                <span>{item.score.total_score}점</span>
              </div>
              <ul>
                {(item.purchase_checklist || item.risks || [])
                  .slice(0, 3)
                  .map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="publicSection">
        <div className="sectionHeader">
          <div>
            <p className="sectionLabel">결정 검증</p>
            <h2>대안 시나리오와 스트레스 테스트까지 같이 봅니다</h2>
          </div>
        </div>

        <div className="scenarioGrid publicCards">
          {(purchase.scenario_options || []).map((option) => (
            <article className="scenarioCard" key={option.scenario}>
              <span className="rank">{option.label}</span>
              <h3>{option.model_name}</h3>
              <dl className="miniMetricGrid">
                <div>
                  <dt>실구매가</dt>
                  <dd>{won(option.effective_price_krw)}</dd>
                </div>
                <div>
                  <dt>점수</dt>
                  <dd>{option.total_score}점</dd>
                </div>
              </dl>
              <p>{option.why}</p>
              <small>{option.tradeoff}</small>
            </article>
          ))}
        </div>

        <div className="stressGrid publicCards">
          {(purchase.stress_tests || []).map((item) => (
            <article className="stressCard" key={item.scenario}>
              <div className="answerHeader">
                <span className={`pill ${statusTone(item.status)}`}>
                  {item.label}
                </span>
                <span className="pill muted">{won(item.budget_krw)}</span>
              </div>
              <h3>{item.selected_model_name || "선택 보류"}</h3>
              <p>{item.impact}</p>
              <small>{item.recommendation}</small>
            </article>
          ))}
        </div>

        <div className="criteriaMatrix publicCriteriaMatrix">
          {(purchase.criteria_matches || []).slice(0, 3).map((match) => (
            <article key={match.product_id}>
              <div className="answerHeader">
                <span className="pill ok">충족 {match.matched_count}</span>
                <span className="pill warn">확인 {match.warning_count}</span>
                <span className={`pill ${match.blocker_count ? "danger" : "muted"}`}>
                  차단 {match.blocker_count}
                </span>
              </div>
              <h3>{match.model_name}</h3>
              <p>{match.summary}</p>
              <div className="coverageBar" aria-label={`조건 충족률 ${match.coverage_score}점`}>
                <span style={{ width: `${match.coverage_score}%` }} />
              </div>
              <ul>
                {match.items.slice(0, 3).map((item) => (
                  <li key={`${match.product_id}-${item.check_type}-${item.criterion}`}>
                    {item.criterion} · {item.status} · {item.evidence}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="publicGrid">
        <article className="publicPanel">
          <div className="sectionLabel">
            <TimerReset size={16} />
            구매 타이밍
          </div>
          <h2>{dealWindow?.label || "가격 확인 필요"}</h2>
          <p>{dealWindow?.wait_reason || purchase.purchase_timing}</p>
          <dl className="sourceMetricGrid">
            <div>
              <dt>현재가</dt>
              <dd>{won(dealWindow?.current_price_krw)}</dd>
            </div>
            <div>
              <dt>목표가</dt>
              <dd>{won(dealWindow?.target_price_krw)}</dd>
            </div>
            <div>
              <dt>적정가</dt>
              <dd>{dealWindow?.fair_price_band_krw || "확인 필요"}</dd>
            </div>
            <div>
              <dt>상태</dt>
              <dd>{dealWindow?.status || "warning"}</dd>
            </div>
          </dl>
          <p>{dealWindow?.buy_trigger}</p>
        </article>

        <article className="publicPanel">
          <div className="sectionLabel">
            <CheckCircle2 size={16} />
            구매 실행 패키지
          </div>
          <h2>{execution?.headline || "결제 전 확인"}</h2>
          <p>{execution?.share_message || "최종 결제 금액과 옵션명을 확인하세요."}</p>
          <ul>
            {(execution?.checkout_steps || []).slice(0, 5).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      {links.length ? (
        <section className="publicSection">
          <div className="sectionHeader">
            <div>
              <p className="sectionLabel">구매 링크</p>
              <h2>제휴 여부와 정책 경고를 분리해서 확인합니다</h2>
            </div>
          </div>
          <div className="purchaseLinkGrid">
            {links.map((link) => (
              <article className="purchaseLinkCard" key={link.link_id}>
                <div className="answerHeader">
                  <span className={`pill ${statusTone(link.status)}`}>
                    {link.status}
                  </span>
                  <span className="pill muted">
                    {link.is_affiliate ? "제휴" : "비제휴"}
                  </span>
                </div>
                <h3>{link.seller_name}</h3>
                <p>{link.disclosure}</p>
                <div className="cardFooter">
                  <strong>{won(link.effective_price_krw || link.price_krw)}</strong>
                  <a
                    className="miniCta"
                    href={productPublicUrl(link.click_path)}
                    target="_blank"
                  >
                    판매처 확인 <ExternalLink size={14} />
                  </a>
                </div>
                {link.policy_warnings.length ? (
                  <ul>
                    {link.policy_warnings.slice(0, 3).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="publicSection">
        <div className="sectionHeader">
          <div>
            <p className="sectionLabel">검토 근거</p>
            <h2>공개 리포트에서 바로 확인할 체크포인트</h2>
          </div>
        </div>
        <div className="publicGrid">
          <article className="publicPanel">
            <strong>출처 신뢰</strong>
            <ul>
              {purchase.source_health.slice(0, 5).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="publicPanel">
            <strong>검토 질문</strong>
            <ul>
              {(shareBrief?.reviewer_questions || shareBrief?.watchouts || [])
                .slice(0, 5)
                .map((item) => (
                  <li key={item}>{item}</li>
                ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
