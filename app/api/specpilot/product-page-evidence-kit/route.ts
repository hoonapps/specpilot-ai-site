import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  ProductPageEvidenceRequest,
  PublicProductPageEvidenceKit,
} from "../../../types";

export async function POST(request: Request) {
  let payload: ProductPageEvidenceRequest;

  try {
    payload = (await request.json()) as ProductPageEvidenceRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "상품 페이지 근거 인입 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicProductPageEvidenceKit>(
      "/public/product-page-evidence-kit",
      payload,
    );
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
            : "공개 상품 페이지 근거 인입 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
