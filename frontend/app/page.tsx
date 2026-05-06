"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Nav from "@/components/Nav";
import { extractRecipe } from "@/lib/api";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState<"en" | "de">("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-stone-900 mb-3 tracking-tight">
            Cook anything.
          </h1>
          <p className="text-stone-400 text-base">
            Paste a YouTube or Instagram cooking video — get a clean recipe instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/shorts/..."
              disabled={loading}
              autoFocus
              className="flex-1 px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 text-sm"
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-4 py-3 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 disabled:opacity-40 rounded-xl text-stone-900 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 mr-1">Language</span>
            {(["en", "de"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  language === lang
                    ? "bg-amber-400 text-stone-900"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-stone-400 text-sm text-center">
                Downloading and extracting recipe…
                <br />
                <span className="text-stone-300 text-xs">This can take up to 30 seconds</span>
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm">
              {error}
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
