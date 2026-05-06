import Link from "next/link";
import Nav from "@/components/Nav";
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">My Recipes</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 rounded-xl text-sm font-semibold text-stone-900 transition-colors"
          >
            + New
          </Link>
        </div>

        <form className="mb-6">
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search recipes…"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          />
        </form>

        {recipes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-stone-300">
            <span className="text-5xl">🍽</span>
            <p className="text-sm">
              {q ? `No recipes matching "${q}"` : "No recipes yet — add your first one!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
