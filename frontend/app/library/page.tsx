import Link from "next/link";
import Nav from "@/components/Nav";
import AlphabetIndex from "@/components/AlphabetIndex";
import RecipeCard from "@/components/RecipeCard";
import { listRecipes } from "@/lib/api";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function LibraryPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const recipes = await listRecipes(q);

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="max-w-2xl mx-auto px-4 pt-8 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">My Recipes</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 rounded-xl text-sm font-semibold text-stone-900 transition-colors"
          >
            + New
          </Link>
        </div>

        {/* Search */}
        <form className="mb-6">
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search recipes…"
            className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm backdrop-blur-sm"
          />
        </form>

        {/* Empty states */}
        {recipes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-white/30">
            <span className="text-5xl">🍽</span>
            <p className="text-sm">
              {q ? `No recipes matching "${q}"` : "No recipes yet — add your first one!"}
            </p>
          </div>
        ) : q ? (
          /* Search results — plain grid, no A-Z needed */
          <div className="grid grid-cols-2 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          /* Full library — A-Z grouped list with sidebar */
          <AlphabetIndex recipes={recipes} />
        )}
      </main>
    </div>
  );
}
