import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Users, ExternalLink, ChevronLeft, BookOpen, PlusCircle } from "lucide-react";
import Nav from "@/components/Nav";
import DeleteButton from "./DeleteButton";
import PrintButton from "./PrintButton";
import { getRecipe } from "@/lib/api";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params;

  let recipe;
  try {
    recipe = await getRecipe(Number(id));
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen pb-16">
      <Nav />

      <div className="max-w-lg mx-auto">
        {/* Screenshot / thumbnail */}
        {recipe.screenshot_base64 && (
          <div className="aspect-video w-full overflow-hidden bg-purple-950/50">
            <img
              src={`data:image/jpeg;base64,${recipe.screenshot_base64}`}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="px-4 pt-5">
          {/* Top bar — back | actions */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 -ml-1">
              <Link
                href="/library"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                {recipe.language === "de" ? "Bibliothek" : "Library"}
              </Link>
              <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-white/40 font-medium uppercase tracking-wide">
                {recipe.language}
              </span>
            </div>
            <div className="flex items-center gap-1 print:hidden">
              <PrintButton />
              <DeleteButton recipeId={recipe.id} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-3 leading-tight">
            {recipe.title}
          </h1>

          {/* Meta pills */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-purple-300">
            {recipe.prep_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> Prep {recipe.prep_time}
              </span>
            )}
            {recipe.cook_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> Cook {recipe.cook_time}
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> {recipe.servings}
              </span>
            )}
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 ml-auto"
            >
              Source <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {recipe.description && (
            <p className="text-purple-200/70 text-sm leading-relaxed mb-6">{recipe.description}</p>
          )}

          {/* Ingredients */}
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-white/50 mb-3 uppercase tracking-widest">
              Ingredients
            </h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 flex-shrink-0" />
                  <span className="text-white/80 text-sm">
                    {ing.amount && (
                      <span className="font-semibold text-white">{ing.amount} </span>
                    )}
                    {ing.unit && <span className="text-purple-300">{ing.unit} </span>}
                    {ing.name}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Steps */}
          <section>
            <h2 className="text-xs font-semibold text-white/50 mb-3 uppercase tracking-widest">
              Steps
            </h2>
            <ol className="space-y-3">
              {recipe.steps.map((step, i) => (
                <li
                  key={i}
                  className="flex gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10"
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-400 text-stone-900 font-bold text-xs flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-white/70 text-sm leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </section>
          {/* Bottom nav — Fertig / Done */}
          <div className="flex gap-3 mt-10 pb-4 print:hidden">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl bg-white/10 border border-white/10 text-white/70 hover:bg-white/15 hover:text-white transition-colors text-sm font-medium backdrop-blur-sm"
            >
              <PlusCircle className="w-4 h-4" />
              {recipe.language === "de" ? "Neues Rezept" : "New Recipe"}
            </Link>
            <Link
              href="/library"
              className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-900 transition-colors text-sm font-bold"
            >
              <BookOpen className="w-4 h-4" />
              {recipe.language === "de" ? "Fertig — Bibliothek" : "Done — Library"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
