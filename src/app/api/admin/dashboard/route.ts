import { NextResponse } from "next/server";
import { mockDashboardStats, mockChartData } from "@/data/mock";

export async function GET() {
  return NextResponse.json({
    stats: mockDashboardStats,
    charts: mockChartData,
    lastUpdated: new Date().toISOString(),
  });
}
