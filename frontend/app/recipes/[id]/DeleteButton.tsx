"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteRecipe } from "@/lib/api";

export default function DeleteButton({ recipeId }: { recipeId: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Delete this recipe?")) return;
    await deleteRecipe(recipeId);
    router.push("/library");
  };

  return (
    <button
      onClick={handleDelete}
      className="p-2 text-stone-300 hover:text-red-400 active:text-red-600 transition-colors rounded-lg"
      aria-label="Delete recipe"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
}
