import Link from "next/link";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-10 bg-purple-950/70 backdrop-blur-md border-b border-white/10 px-4 py-3 print:hidden">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-white text-lg tracking-tight">
          🍳 Recipes
        </Link>
        <Link
          href="/library"
          className="text-sm text-purple-300 hover:text-white font-medium transition-colors"
        >
          My Library
        </Link>
      </div>
    </nav>
  );
}
