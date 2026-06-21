import { Person } from "@/types";

export const mockPeople: Person[] = [
  {
    id: "p-001",
    name: "Mom",
    avatarUrl: "https://i.pravatar.cc/200?img=47",
    relationshipType: "family",
    memoryCount: 156,
    firstMemoryDate: "2005-03-12",
    lastMemoryDate: "2025-12-25",
    emotionalCloseness: 98,
    sharedEmotions: ["love", "warmth", "joy", "comfort", "gratitude"],
    highlights: ["mem-002", "mem-006", "mem-011"],
    bio: "The one who made everything feel like home",
  },
  {
    id: "p-002",
    name: "Dad",
    avatarUrl: "https://i.pravatar.cc/200?img=52",
    relationshipType: "family",
    memoryCount: 132,
    firstMemoryDate: "2005-03-12",
    lastMemoryDate: "2025-12-25",
    emotionalCloseness: 95,
    sharedEmotions: ["pride", "warmth", "joy", "humor"],
    highlights: ["mem-002", "mem-003", "mem-006"],
    bio: "Road trip co-pilot. Life coach. Best hugger.",
  },
  {
    id: "p-003",
    name: "Sarah",
    avatarUrl: "https://i.pravatar.cc/200?img=32",
    relationshipType: "family",
    memoryCount: 204,
    firstMemoryDate: "2006-08-01",
    lastMemoryDate: "2025-11-20",
    emotionalCloseness: 97,
    sharedEmotions: ["joy", "humor", "love", "excitement", "nostalgia"],
    highlights: ["mem-002", "mem-006", "mem-007"],
    bio: "Sister, best friend, and partner in crime since day one",
  },
  {
    id: "p-004",
    name: "Jake",
    avatarUrl: "https://i.pravatar.cc/200?img=12",
    relationshipType: "friend",
    memoryCount: 89,
    firstMemoryDate: "2017-09-05",
    lastMemoryDate: "2025-08-14",
    emotionalCloseness: 88,
    sharedEmotions: ["humor", "adventure", "excitement", "joy"],
    highlights: ["mem-005", "mem-008", "mem-010"],
    bio: "College roommate turned lifelong friend. Adventure buddy.",
  },
  {
    id: "p-005",
    name: "Mia",
    avatarUrl: "https://i.pravatar.cc/200?img=23",
    relationshipType: "friend",
    memoryCount: 67,
    firstMemoryDate: "2018-02-14",
    lastMemoryDate: "2025-10-30",
    emotionalCloseness: 82,
    sharedEmotions: ["calm", "comfort", "joy", "warmth"],
    highlights: ["mem-004", "mem-010", "mem-003"],
    bio: "The calm in every storm. Always there with coffee.",
  },
  {
    id: "p-006",
    name: "Grandma Rose",
    avatarUrl: "https://i.pravatar.cc/200?img=48",
    relationshipType: "family",
    memoryCount: 45,
    firstMemoryDate: "2005-06-15",
    lastMemoryDate: "2022-11-23",
    emotionalCloseness: 94,
    sharedEmotions: ["warmth", "nostalgia", "love", "comfort", "gratitude"],
    highlights: ["mem-011"],
    bio: "Keeper of recipes, stories, and unconditional love",
  },
];

export function getPersonById(id: string): Person | undefined {
  return mockPeople.find((p) => p.id === id);
}

export function getPeopleByRelationship(type: string): Person[] {
  return mockPeople.filter((p) => p.relationshipType === type);
}

export function getMostConnectedPeople(): Person[] {
  return [...mockPeople].sort((a, b) => b.emotionalCloseness - a.emotionalCloseness);
}
