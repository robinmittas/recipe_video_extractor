import Link from "next/link";
import { Clock, Users } from "lucide-react";
import type { RecipeSummary } from "@/lib/api";
import { screenshotUrl } from "@/lib/api";

export default function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-stone-100"
    >
      <div className="aspect-video bg-stone-100 overflow-hidden">
        <img
          src={screenshotUrl(recipe.id)}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 mb-2">
          {recipe.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-stone-400">
          {recipe.cook_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {recipe.cook_time}
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1 ml-auto">
              <Users className="w-3 h-3" />
              {recipe.servings}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
