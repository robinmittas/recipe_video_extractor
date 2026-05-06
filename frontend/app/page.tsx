"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Nav from "@/components/Nav";
import CookingLoader from "@/components/CookingLoader";
import { extractRecipe } from "@/lib/api";

export default function HomePage() {
  const [url, setUrl]           = useState("");
  const [language, setLanguage] = useState<"en" | "de">("de");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const recipe = await extractRecipe(url.trim(), language);
      router.push(`/recipes/${recipe.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="max-w-md mx-auto px-4 pt-16 pb-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Cook anything.
          </h1>
          <p className="text-purple-300 text-base">
            Paste a YouTube or Instagram cooking video — get a clean recipe instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL input row */}
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/shorts/…"
              disabled={loading}
              autoFocus
              className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50 text-sm backdrop-blur-sm"
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-4 py-3 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 disabled:opacity-40 rounded-xl text-stone-900 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Language toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 mr-1">Language</span>
            {(["en", "de"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  language === lang
                    ? "bg-amber-400 text-stone-900"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Loading animation */}
          {loading && <CookingLoader />}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-900/40 border border-red-500/30 rounded-xl text-red-300 text-sm backdrop-blur-sm">
              {error}
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
