// ============================================================================
// MEMORYFLIX — COMPLETE TYPE SYSTEM
// ============================================================================

// --- Core Memory Types ---
export type MediaType = "photo" | "video" | "gif" | "clip" | "story" | "trailer";
export type MemoryStatus = "active" | "archived" | "hidden" | "deleted" | "processing";
export type EmotionType =
  | "joy" | "nostalgia" | "love" | "excitement" | "calm"
  | "melancholy" | "gratitude" | "wonder" | "comfort" | "pride"
  | "humor" | "warmth" | "adventure" | "tenderness" | "triumph";

export type MoodCategory =
  | "cozy" | "dreamy" | "chaotic" | "calm" | "romantic"
  | "wild" | "nostalgic" | "energetic" | "reflective" | "festive";

export interface Memory {
  id: string;
  title: string;
  description?: string;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl: string;
  previewUrl?: string;
  duration?: number; // seconds for video/clip
  width?: number;
  height?: number;
  capturedAt: string; // ISO date
  uploadedAt: string;
  location?: MemoryLocation;
  emotions: EmotionTag[];
  people: PersonTag[];
  scenes: string[];
  aiTags: string[];
  aiConfidence: number; // 0-1
  emotionalScore: number; // 0-100
  nostalgiaScore: number; // 0-100
  viewCount: number;
  lastViewedAt?: string;
  isFavorite: boolean;
  isCoreMomory: boolean;
  status: MemoryStatus;
  genreIds: string[];
  eraId?: string;
  userId: string;
}

export interface MemoryLocation {
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  landmark?: string;
  placeId?: string;
}

export interface EmotionTag {
  emotion: EmotionType;
  confidence: number;
  intensity: number; // 0-100
}

export interface PersonTag {
  personId: string;
  name: string;
  boundingBox?: { x: number; y: number; w: number; h: number };
  confidence: number;
}

// --- People / Relationships ---
export type RelationshipType =
  | "family" | "friend" | "partner" | "colleague"
  | "childhood_friend" | "pet" | "acquaintance" | "other";

export interface Person {
  id: string;
  name: string;
  avatarUrl: string;
  relationshipType: RelationshipType;
  memoryCount: number;
  firstMemoryDate: string;
  lastMemoryDate: string;
  emotionalCloseness: number; // 0-100
  sharedEmotions: EmotionType[];
  highlights: string[]; // memory IDs
  bio?: string;
}

// --- Rails / Genre System ---
export type RailType =
  | "emotional" | "time" | "relationship" | "ai_discovery"
  | "travel" | "seasonal" | "trending" | "custom";

export interface Rail {
  id: string;
  title: string;
  subtitle?: string;
  type: RailType;
  slug: string;
  icon?: string;
  memoryIds: string[];
  rankingScore: number;
  isActive: boolean;
  isPinned: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
  aiGenerated: boolean;
  contextTrigger?: RailContextTrigger;
}

export interface RailContextTrigger {
  timeOfDay?: string[];
  weather?: string[];
  season?: string[];
  dayOfWeek?: string[];
  anniversary?: boolean;
  mood?: MoodCategory[];
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  bannerUrl?: string;
  type: RailType;
  memoryCount: number;
  rankingPriority: number;
  isVisible: boolean;
  homepagePlacement?: number;
  color: string;
  icon: string;
  createdAt: string;
}

// --- Hero Banner ---
export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: string;
  mediaType: "video" | "photo" | "story";
  ctaButtons: CTAButton[];
  gradient: string;
  isActive: boolean;
  position: number;
  startDate?: string;
  endDate?: string;
  targetMemoryId?: string;
  targetStoryId?: string;
  targetRailId?: string;
}

export interface CTAButton {
  label: string;
  action: "relive" | "watch_story" | "play_trailer" | "continue" | "share" | "save";
  icon?: string;
  variant: "primary" | "secondary" | "ghost";
}

// --- Stories & Trailers ---
export interface Story {
  id: string;
  title: string;
  description: string;
  type: "recap" | "trailer" | "journey" | "relationship" | "yearly" | "custom";
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  memoryIds: string[];
  personIds: string[];
  emotions: EmotionType[];
  aiGenerated: boolean;
  music?: string;
  narration?: string;
  createdAt: string;
  viewCount: number;
}

// --- Life Eras / Timeline ---
export interface Era {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  thumbnailUrl: string;
  color: string;
  memoryCount: number;
  dominantEmotion: EmotionType;
  highlights: string[];
  people: string[];
}

// --- User System ---
export type SubscriptionPlan = "free" | "premium" | "family";
export type UserRole = "user" | "admin" | "moderator";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  plan: SubscriptionPlan;
  storageUsed: number; // bytes
  storageLimit: number;
  memoryCount: number;
  joinedAt: string;
  lastActiveAt: string;
  preferences: UserPreferences;
  isActive: boolean;
  isSuspended: boolean;
}

export interface UserPreferences {
  theme: "dark" | "light" | "auto";
  autoplayPreviews: boolean;
  notificationsEnabled: boolean;
  sensitiveContentFilter: boolean;
  mutedPeople: string[];
  hiddenMemories: string[];
  ambientMusicEnabled: boolean;
  tvModeEnabled: boolean;
}

// --- Recommendation Engine ---
export interface RecommendationSignal {
  memoryId: string;
  watchDuration: number;
  rewatchCount: number;
  isFavorited: boolean;
  isShared: boolean;
  pauseCount: number;
  emotionalEngagement: number;
  timeOfDay: string;
  context: string;
}

export interface RecommendationResult {
  memoryId: string;
  score: number;
  reason: string;
  railId?: string;
  confidence: number;
}

// --- Search ---
export interface SearchQuery {
  text: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
}

export interface SearchFilters {
  emotions?: EmotionType[];
  people?: string[];
  dateRange?: { start: string; end: string };
  location?: string;
  mediaType?: MediaType[];
  mood?: MoodCategory[];
}

export interface SearchResult {
  memories: Memory[];
  totalCount: number;
  suggestedQueries: string[];
  emotionalSummary: Record<EmotionType, number>;
}

// --- Admin Types ---
export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalMemories: number;
  uploadsToday: number;
  storageUsed: number;
  storageTotal: number;
  aiProcessingQueue: number;
  trendingCategories: { name: string; count: number }[];
  engagementRate: number;
  avgWatchTime: number;
  recommendationAccuracy: number;
}

export interface AdminChartData {
  uploadsPerDay: { date: string; count: number }[];
  retentionData: { week: string; rate: number }[];
  emotionalEngagement: { emotion: string; score: number }[];
  watchTimeData: { date: string; minutes: number }[];
  rediscoveryRate: { date: string; rate: number }[];
}

export interface ModerationItem {
  id: string;
  memoryId: string;
  reportedBy?: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "flagged";
  aiSeverity: number;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Notification {
  id: string;
  type: "nostalgia" | "anniversary" | "emotional" | "seasonal" | "system";
  title: string;
  body: string;
  memoryId?: string;
  scheduledAt: string;
  sentAt?: string;
  isActive: boolean;
}

// --- AI Engine Types ---
export interface AIClassification {
  memoryId: string;
  faces: { personId: string; confidence: number }[];
  emotions: EmotionTag[];
  scenes: { label: string; confidence: number }[];
  objects: { label: string; confidence: number }[];
  audioAnalysis?: { music: boolean; speech: boolean; emotionalTone: string };
  location?: MemoryLocation;
  era?: string;
  aestheticScore: number;
  qualityScore: number;
  processedAt: string;
}

export interface AICluster {
  id: string;
  name: string;
  type: "emotion" | "scene" | "person" | "time" | "location";
  memoryIds: string[];
  confidence: number;
  isApproved: boolean;
  mergedFrom?: string[];
  createdAt: string;
}
