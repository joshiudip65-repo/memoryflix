import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/**
 * GET /api/photos/status
 * Returns connection status, sync stats, and a simple HTML page.
 */
export async function GET() {
  try {
    const db = getDb();

    const [settingsRes, countRes] = await Promise.all([
      db.query(
        `SELECT key, value FROM "Setting" WHERE key IN ('current_user_id','last_sync','google_user_name','google_user_email')`
      ),
      db.query(`SELECT COUNT(*) as total FROM "Memory" WHERE status = 'ACTIVE'`),
    ]);

    const settings: Record<string, string> = {};
    for (const row of settingsRes.rows) settings[row.key] = row.value;

    const total = parseInt(countRes.rows[0]?.total || "0");

    const html = `<!DOCTYPE html>
<html style="background:#000;color:#fff;font-family:system-ui;padding:40px">
<head><title>MemoryFlix — Photos Status</title></head>
<body>
<h1 style="color:#fff;margin-bottom:8px">🎬 MemoryFlix Photos</h1>
${
  settings["current_user_id"]
    ? `<p style="color:#4ade80">✅ Connected as <strong>${settings["google_user_name"]}</strong> (${settings["google_user_email"]})</p>
       <p>📸 <strong>${total}</strong> memories in your library</p>
       ${settings["last_sync"] ? `<p>🕐 Last synced: ${new Date(settings["last_sync"]).toLocaleString()}</p>` : ""}
       <p><a href="/api/photos/sync" style="color:#60a5fa">↻ Sync now</a> · <a href="/home" style="color:#60a5fa">← Back to MemoryFlix</a></p>`
    : `<p style="color:#f87171">❌ Not connected yet</p>
       <p><a href="/api/photos/setup" style="background:#1a73e8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:8px">Connect Google Photos →</a></p>`
}
</body></html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
