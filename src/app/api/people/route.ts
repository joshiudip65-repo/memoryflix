import { NextRequest, NextResponse } from "next/server";
import { mockPeople, getMostConnectedPeople, getPeopleByRelationship } from "@/data/mock";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const sort = searchParams.get("sort");

  let results = [...mockPeople];

  if (type) results = getPeopleByRelationship(type);
  if (sort === "closeness") results = getMostConnectedPeople();

  return NextResponse.json({ people: results });
}
