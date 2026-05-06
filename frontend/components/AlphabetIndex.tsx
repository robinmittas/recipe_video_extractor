"use client";

import { useRef } from "react";
import type { RecipeSummary } from "@/lib/api";
import RecipeCard from "./RecipeCard";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

const ALL_LETTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

function _group_by_letter(recipes: RecipeSummary[]): [string, RecipeSummary[]][] {
  const groups: Record<string, RecipeSummary[]> = {};
  for (const r of recipes) {
    const first = r.title.trim()[0]?.toUpperCase() ?? "#";
    const key   = /[A-Z]/.test(first) ? first : "#";
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }
  // Sort alphabetically, push "#" to the end
  return Object.entries(groups).sort(([a], [b]) =>
    a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b),
  );
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

interface Props {
  recipes: RecipeSummary[];
}

export default function AlphabetIndex({ recipes }: Props) {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const grouped     = _group_by_letter(recipes);
  const activeSet   = new Set(grouped.map(([letter]) => letter));

  const scrollTo = (letter: string) => {
    sectionRefs.current[letter]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex gap-2">
      {/* ----------------------------------------------------------
          Recipe sections
          ---------------------------------------------------------- */}
      <div className="flex-1 min-w-0 space-y-8">
        {grouped.map(([letter, group]) => (
          <section
            key={letter}
            ref={(el) => { sectionRefs.current[letter] = el; }}
            className="scroll-mt-24"
          >
            {/* Letter divider */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl font-bold text-white/25 tracking-widest w-8 shrink-0">
                {letter}
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {group.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ----------------------------------------------------------
          A–Z Sidebar
          ---------------------------------------------------------- */}
      <div
        className="sticky top-20 self-start flex flex-col items-center w-6 shrink-0 max-h-[70vh] overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {ALL_LETTERS.map((letter) => {
          const active = activeSet.has(letter);
          return (
            <button
              key={letter}
              onClick={() => active && scrollTo(letter)}
              disabled={!active}
              aria-label={`Jump to ${letter}`}
              className={[
                "text-[10px] font-bold leading-none py-[3px] w-full text-center rounded select-none transition-colors",
                active
                  ? "text-violet-300 hover:text-white hover:bg-white/10 cursor-pointer"
                  : "text-white/15 cursor-default",
              ].join(" ")}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
