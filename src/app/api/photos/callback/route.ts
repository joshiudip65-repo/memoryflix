import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getGoogleProfile } from "@/lib/google-photos";

/**
 * GET /api/photos/callback
 * Handles the Google OAuth callback.
 * Exchanges the auth code for tokens, creates/updates the user, and triggers a sync.
 */
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || "https://memoryflix-ochre.vercel.app";
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${baseUrl}/api/photos/status?error=${encodeURIComponent(error)}`);
  }
  if (!code) {
    return NextResponse.json({ error: "No auth code in request" }, { status: 400 });
  }

  // Exchange auth code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${baseUrl}/api/photos/callback`,
      grant_type: "authorization_code",
    }).toString(),
  });

  const tokens = await tokenRes.json();
  if (tokens.error) {
    return NextResponse.json(
      { error: tokens.error, description: tokens.error_description },
      { status: 400 }
    );
  }

  // Get user profile
  const profile = await getGoogleProfile(tokens.access_token);
  const db = getDb();

  // Upsert user
  await db.query(
    `INSERT INTO "User" (id, name, email, "avatarUrl", role, plan, "storageUsed", "storageLimit", "isActive", "isSuspended", "joinedAt", "lastActiveAt")
     VALUES ($1, $2, $3, $4, 'USER', 'FREE', 0, 107374182400, true, false, NOW(), NOW())
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       email = EXCLUDED.email,
       "avatarUrl" = EXCLUDED."avatarUrl",
       "lastActiveAt" = NOW()`,
    [profile.sub, profile.name, profile.email, profile.picture]
  );

  // Save refresh token and current user ID in settings
  const upsertSetting = async (key: string, value: string) => {
    await db.query(
      `INSERT INTO "Setting" (key, value, "updatedAt")
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()`,
      [key, value]
    );
  };

  await upsertSetting("google_refresh_token", tokens.refresh_token);
  await upsertSetting("current_user_id", profile.sub);
  await upsertSetting("google_user_email", profile.email);
  await upsertSetting("google_user_name", profile.name);

  // Redirect to sync page to kick off import
  return NextResponse.redirect(`${baseUrl}/api/photos/sync?autostart=true`);
}
