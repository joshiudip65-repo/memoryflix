import { NextResponse } from "next/server";

/**
 * GET /api/photos/setup
 * Redirects to Google OAuth to request Photos Library access.
 * Visit this URL in the browser to authorize Google Photos.
 */
export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || "https://memoryflix-ochre.vercel.app";
  const redirectUri = `${baseUrl}/api/photos/callback`;

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/photoslibrary.readonly",
      "openid",
      "profile",
      "email",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",  // Force consent to always get refresh_token
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}
