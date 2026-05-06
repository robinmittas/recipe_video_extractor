"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Props {
  recipeId: number;
  lang: string;
}

export default function ImageUploadButton({ recipeId, lang }: Props) {
  const inputRef          = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const router = useRouter();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`${API_URL}/recipes/${recipeId}/screenshot`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? "Upload fehlgeschlagen");
      }
      router.refresh();         // re-fetch server component data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Upload");
    } finally {
      setLoading(false);
      // reset so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="relative group">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        title={lang === "de" ? "Bild ersetzen" : "Replace image"}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors text-xs font-medium backdrop-blur-sm disabled:opacity-50"
      >
        {loading
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Camera className="w-3.5 h-3.5" />
        }
        {lang === "de" ? "Bild ersetzen" : "Replace image"}
      </button>

      {error && (
        <p className="absolute top-full mt-1 left-0 text-xs text-red-400 whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  );
}
