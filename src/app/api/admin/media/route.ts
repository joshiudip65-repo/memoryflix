import { NextRequest, NextResponse } from "next/server";
import { mockMemories } from "@/data/mock";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "50");
  const type = searchParams.get("type");
  const status = searchParams.get("status");

  let results = [...mockMemories];
  if (type) results = results.filter((m) => m.mediaType === type);
  if (status) results = results.filter((m) => m.status === status);

  const total = results.length;
  const paginated = results.slice((page - 1) * perPage, page * perPage);

  return NextResponse.json({
    media: paginated,
    pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
  });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { memoryIds } = body;

  return NextResponse.json({
    success: true,
    message: `${memoryIds?.length || 0} items moved to trash`,
    deletedIds: memoryIds,
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  return NextResponse.json({
    success: true,
    message: "Media items updated",
    updates: body,
  });
}
