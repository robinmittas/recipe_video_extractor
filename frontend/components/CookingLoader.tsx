"use client";

import { useEffect, useState } from "react";

// ------------------------------------------------------------------
// Stage definitions
// ------------------------------------------------------------------

const STAGES = [
  {
    emoji: "🥚",
    label: "Fetching video…",
    sub: "Reaching out to the source",
    animClass: "animate-bounce",
  },
  {
    emoji: "🍳",
    label: "Reading captions…",
    sub: "Extracting transcript & thumbnail",
    animClass: "animate-rock",
  },
  {
    emoji: "🔥",
    label: "Claude is cooking…",
    sub: "Identifying ingredients & steps",
    animClass: "animate-flicker",
  },
  {
    emoji: "✨",
    label: "Almost ready…",
    sub: "Saving your recipe",
    animClass: "animate-slow-spin",
  },
] as const;

// Advance to the next stage after these cumulative milliseconds
const ADVANCE_AT_MS = [8_000, 18_000, 28_000];

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export default function CookingLoader() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = ADVANCE_AT_MS.map((ms, i) =>
      setTimeout(() => setStage(i + 1), ms),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const { emoji, label, sub, animClass } = STAGES[stage];

  return (
    <div className="flex flex-col items-center gap-4 py-10">
      {/* Emoji — key forces re-mount so animation restarts on each stage */}
      <span key={stage} className={`text-6xl ${animClass} inline-block`}>
        {emoji}
      </span>

      <p className="text-white font-semibold text-base text-center">{label}</p>
      <p className="text-violet-300 text-xs text-center">{sub}</p>

      {/* Progress dots */}
      <div className="flex gap-2 mt-1">
        {STAGES.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-700 ${
              i <= stage ? "bg-amber-400 w-6" : "bg-white/20 w-3"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
