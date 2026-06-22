import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/google-photos";

const PICKER_BASE = "https://photospicker.googleapis.com/v1";

export async function POST() {
  try {
    const accessToken = await getAccessToken();
    const res = await fetch(`${PICKER_BASE}/sessions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 401 || res.status === 403) {
        return NextResponse.json(
          { error: "need_reauth", message: "Re-authorize Google Photos to use the Picker API.", googleError: errText },
          { status: 401 }
        );
      }
      return NextResponse.json({ error: `Picker API ${res.status}: ${errText}` }, { status: res.status });
    }
    const session = await res.json();
    return NextResponse.json({ sessionId: session.id, pickerUri: session.pickerUri, expireTime: session.expireTime });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("id");
  if (!sessionId) return NextResponse.json({ error: "Missing ?id= param" }, { status: 400 });
  try {
    const accessToken = await getAccessToken();
    const res = await fetch(`${PICKER_BASE}/sessions/${encodeURIComponent(sessionId)}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) { const errText = await res.text(); return NextResponse.json({ error: errText }, { status: res.status }); }
    const session = await res.json();
    return NextResponse.json({ sessionId: session.id, mediaItemsSet: !!session.mediaItemsSet, pickerUri: session.pickerUri });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
