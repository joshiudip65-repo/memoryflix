import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Google Gemini Flash — free tier: 1,500 requests/day, no credit card required
// Get your free key at: https://aistudio.google.com/app/apikey
const GEMINI_API =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * POST /api/photos/ai-categorize
 * Body: { memoryIds?: string[], limit?: number }
 *
 * Runs Gemini 1.5 Flash Vision (FREE) on each photo thumbnail and:
 *  • Creates Emotion, Year, and People Genre records (if not exist)
 *  • Links each memory to its genres via MemoryGenre
 *  • Creates MemoryEmotion records
 *  • Updates Memory.aiTags, scenes, emotionalScore, nostalgiaScore, aiConfidence
 *
 * If memoryIds is omitted, processes up to `limit` (default 50) uncategorised
 * memories (aiConfidence < 0.5) for the current user.
 */

// ─── Emotion metadata ────────────────────────────────────────────────────────

const EMOTION_META: Record<string, { label: string; color: string }> = {
  JOY:        { label: "Joy & Happiness",    color: "#FFD700" },
  NOSTALGIA:  { label: "Nostalgia",           color: "#C8A882" },
  LOVE:       { label: "Love & Romance",      color: "#FF4A6A" },
  ADVENTURE:  { label: "Adventure",           color: "#2ECC71" },
  CALM:       { label: "Calm & Peaceful",     color: "#74B9FF" },
  EXCITEMENT: { label: "Excitement",          color: "#FF6B35" },
  WARMTH:     { label: "Warmth & Family",     color: "#FF8C42" },
  GRATITUDE:  { label: "Gratitude",           color: "#A29BFE" },
  WONDER:     { label: "Wonder & Awe",        color: "#6C5CE7" },
  PRIDE:      { label: "Pride & Achievement", color: "#E17055" },
  MELANCHOLY: { label: "Melancholy",          color: "#636E72" },
  COMFORT:    { label: "Comfort",             color: "#FDCB6E" },
  HUMOR:      { label: "Humour",              color: "#00CEC9" },
  TENDERNESS: { label: "Tenderness",          color: "#FD79A8" },
  TRIUMPH:    { label: "Triumph",             color: "#D63031" },
};

const VALID_EMOTIONS = Object.keys(EMOTION_META);

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClassificationResult {
  primaryEmotion: string;
  secondaryEmotions: string[];
  scenes: string[];
  peopleCount: number;
  estimatedYear: number | null;
  aiTags: string[];
  emotionalScore: number;
  nostalgiaScore: number;
}

// ─── Fetch image as base64 ───────────────────────────────────────────────────

async function fetchImageBase64(
  url: string
): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const data = Buffer.from(buffer).toString("base64");
  const ct = res.headers.get("content-type") || "image/jpeg";
  const mimeType = ct.split(";")[0].trim();
  return { data, mimeType };
}

// ─── Gemini 1.5 Flash Vision call ───────────────────────────────────────────

async function classifyPhoto(
  thumbnailUrl: string,
  apiKey: string
): Promise<ClassificationResult> {
  const emotionList = VALID_EMOTIONS.join(", ");
  const prompt = `You are a memory and emotion analyst. Study this photo carefully and return ONLY a valid JSON object (no markdown, no code fences, no explanation) with these exact fields:
{
  "primaryEmotion": "<one of: ${emotionList}>",
  "secondaryEmotions": ["<up to 2 more from the same list>"],
  "scenes": ["<2-4 descriptors: outdoor/indoor/beach/mountain/urban/celebration/portrait/food/travel/nature/family/couple/solo/group/wedding/graduation/birthday/holiday>"],
  "peopleCount": <integer, 0 if no people visible>,
  "estimatedYear": <4-digit year integer if inferable from fashion/tech/style, otherwise null>,
  "aiTags": ["<3-6 specific, descriptive tags>"],
  "emotionalScore": <integer 50-100, how emotionally resonant>,
  "nostalgiaScore": <integer 30-100, how nostalgic it feels>
}`;

  // Fetch the image and send as inline base64 — reliable for temp Google Photos URLs
  const { data: imageData, mimeType } = await fetchImageBase64(thumbnailUrl);

  const res = await fetch(`${GEMINI_API}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: imageData,
              },
            },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 400,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err}`);
  }

  const responseData = await res.json();
  const raw = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Empty response from Gemini");

  // Strip any accidental markdown fences
  const jsonStr = raw.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(jsonStr) as ClassificationResult;
}

// ─── Upsert a Genre, return its id ──────────────────────────────────────────

async function upsertGenre(
  db: ReturnType<typeof import("@/lib/db").getDb>,
  slug: string,
  name: string,
  description: string,
  type: string,
  color: string,
  icon: string,
  priority: number
): Promise<string> {
  const res = await db.query(
    `INSERT INTO "Genre" (id, name, slug, description, type, color, icon, "rankingPriority", "isVisible", "createdAt", "updatedAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4::"RailType", $5, $6, $7, true, NOW(), NOW())
     ON CONFLICT (slug) DO UPDATE SET
       name = EXCLUDED.name,
       "updatedAt" = NOW()
     RETURNING id`,
    [name, slug, description, type, color, icon, priority]
  );
  return res.rows[0].id as string;
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/app/apikey and add it to your Vercel environment variables.",
      },
      { status: 500 }
    );
  }

  let body: { memoryIds?: string[]; limit?: number } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }
  const { memoryIds, limit = 50 } = body;

  const db = getDb();

  // Resolve current user
  const userRes = await db.query(
    `SELECT value FROM "Setting" WHERE key = 'current_user_id'`
  );
  if (!userRes.rows.length) {
    return NextResponse.json({ error: "No user found." }, { status: 401 });
  }
  const userId = userRes.rows[0].value;

  // Fetch memories to process
  let memoriesRes;
  if (memoryIds?.length) {
    memoriesRes = await db.query(
      `SELECT id, "thumbnailUrl", "capturedAt" FROM "Memory"
       WHERE id = ANY($1) AND "userId" = $2 AND status = 'ACTIVE'`,
      [memoryIds, userId]
    );
  } else {
    memoriesRes = await db.query(
      `SELECT id, "thumbnailUrl", "capturedAt" FROM "Memory"
       WHERE "userId" = $1 AND "aiConfidence" < 0.5 AND status = 'ACTIVE'
       ORDER BY "capturedAt" DESC LIMIT $2`,
      [userId, limit]
    );
  }

  if (!memoriesRes.rows.length) {
    return NextResponse.json({
      ok: true,
      processed: 0,
      message: "No memories to categorise",
    });
  }

  // Pre-create all emotion genres
  const emotionGenreIds: Record<string, string> = {};
  for (const [emotion, { label, color }] of Object.entries(EMOTION_META)) {
    emotionGenreIds[emotion] = await upsertGenre(
      db,
      `emotion-${emotion.toLowerCase()}`,
      label,
      `Memories filled with ${label.toLowerCase()}`,
      "EMOTIONAL",
      color,
      "heart",
      80
    );
  }

  let processed = 0;
  let errors = 0;
  const genresCreated = new Set<string>();

  for (const memory of memoriesRes.rows) {
    try {
      const cl = await classifyPhoto(memory.thumbnailUrl, apiKey);

      // Normalise emotion value
      const primary = VALID_EMOTIONS.includes(cl.primaryEmotion)
        ? cl.primaryEmotion
        : "NOSTALGIA";
      const secondary = (cl.secondaryEmotions || []).filter((e) =>
        VALID_EMOTIONS.includes(e)
      );

      // 1. Update the Memory row
      await db.query(
        `UPDATE "Memory" SET
           scenes           = $2,
           "aiTags"         = $3,
           "emotionalScore" = $4,
           "nostalgiaScore" = $5,
           "aiConfidence"   = 0.9
         WHERE id = $1`,
        [
          memory.id,
          cl.scenes?.slice(0, 6) || [],
          cl.aiTags?.slice(0, 8) || [],
          Math.min(100, Math.max(50, cl.emotionalScore || 70)),
          Math.min(100, Math.max(30, cl.nostalgiaScore || 65)),
        ]
      );

      // 2. Link primary emotion genre
      if (emotionGenreIds[primary]) {
        await db.query(
          `INSERT INTO "MemoryGenre" ("memoryId", "genreId")
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [memory.id, emotionGenreIds[primary]]
        );
        genresCreated.add(`emotion-${primary}`);
      }

      // 3. MemoryEmotion records
      const emotionRows = [
        { emotion: primary, confidence: 0.9, intensity: 0.85 },
        ...secondary.map((e) => ({ emotion: e, confidence: 0.6, intensity: 0.5 })),
      ];
      for (const { emotion, confidence, intensity } of emotionRows) {
        await db.query(
          `INSERT INTO "MemoryEmotion" (id, "memoryId", emotion, confidence, intensity)
           VALUES (gen_random_uuid()::text, $1, $2::"EmotionType", $3, $4)
           ON CONFLICT ("memoryId", emotion) DO UPDATE SET
             confidence = EXCLUDED.confidence,
             intensity  = EXCLUDED.intensity`,
          [memory.id, emotion, confidence, intensity]
        );
      }

      // 4. Year genre
      const capturedYear = memory.capturedAt
        ? new Date(memory.capturedAt).getFullYear()
        : null;
      const year = cl.estimatedYear || capturedYear;
      if (year && year >= 1900 && year <= new Date().getFullYear() + 1) {
        const yearGenreId = await upsertGenre(
          db,
          `year-${year}`,
          `${year}`,
          `Memories from ${year}`,
          "TIME",
          "#888888",
          "calendar",
          60
        );
        await db.query(
          `INSERT INTO "MemoryGenre" ("memoryId", "genreId")
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [memory.id, yearGenreId]
        );
        genresCreated.add(`year-${year}`);
      }

      // 5. People genre
      const count = cl.peopleCount || 0;
      if (count > 0) {
        const { slug, name } =
          count === 1
            ? { slug: "people-solo",        name: "Solo Moments"  }
            : count === 2
            ? { slug: "people-together",    name: "Together"      }
            : count <= 5
            ? { slug: "people-small-group", name: "Small Groups"  }
            : { slug: "people-gatherings",  name: "Gatherings"    };

        const peopleGenreId = await upsertGenre(
          db,
          slug,
          name,
          `Photos featuring ${name.toLowerCase()}`,
          "RELATIONSHIP",
          "#A29BFE",
          "users",
          70
        );
        await db.query(
          `INSERT INTO "MemoryGenre" ("memoryId", "genreId")
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [memory.id, peopleGenreId]
        );
        genresCreated.add(slug);
      }

      processed++;
    } catch (err) {
      console.error(`AI classify error for memory ${memory.id}:`, err);
      errors++;
    }
  }

  return NextResponse.json({
    ok: true,
    processed,
    errors,
    collectionsCreated: genresCreated.size,
    message: `Analysed ${processed} memories · ${genresCreated.size} collections created`,
  });
}
