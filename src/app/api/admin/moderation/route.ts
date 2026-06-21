import { NextRequest, NextResponse } from "next/server";
import { mockModerationItems } from "@/data/mock";

export async function GET() {
  return NextResponse.json({
    items: mockModerationItems,
    stats: {
      pending: mockModerationItems.filter((m) => m.status === "pending").length,
      approved: mockModerationItems.filter((m) => m.status === "approved").length,
      rejected: mockModerationItems.filter((m) => m.status === "rejected").length,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { itemId, action, reviewedBy } = body;

  return NextResponse.json({
    success: true,
    message: `Item ${action}`,
    itemId,
    reviewedBy,
    reviewedAt: new Date().toISOString(),
  });
}
