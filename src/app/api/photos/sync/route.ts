import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  getAccessToken,
  listPhotos,
  guessEmotion,
  thumbUrl,
  fullUrl,
} from "@/lib/google-photos";

/**
 * GET /api/photos/sync
 * Imports Google Photos into the Memory table in Neon.
 * Returns JSON status. Pass ?autostart=true to skip the JSON and redirect to home.
 *
 * Flow:
 * 1. Refresh Google access token using stored refresh_token
 * 2. Fetch all photos from Google Photos API (paginated, 100 at a time)
 * 3. Upsert each photo into the Memory table
 * 4. Update sync timestamp in settings
 */
export async function GET(req: NextRequest) {
  const autostart = req.nextUrl.searchParams.get("autostart") === "true";
  const baseUrl = process.env.NEXTAUTH_URL || "https://memoryflix-ochre.vercel.app";
  const db = getDb();

  try {
    // Get current user
    const userRes = await db.query(
      `SELECT value FROM "Setting" WHERE key = 'current_user_id'`
    );
    if (!userRes.rows.length) {
      const err = "No user found. Visit /api/photos/setup first.";
      if (autostart) return NextResponse.redirect(`${baseUrl}?error=${encodeURIComponent(err)}`);
      return NextResponse.json({ error: err }, { status: 401 });
    }
    const userId = userRes.rows[0].value;

    // Get fresh access token
    const accessToken = await getAccessToken();

    let imported = 0;
    let skipped = 0;
    let pageToken: string | undefined;
    const MAX_PAGES = 10; // Import up to 1000 photos
    let page = 0;

    do {
      const data = await listPhotos(accessToken, pageToken);

      if (!data.mediaItems || data.mediaItems.length === 0) break;

      for (const item of data.mediaItems) {
        const isVideo =
          item.mimeType.startsWith("video/") ||
          !!item.mediaMetadata.video;
        const mediaType = isVideo ? "VIDEO" : "PHOTO";

        const capturedAt = item.mediaMetadata.creationTime
          ? new Date(item.mediaMetadata.creationTime)
          : new Date();

        const w = parseInt(item.mediaMetadata.width || "0");
        const h = parseInt(item.mediaMetadata.height || "0");

        const emotion = guessEmotion(item);
        const thumbnailUrlVal = thumbUrl(item.baseUrl, 400, 300);
        const mediaUrlVal = fullUrl(item.baseUrl, 1200);
        const previewUrlVal = thumbUrl(item.baseUrl, 800, 600);

        // Upsert using Google's mediaItem id as a stable key
        await db.query(
          `INSERT INTO "Memory" (
            id, title, description, "mediaType", "mediaUrl", "thumbnailUrl",
            "previewUrl", width, height, "mimeType", "capturedAt", "uploadedAt",
            status, "emotionalScore", "nostalgiaScore", "aiConfidence",
            "viewCount", "isFavorite", "isCoreMemory", "userId",
            "scenes", "aiTags", "embeddingId"
          ) VALUES (
            $1, $2, $3, $4::\"MediaType\", $5, $6,
            $7, $8, $9, $10, $11, NOW(),
            'ACTIVE', 70, 65, 0.8,
            0, false, false, $12,
            ARRAY['photo', 'google-photos'], ARRAY['google-photos', $13], $1
          )
          ON CONFLICT (id) DO UPDATE SET
            "mediaUrl" = EXCLUDED."mediaUrl",
            "thumbnailUrl" = EXCLUDED."thumbnailUrl",
            "previewUrl" = EXCLUDED."previewUrl",
            "uploadedAt" = NOW()`,
          [
            item.id,
            item.filename.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "),
            item.description || null,
            mediaType,
            mediaUrlVal,
            thumbnailUrlVal,
            previewUrlVal,
            w || null,
            h || null,
            item.mimeType,
            capturedAt,
            userId,
            emotion,
          ]
        );
        imported++;
      }

      pageToken = data.nextPageToken;
      page++;
    } while (pageToken && page < MAX_PAGES);

    // Record last sync time
    await db.query(
      `INSERT INTO "Setting" (key, value, "updatedAt")
       VALUES ('last_sync', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()`,
      [new Date().toISOString()]
    );

    const summary = {
      ok: true,
      imported,
      skipped,
      message: `Synced ${imported} photos from Google Photos`,
    };

    if (autostart) {
      return NextResponse.redirect(`${baseUrl}/home?synced=${imported}`);
    }
    return NextResponse.json(summary);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (autostart) {
      return NextResponse.redirect(`${baseUrl}/home?error=${encodeURIComponent(message)}`);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
