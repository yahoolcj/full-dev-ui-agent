import { NextResponse } from "next/server";
import { createFeedback } from "@/lib/db/data";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> },
) {
  const { id, assetId } = await params;
  const body = (await request.json()) as {
    feedback_type: "like" | "dislike";
    feedback_text?: string;
  };

  if (body.feedback_type !== "like" && body.feedback_type !== "dislike") {
    return NextResponse.json({ error: "反馈类型无效。" }, { status: 400 });
  }

  const feedback = await createFeedback(
    assetId,
    id,
    body.feedback_type,
    body.feedback_text,
  );
  return NextResponse.json({ feedback }, { status: 201 });
}
