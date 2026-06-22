"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Check, AlertCircle, RefreshCw } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type SyncStep =
  | "idle"
  | "creating"
  | "picker_open"
  | "importing"
  | "categorizing"
  | "done"
  | "error";

interface SyncState {
  step: SyncStep;
  sessionId?: string;
  pickerUri?: string;
  imported?: number;
  processed?: number;
  collectionsCreated?: number;
  error?: string;
}

interface Props {
  /** Called once the full sync+categorize cycle finishes — refresh parent */
  onSyncComplete?: () => void;
  /** Render as a compact inline button (no overlay label), default false */
  compact?: boolean;
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function GooglePhotosSync({ onSyncComplete, compact = false }: Props) {
  const [state, setState] = useState<SyncState>({ step: "idle" });
  const [needReauth, setNeedReauth] = useState(false);
  const pickerWindowRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // ─── Import photos from a completed picker session ────────────────────────

  const importAndCategorize = useCallback(
    async (sessionId: string, importedCountSoFar?: number) => {
      // Step: importing
      setState((s) => ({ ...s, step: "importing", sessionId }));

      try {
        const importRes = await fetch("/api/photos/picker-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const importData = await importRes.json();

        if (!importRes.ok || importData.error) {
          setState({ step: "error", error: importData.error || "Import failed" });
          return;
        }

        const totalImported = (importedCountSoFar || 0) + (importData.imported || 0);

        // Step: categorizing
        setState({ step: "categorizing", imported: totalImported, sessionId });

        // Categorize up to 60 photos (keep costs reasonable)
        const idsToClassify = (importData.memoryIds || []).slice(0, 60);
        let catData: { processed?: number; collectionsCreated?: number } = {};

        if (idsToClassify.length > 0) {
          const catRes = await fetch("/api/photos/ai-categorize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memoryIds: idsToClassify }),
          });
          catData = await catRes.json();
        }

        setState({
          step: "done",
          imported: totalImported,
          processed: catData.processed || 0,
          collectionsCreated: catData.collectionsCreated || 0,
        });

        // Reload parent in 2.5 s so the user can see the success state
        setTimeout(() => onSyncComplete?.(), 2500);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setState({ step: "error", error: message });
      }
    },
    [onSyncComplete]
  );

  // ─── Start the full sync flow ─────────────────────────────────────────────

  const startSync = useCallback(async () => {
    setState({ step: "creating" });

    try {
      // 1. Create a Picker session
      const sessionRes = await fetch("/api/photos/picker-session", { method: "POST" });
      const session = await sessionRes.json();

      if (!sessionRes.ok || session.error) {
        if (session.error === "need_reauth" || sessionRes.status === 401) {
          setNeedReauth(true);
          setState({ step: "idle" });
          return;
        }
        setState({ step: "error", error: session.error || "Could not create Picker session" });
        return;
      }

      // 2. Open picker in a popup
      const popup = window.open(
        session.pickerUri,
        "google-photos-picker",
        "width=960,height=720,scrollbars=yes,resizable=yes,toolbar=no,menubar=no"
      );
      pickerWindowRef.current = popup;

      setState({
        step: "picker_open",
        sessionId: session.sessionId,
        pickerUri: session.pickerUri,
      });

      // 3. Poll every 3 s for completion
      pollRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(
            `/api/photos/picker-session?id=${encodeURIComponent(session.sessionId)}`
          );
          const pollData = await pollRes.json();

          if (pollData.mediaItemsSet) {
            stopPolling();
            pickerWindowRef.current?.close();
            await importAndCategorize(session.sessionId);
          }

          // If user closed the popup before confirming, stop polling
          if (pickerWindowRef.current?.closed && !pollData.mediaItemsSet) {
            stopPolling();
            setState({ step: "idle" });
          }
        } catch {
          // Transient fetch error — keep polling
        }
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ step: "error", error: message });
    }
  }, [importAndCategorize, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      pickerWindowRef.current?.close();
    };
  }, [stopPolling]);

  const dismiss = useCallback(() => {
    stopPolling();
    pickerWindowRef.current?.close();
    setState({ step: "idle" });
  }, [stopPolling]);

  // ─── Idle state — just render the trigger button ──────────────────────────

  if (state.step === "idle") {
    return (
      <div>
        {needReauth && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 p-3 rounded-xl bg-amber-500/20 border border-amber-500/30"
          >
            <p className="text-amber-300 text-sm font-medium">
              Re-authorization required for Google Photos Picker.
            </p>
            <a
              href="/api/photos/setup"
              className="text-amber-200 text-sm font-semibold mt-0.5 inline-block hover:underline"
            >
              Re-authorize now →
            </a>
          </motion.div>
        )}
        <button
          onClick={startSync}
          className={
            compact
              ? "text-xs text-blue-400 hover:text-blue-300 transition-colors ml-2"
              : "shrink-0 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors cursor-pointer"
          }
        >
          {compact ? "Sync more photos" : "Import from Google Photos →"}
        </button>
      </div>
    );
  }

  // ─── Active overlay ───────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      <motion.div
        key="sync-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-4"
        style={{ backdropFilter: "blur(24px)", background: "rgba(0,0,0,0.88)" }}
      >
        <motion.div
          initial={{ y: 60, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 60, scale: 0.95 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="relative w-full max-w-sm bg-gray-900/90 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
        >
          {/* Glow accent */}
          <div
            className="absolute insex-x-0 -top-px h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)",
            }}
          />

          {/* Dismiss button (picker_open, done, error) */}
          {(state.step === "picker_open" ||
            state.step === "done" ||
            state.step === "error") && (
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          )}

          <SyncContent
            state={state}
            onRetry={() => { setNeedReauth(false); setState({ step: "idle" }); }}
            onReopen={() =>
              pickerWindowRef.current?.focus() ||
              window.open(state.pickerUri, "google-photos-picker")
            }
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Step content ─────────────────────────────────────────────────────────────

function SyncContent({
  state,
  onRetry,
  onReopen,
}: {
  state: SyncState;
  onRetry: () => void;
  onReopen: () => void;
}) {
  switch (state.step) {
    // ── Creating session ──
    case "creating":
      return (
        <div className="text-center py-2">
          <div className="w-12 h-12 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-5" />
          <p className="text-white font-semibold text-lg">Opening Google Photos</p>
          <p className="text-white/50 text-sm mt-1">Creating your import session…</p>
        </div>
      );

    // ── Picker open: waiting for user to select ──
    case "picker_open":
      return (
        <div className="text-center py-2">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="mx-auto mb-5 w-14 h-14 flex items-center justify-center"
          >
            <GooglePhotosIcon size={52} />
          </motion.div>

          <p className="text-white font-bold text-xl mb-2">Select Your Photos</p>
          <p className="text-white/60 text-sm leading-relaxed">
            A Google Photos window just opened.<br />
            Pick your photos, then tap{" "}
            <span className="text-white font-semibold">Done</span>.
          </p>

          <button
            onClick={onReopen}
            className="mt-5 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            Picker not visible? Click to reopen →
          </button>

          {/* Waiting dots */}
          <div className="flex justify-center gap-1.5 mt-5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-blue-400/70"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.35 }}
              />
            ))}
          </div>
        </div>
      );

    // ── Importing from session ──
    case "importing":
      return (
        <div className="text-center py-2">
          <div className="w-12 h-12 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin mx-auto mb-5" />
          <p className="text-white font-bold text-xl">Importing Your Memories</p>
          <p className="text-white/55 text-sm mt-2">
            Adding your photos to MemoryFlix…
          </p>
        </div>
      );

    // ── AI categorization ──
    case "categorizing":
      return (
        <div className="text-center py-2">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="mx-auto mb-5 w-14 h-14 flex items-center justify-center"
          >
            <Sparkles className="w-12 h-12 text-purple-400" />
          </motion.div>

          <p className="text-white font-bold text-xl">AI Analysing Your Memories</p>
          <p className="text-white/55 text-sm mt-2">
            {state.imported} photo{state.imported !== 1 ? "s" : ""} imported
            <br />
            GPT-4o Vision is categorising…
          </p>

          {/* Animated progress shimmer */}
          <div className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #7C3AED, #DB2777, #7C3AED)",
                backgroundSize: "200% 100%",
              }}
              animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
            />
          </div>
        </div>
      );

    // ── Done ──
    case "done":
      return (
        <div className="text-center py-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 14, stiffness: 200 }}
            className="mx-auto mb-5 w-16 h-16 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center"
          >
            <Check className="w-8 h-8 text-green-400" />
          </motion.div>

          <p className="text-white font-bold text-xl mb-3">Your Memories Are Live!</p>

          <div className="space-y-1 text-sm">
            <p className="text-white/70">
              <span className="text-white font-semibold">{state.imported}</span> photos imported
            </p>
            <p className="text-white/70">
              <span className="text-white font-semibold">{state.processed}</span> photos analysed by AI
            </p>
            <p className="text-white/70">
              <span className="text-white font-semibold">{state.collectionsCreated}</span>{" "}
              collections created
            </p>
          </div>

          <p className="text-white/30 text-xs mt-5">Refreshing your homepage…</p>
        </div>
      );

    // ── Error ──
    case "error":
      return (
        <div className="text-center py-2">
          <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>

          <p className="text-white font-bold text-xl mb-2">Something Went Wrong</p>
          <p className="text-red-400/80 text-sm max-w[280px] mx-auto leading-relaxed">
            {state.error}
          </p>

          <button
            onClick={onRetry}
            className="mt-5 flex items-center gap-2 mx-auto bg-white/10 hover:bw-white/20 text-white px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );

    default:
      return null;
  }
}

// ─── Google Photos SVG icon ──────────────────────────────────────────────────

function GooglePhotosIcon({ size = 40 }: { size?: number }) {
  const r = size * 0.21;
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <circle cx={c - r * 0.8} cy={c - r * 0.8} r={r} fill="#fbbc04" />
      <circle cx={c + r * 0.8} cy={c - r * 0.8} r={r} fill="#ea4335" />
      <circle cx={c - r * 0.8} cy={c + r * 0.8} r={r} fill="#34a853" />
      <circle cx={c + r * 0.8} cy={c + r * 0.8} r={r} fill="#4285f4" />
    </svg>
  );
}
