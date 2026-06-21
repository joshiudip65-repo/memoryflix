import { NextRequest, NextResponse } from "next/server";
import { mockStories } from "@/data/mock";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  let results = [...mockStories];
  if (type) results = results.filter((s) => s.type === type);

  return NextResponse.json({ stories: results });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  return NextResponse.json({
    success: true,
    message: "Story generation initiated",
    storyId: `story-${Date.now()}`,
    generation: {
      status: "processing",
      estimatedTime: 120,
      steps: [
        "Selecting memories",
        "Analyzing emotional arc",
        "Generating transitions",
        "Adding music sync",
        "Rendering final story",
      ],
    },
  });
}
