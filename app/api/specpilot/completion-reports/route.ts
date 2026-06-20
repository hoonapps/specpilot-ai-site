import { NextResponse } from "next/server";
import { getJson, postJson } from "../_client";
import type {
  CompletionRecipientGroup,
  CompletionReportBatch,
  CompletionReportPreview,
  CompletionReportTemplate,
  CompletionReportWorkflowRequest,
  CompletionReportWorkflowResponse,
} from "../../../types";

export async function GET() {
  try {
    const batches = await getJson<CompletionReportBatch[]>(
      "/reports/completion-batches?limit=10",
    );
    return NextResponse.json({
      ok: true,
      batches,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "완료 리포트 batch 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as CompletionReportWorkflowRequest;

  try {
    const template = await postJson<CompletionReportTemplate>(
      "/reports/completion-templates",
      {
        name: payload.template_name,
        channel: payload.channel,
        subject: payload.subject,
        body: payload.body,
        enabled: true,
      },
    );
    const recipientGroup = await postJson<CompletionRecipientGroup>(
      "/reports/completion-recipient-groups",
      {
        name: payload.recipient_group_name,
        channel: payload.channel,
        recipients: payload.recipients,
        unsubscribed_recipients: payload.unsubscribed_recipients,
        unsubscribe_policy: "exclude_unsubscribed",
        enabled: true,
        description: "SpecPilot AI 웹사이트 완료 리포트 수신자 그룹",
      },
    );
    const preview = await postJson<CompletionReportPreview>(
      "/reports/completion-preview",
      {
        report_id: payload.report_id,
        channel: payload.channel,
        template_id: template.template_id,
        recipient_group_id: recipientGroup.group_id,
        respect_unsubscribe: payload.respect_unsubscribe,
      },
    );
    const batch = await postJson<CompletionReportBatch>(
      "/reports/completion-batches",
      {
        report_ids: [payload.report_id],
        channel: payload.channel,
        template_id: template.template_id,
        recipient_group_id: recipientGroup.group_id,
        respect_unsubscribe: payload.respect_unsubscribe,
        dry_run: payload.dry_run,
        note: payload.note,
      },
    );
    const recentBatches = await getJson<CompletionReportBatch[]>(
      "/reports/completion-batches?limit=10",
    );

    return NextResponse.json<{
      ok: true;
      workflow: CompletionReportWorkflowResponse;
    }>({
      ok: true,
      workflow: {
        template,
        recipient_group: recipientGroup,
        preview,
        batch,
        recent_batches: recentBatches,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "완료 리포트 발송 준비에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
