import Link from "next/link";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-10 bg-stone-50/90 backdrop-blur-sm border-b border-stone-100 px-4 py-3 print:hidden">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-stone-900 text-lg tracking-tight">
          🍳 Recipes
        </Link>
        <Link
          href="/library"
          className="text-sm text-stone-500 hover:text-stone-900 font-medium transition-colors"
        >
          My Library
        </Link>
      </div>
    </nav>
  );
}
