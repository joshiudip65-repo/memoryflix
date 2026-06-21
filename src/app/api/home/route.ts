import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/**
 * GET /api/home
 * Returns homepage data: memories grouped into rails + banners.
 * Reads from real Neon DB when photos have been synced,
 * signals empty state when not yet connected.
 */
export async function GET() {
  try {
    const db = getDb();

    // Get current user from settings
    const settingRes = await db.query(
      `SELECT key, value FROM "Setting" WHERE key IN ('current_user_id', 'last_sync', 'google_user_name', 'google_user_email')`
    );
    const settings: Record<string, string> = {};
    for (const row of settingRes.rows) settings[row.key] = row.value;

    const userId = settings["current_user_id"];
    const lastSync = settings["last_sync"];
    const userName = settings["google_user_name"] || "Your";

    if (!userId) {
      // Not connected yet
      return NextResponse.json({ connected: false, memories: [], rails: [], banners: [] });
    }

    // Fetch all active memories for this user
    const memRes = await db.query(
      `SELECT id, title, description, "mediaType", "mediaUrl", "thumbnailUrl",
              "previewUrl", duration, width, height, "capturedAt", "emotionalScore",
              "nostalgiaScore", "isFavorite", "isCoreMemory", "viewCount",
              "locationCity", "locationCountry", "aiTags", scenes, status
       FROM "Memory"
       WHERE "userId" = $1 AND status = 'ACTIVE'
       ORDER BY "capturedAt" DESC
       LIMIT 500`,
      [userId]
    );

    const memories = memRes.rows.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      mediaType: m.mediaType?.toLowerCase() || "photo",
      mediaUrl: m.mediaUrl,
      thumbnailUrl: m.thumbnailUrl,
      previewUrl: m.previewUrl,
      duration: m.duration,
      width: m.width,
      height: m.height,
      capturedAt: m.capturedAt?.toISOString?.() || m.capturedAt,
      uploadedAt: m.capturedAt?.toISOString?.() || m.capturedAt,
      location: m.locationCity
        ? { city: m.locationCity, country: m.locationCountry }
        : undefined,
      emotions: [],
      people: [],
      scenes: m.scenes || [],
      aiTags: m.aiTags || [],
      aiConfidence: 0.8,
      emotionalScore: parseFloat(m.emotionalScore) || 70,
      nostalgiaScore: parseFloat(m.nostalgiaScore) || 65,
      viewCount: m.viewCount || 0,
      isFavorite: m.isFavorite || false,
      isCoreMemory: m.isCoreMemory || false,
      isCoreMomory: m.isCoreMemory || false,
      status: m.status?.toLowerCase() || "active",
      genreIds: [],
      userId,
    }));

    if (memories.length === 0) {
      return NextResponse.json({ connected: true, memories: [], rails: [], banners: [], lastSync });
    }

    const ids = memories.map((m) => m.id);
    const take = (n: number, offset = 0) => ids.slice(offset, offset + n);
    const shuffle = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);

    // Build rails from real memories
    const rails = [
      {
        id: "rail-recent",
        title: `${userName}'s Recent Memories`,
        subtitle: `${memories.length} photos from Google Photos`,
        type: "time",
        slug: "recent-memories",
        memoryIds: take(20),
        rankingScore: 100,
        isActive: true,
        isPinned: true,
        position: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiGenerated: false,
      },
      {
        id: "rail-favorites",
        title: "Your Favourites",
        subtitle: "Photos you've marked as favourites",
        type: "emotional",
        slug: "favourites",
        memoryIds: memories.filter((m) => m.isFavorite).map((m) => m.id).slice(0, 20)
          .concat(take(20, 20)), // pad with recent if few favourites
        rankingScore: 95,
        isActive: true,
        isPinned: false,
        position: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiGenerated: false,
      },
      {
        id: "rail-discovery",
        title: "Rediscover",
        subtitle: "Hidden gems from years ago",
        type: "ai_discovery",
        slug: "rediscover",
        memoryIds: shuffle(ids).slice(0, 20),
        rankingScore: 90,
        isActive: true,
        isPinned: false,
        position: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiGenerated: true,
      },
      {
        id: "rail-videos",
        title: "Videos",
        subtitle: "Your moving memories",
        type: "time",
        slug: "videos",
        memoryIds: memories.filter((m) => m.mediaType === "video").map((m) => m.id).slice(0, 20),
        rankingScore: 85,
        isActive: true,
        isPinned: false,
        position: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiGenerated: false,
      },
      {
        id: "rail-throwback",
        title: "Throwback",
        subtitle: "Photos from years past",
        type: "time",
        slug: "throwback",
        memoryIds: take(20, 40),
        rankingScore: 80,
        isActive: true,
        isPinned: false,
        position: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiGenerated: false,
      },
    ].filter((r) => r.memoryIds.length > 0);

    // Build hero banner from first memory
    const hero = memories[0];
    const banners = hero
      ? [
          {
            id: "banner-main",
            title: hero.title,
            subtitle: hero.capturedAt ? new Date(hero.capturedAt).toLocaleDateString("en-AU", { year: "numeric", month: "long" }) : "",
            description: `${memories.length} memories synced from Google Photos`,
            mediaUrl: hero.mediaUrl,
            thumbnailUrl: hero.thumbnailUrl,
            mediaType: hero.mediaType,
            ctaButtons: [
              { label: "Watch Now", action: "play", memoryId: hero.id },
              { label: "My Collection", action: "navigate", href: "/vault" },
            ],
            gradient: "from-black/80 via-black/40 to-transparent",
            isActive: true,
            position: 0,
          },
        ]
      : [];

    return NextResponse.json({
      connected: true,
      memories,
      rails,
      banners,
      lastSync,
      totalCount: memories.length,
    });
  } catch (err: unknown) {
    console.error("Home API error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message, connected: false, memories: [], rails: [], banners: [] }, { status: 500 });
  }
}
