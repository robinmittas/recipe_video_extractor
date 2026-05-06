#!/usr/bin/env python
"""One-time migration: translate all stored recipes to German and clean titles.

Usage (local server must be running):
    conda activate recipe-extractor
    python scripts/translate_to_de.py

Against production:
    python scripts/translate_to_de.py --api-url https://YOUR_APP.onrender.com
"""

import argparse
import json
import os
import sys

import anthropic
import requests
from dotenv import load_dotenv

load_dotenv()

# ------------------------------------------------------------------
# Title + translation via Claude
# ------------------------------------------------------------------

_TOOL = {
    "name": "update_recipe",
    "description": "Return the translated and cleaned recipe fields.",
    "input_schema": {
        "type": "object",
        "required": ["title", "description", "ingredients", "steps"],
        "properties": {
            "title": {
                "type": "string",
                "description": "Short, clean German dish name (2–5 words, no marketing language).",
            },
            "description": {"type": "string"},
            "ingredients": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["name"],
                    "properties": {
                        "name":   {"type": "string"},
                        "amount": {"type": ["string", "null"]},
                        "unit":   {"type": ["string", "null"]},
                    },
                },
            },
            "steps": {"type": "array", "items": {"type": "string"}},
        },
    },
}


def _translate(client: anthropic.Anthropic, recipe: dict) -> dict:
    """Ask Claude to translate and clean a single recipe."""
    prompt = (
        "Translate the following recipe to German and clean the title.\n\n"
        "Title rules: short and appetising, 2–5 words, just the dish name "
        "(remove filler like 'Das beste', 'Easy', 'Quick', 'in X Minuten', etc.).\n"
        "Example: 'Das beste Butter Chicken Rezept in 20 Minuten' → 'Butter Chicken'\n\n"
        f"Current title: {recipe['title']}\n"
        f"Current language: {recipe['language']}\n\n"
        f"Description: {recipe.get('description') or ''}\n\n"
        f"Ingredients:\n{json.dumps(recipe['ingredients'], ensure_ascii=False, indent=2)}\n\n"
        f"Steps:\n{json.dumps(recipe['steps'], ensure_ascii=False, indent=2)}"
    )

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        tools=[_TOOL],
        tool_choice={"type": "tool", "name": "update_recipe"},
        messages=[{"role": "user", "content": prompt}],
    )

    for block in response.content:
        if block.type == "tool_use" and block.name == "update_recipe":
            return block.input

    raise RuntimeError("Claude did not return a tool_use block")


# ------------------------------------------------------------------
# Main
# ------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Translate all recipes to German.")
    parser.add_argument(
        "--api-url",
        default=os.environ.get("API_URL", "http://localhost:8000"),
        help="Base URL of the FastAPI backend (default: http://localhost:8000)",
    )
    args = parser.parse_args()
    api = args.api_url.rstrip("/")

    client = anthropic.Anthropic()

    # Fetch all recipe summaries
    summaries = requests.get(f"{api}/recipes").json()
    if not summaries:
        print("No recipes found.")
        return

    print(f"Found {len(summaries)} recipe(s).\n")

    for summary in summaries:
        rid   = summary["id"]
        title = summary["title"]
        lang  = summary["language"]

        # Fetch full recipe (includes ingredients + steps)
        recipe = requests.get(f"{api}/recipes/{rid}").json()

        print(f"[{rid}] '{title}' (lang={lang}) … ", end="", flush=True)

        try:
            translated = _translate(client, recipe)
        except Exception as exc:
            print(f"FEHLER: {exc}")
            continue

        payload = {
            "title":       translated["title"],
            "description": translated.get("description") or recipe.get("description"),
            "ingredients": translated["ingredients"],
            "steps":       translated["steps"],
            "language":    "de",
        }

        resp = requests.put(f"{api}/recipes/{rid}", json=payload)
        if resp.ok:
            print(f"→ '{translated['title']}' ✓")
        else:
            print(f"Update fehlgeschlagen: {resp.status_code} {resp.text}")

    print("\nFertig!")


if __name__ == "__main__":
    main()
