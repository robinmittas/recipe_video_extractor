const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface Ingredient {
  name: string;
  amount: string | null;
  unit: string | null;
}

export interface RecipeSummary {
  id: number;
  title: string;
  description: string | null;
  servings: string | null;
  prep_time: string | null;
  cook_time: string | null;
  source_url: string;
  language: string;
  created_at: string;
}

export interface Recipe extends RecipeSummary {
  ingredients: Ingredient[];
  steps: string[];
  screenshot_base64: string | null;
}

export function screenshotUrl(id: number): string {
  return `${API_URL}/recipes/${id}/screenshot`;
}

export async function extractRecipe(url: string, language: string): Promise<Recipe> {
  const res = await fetch(`${API_URL}/recipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, language }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Extraction failed");
  }
  return res.json();
}

export async function listRecipes(search?: string): Promise<RecipeSummary[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`${API_URL}/recipes${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch recipes");
  return res.json();
}

export async function getRecipe(id: number): Promise<Recipe> {
  const res = await fetch(`${API_URL}/recipes/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Recipe not found");
  return res.json();
}

export async function deleteRecipe(id: number): Promise<void> {
  await fetch(`${API_URL}/recipes/${id}`, { method: "DELETE" });
}
