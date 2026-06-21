import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type { CommunityReplyKitRequest, PublicCommunityReplyKit } from "../../../types";

export async function POST(request: Request) {
  let payload: CommunityReplyKitRequest;

  try {
    payload = (await request.json()) as CommunityReplyKitRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "커뮤니티 구매 답변 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicCommunityReplyKit>("/public/community-reply-kit", payload);
    return NextResponse.json({
      ok: true,
      kit,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "공개 커뮤니티 구매 답변 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
