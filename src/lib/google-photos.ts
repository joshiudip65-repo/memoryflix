import { getDb } from "./db";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const PHOTOS_BASE = "https://photoslibrary.googleapis.com/v1";

export interface GooglePhotoItem {
  id: string;
  baseUrl: string;
  filename: string;
  mediaMetadata: {
    creationTime: string;
    width: string;
    height: string;
    photo?: {
      cameraMake?: string;
      cameraModel?: string;
      focalLength?: number;
      apertureFNumber?: number;
      isoEquivalent?: number;
    };
    video?: { fps: number; status: string };
  };
  mimeType: string;
  productUrl: string;
  description?: string;
}

export interface PhotosListResponse {
  mediaItems?: GooglePhotoItem[];
  nextPageToken?: string;
}

/** Fetch a fresh access token using the stored refresh token */
export async function getAccessToken(): Promise<string> {
  const db = getDb();
  const res = await db.query(
    `SELECT value FROM "Setting" WHERE key = 'google_refresh_token'`
  );
  if (!res.rows.length) {
    throw new Error(
      "No Google refresh token stored. Visit /api/photos/setup to authorize."
    );
  }

  const refreshToken = res.rows[0].value;
  const r = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }).toString(),
  });

  const data = await r.json();
  if (data.error) {
    throw new Error(`Token refresh failed: ${data.error_description || data.error}`);
  }
  return data.access_token as string;
}

/** List photos from Google Photos API (100 per page) */
export async function listPhotos(
  accessToken: string,
  pageToken?: string
): Promise<PhotosListResponse> {
  const params = new URLSearchParams({ pageSize: "100" });
  if (pageToken) params.set("pageToken", pageToken);

  const r = await fetch(`${PHOTOS_BASE}/mediaItems?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Photos API error ${r.status}: ${err}`);
  }
  return r.json();
}

/** Get user profile from Google */
export async function getGoogleProfile(accessToken: string): Promise<{
  sub: string;
  name: string;
  email: string;
  picture: string;
}> {
  const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) throw new Error("Failed to fetch Google profile");
  return r.json();
}

/** Guess emotion from filename / date */
export function guessEmotion(item: GooglePhotoItem): string {
  const month = new Date(item.mediaMetadata.creationTime).getMonth();
  if (month === 11 || month === 0) return "warmth";   // Dec/Jan
  if (month === 6 || month === 7) return "adventure"; // Jul/Aug
  if (month === 3 || month === 4) return "joy";       // Apr/May
  return "nostalgia";
}

/** Build a thumbnail URL for a Google Photos item */
export function thumbUrl(baseUrl: string, w = 400, h = 300): string {
  return `${baseUrl}=w${w}-h${h}-c`;
}

/** Build a full-size URL */
export function fullUrl(baseUrl: string, w = 1200): string {
  return `${baseUrl}=w${w}`;
}
