"use client";

/**
 * MemoryStore — a simple client-side store that persists memory data
 * across page navigations within the same browser session.
 *
 * This uses a module-level variable + React context so that:
 * 1. Uploaded memories don't vanish when navigating between pages
 * 2. Edits/deletes persist across admin panel tabs
 * 3. Consumer and admin share the same memory pool
 */

import { useState, useCallback, useEffect } from "react";
import { Memory } from "@/types";
import { mockMemories as originalMockMemories } from "@/data/mock";

// ---- Module-level store (survives React re-renders & route changes) ----
let _memories: Memory[] = [...originalMockMemories];
const _listeners: Set<() => void> = new Set();

function getMemories(): Memory[] {
  return _memories;
}

function setMemories(next: Memory[] | ((prev: Memory[]) => Memory[])): void {
  if (typeof next === "function") {
    _memories = next(_memories);
  } else {
    _memories = next;
  }
  // Notify all subscribers
  _listeners.forEach((fn) => fn());
}

function subscribe(listener: () => void): () => void {
  _listeners.add(listener);
  return () => { _listeners.delete(listener); };
}

// ---- React hook ----

export function useMemoryStore() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const unsub = subscribe(() => forceUpdate((n) => n + 1));
    return unsub;
  }, []);

  const memories = getMemories();

  const updateMemories = useCallback(
    (updater: Memory[] | ((prev: Memory[]) => Memory[])) => {
      setMemories(updater);
    },
    []
  );

  const addMemory = useCallback((memory: Memory) => {
    setMemories((prev) => [memory, ...prev]);
  }, []);

  const updateMemory = useCallback((id: string, patch: Partial<Memory>) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }, []);

  const deleteMemory = useCallback((id: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "deleted" as const } : m))
    );
  }, []);

  const bulkDelete = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setMemories((prev) =>
      prev.map((m) => (idSet.has(m.id) ? { ...m, status: "deleted" as const } : m))
    );
  }, []);

  const getActiveMemories = useCallback(() => {
    return memories.filter((m) => m.status !== "deleted");
  }, [memories]);

  return {
    memories,
    setMemories: updateMemories,
    addMemory,
    updateMemory,
    deleteMemory,
    bulkDelete,
    getActiveMemories,
  };
}
