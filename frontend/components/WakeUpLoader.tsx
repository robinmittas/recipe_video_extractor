"use client";

import { useEffect, useState } from "react";

// ------------------------------------------------------------------
// Stages — kitchen prep while Render wakes up (~50 s cold start)
// ------------------------------------------------------------------

const STAGES = [
  {
    emoji: "😴",
    label: "Server schläft noch…",
    sub:   "Render Free Tier schläft nach 15 Min. ein",
    animClass: "animate-bounce",
  },
  {
    emoji: "🔪",
    label: "Messer wird gewetzt…",
    sub:   "Verbindung wird aufgebaut",
    animClass: "animate-[rock_0.4s_ease-in-out_infinite]",
  },
  {
    emoji: "🥕",
    label: "Zutaten werden vorbereitet…",
    sub:   "Datenbank wird geladen",
    animClass: "animate-bounce",
  },
  {
    emoji: "🧅",
    label: "Zwiebeln werden geschnitten…",
    sub:   "Fast verbunden (Tränen sind normal 😅)",
    animClass: "animate-[rock_0.5s_ease-in-out_infinite]",
  },
  {
    emoji: "🫙",
    label: "Gewürze werden abgemessen…",
    sub:   "Letzter Schritt…",
    animClass: "animate-[slow-spin_3s_linear_infinite]",
  },
  {
    emoji: "🍳",
    label: "Gleich geht's los!",
    sub:   "Server ist fast wach",
    animClass: "animate-pulse",
  },
] as const;

// Advance every ~8 s — total ~48 s covers Render cold-start window
const ADVANCE_EVERY_MS = 8_000;

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export default function WakeUpLoader() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStage((s) => (s < STAGES.length - 1 ? s + 1 : s));
    }, ADVANCE_EVERY_MS);
    return () => clearInterval(id);
  }, []);

  const { emoji, label, sub, animClass } = STAGES[stage];

  return (
    <div className="flex flex-col items-center gap-5 py-24">
      <span key={stage} className={`text-7xl inline-block ${animClass}`}>
        {emoji}
      </span>

      <p className="text-white font-semibold text-lg text-center">{label}</p>
      <p className="text-violet-300 text-sm text-center max-w-xs">{sub}</p>

      {/* Stage dots */}
      <div className="flex gap-1.5 mt-2">
        {STAGES.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-700 ${
              i <= stage ? "bg-amber-400 w-5" : "bg-white/20 w-2.5"
            }`}
          />
        ))}
      </div>

      <p className="text-white/25 text-xs text-center mt-4 max-w-xs">
        Render Free Tier schläft nach 15 Min. Inaktivität ein.
        <br />
        Der erste Request dauert bis zu 60 Sekunden — danach läuft alles normal.
      </p>
    </div>
  );
}
