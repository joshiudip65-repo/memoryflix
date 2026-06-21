import { NextRequest, NextResponse } from "next/server";
import { mockUsers } from "@/data/mock";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const plan = searchParams.get("plan");
  const search = searchParams.get("search");

  let results = [...mockUsers];
  if (role) results = results.filter((u) => u.role === role);
  if (plan) results = results.filter((u) => u.plan === plan);
  if (search) {
    const q = search.toLowerCase();
    results = results.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  return NextResponse.json({ users: results, total: results.length });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { userId, action } = body;

  const actions: Record<string, string> = {
    suspend: "User suspended",
    activate: "User activated",
    resetRecommendations: "Recommendations reset",
    upgradePlan: "Plan upgraded",
  };

  return NextResponse.json({
    success: true,
    message: actions[action] || "User updated",
    userId,
  });
}
