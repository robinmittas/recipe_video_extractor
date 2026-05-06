import anthropic

from .models import Ingredient, Recipe

# ------------------------------------------------------------------
# Tool definition for structured Claude output
# ------------------------------------------------------------------

_RECIPE_TOOL: dict = {
    "name": "extract_recipe",
    "description": "Extract a structured cooking recipe from video content.",
    "input_schema": {
        "type": "object",
        "properties": {
            "title": {"type": "string", "description": "Recipe name"},
            "description": {"type": "string", "description": "Brief recipe description"},
            "servings": {"type": "string", "description": "Number of servings, e.g. '4 servings'"},
            "prep_time": {"type": "string", "description": "Preparation time, e.g. '15 minutes'"},
            "cook_time": {"type": "string", "description": "Cooking time, e.g. '30 minutes'"},
            "ingredients": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "amount": {"type": "string"},
                        "unit": {"type": "string"},
                    },
                    "required": ["name"],
                },
            },
            "steps": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Step-by-step cooking instructions",
            },
        },
        "required": ["title", "ingredients", "steps"],
    },
}

_LANGUAGE_NAMES = {"en": "English", "de": "German"}


# ------------------------------------------------------------------
# Public entry point
# ------------------------------------------------------------------

def parse_recipe(
    transcript: str,
    description: str,
    title: str,
    screenshot_b64: str,
    source_url: str,
    language: str = "en",
) -> Recipe:
    """Extract a structured recipe from video content using Claude.

    Args:
        transcript: Video transcript or captions text.
        description: Video description from the platform.
        title: Video title.
        screenshot_b64: Base64-encoded JPEG screenshot from the video.
        source_url: Original video URL to store on the recipe.
        language: Output language code, e.g. 'en' or 'de'.

    Returns:
        Structured Recipe with ingredients and step-by-step instructions.
    """
    client = anthropic.Anthropic()
    prompt = _build_prompt(title, description, transcript, language)

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        tools=[_RECIPE_TOOL],
        tool_choice={"type": "tool", "name": "extract_recipe"},
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": screenshot_b64,
                        },
                    },
                    {"type": "text", "text": prompt},
                ],
            }
        ],
    )

    tool_use = next(b for b in response.content if b.type == "tool_use")
    return _build_recipe(tool_use.input, screenshot_b64, source_url, language)


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def _build_prompt(title: str, description: str, transcript: str, language: str) -> str:
    lang_name = _LANGUAGE_NAMES.get(language, "English")
    parts = [f"Video title: {title}\n"]

    if description:
        parts.append(f"Video description:\n{description}\n")

    if transcript:
        parts.append(f"Video transcript:\n{transcript}\n")

    parts.append(
        f"Extract the complete cooking recipe from all sources above "
        f"(screenshot, description, transcript). "
        f"Prefer the description if it contains the full ingredient list and steps. "
        f"Return the entire recipe — title, description, ingredient names, and all steps — in {lang_name}."
    )
    return "\n".join(parts)


def _build_recipe(data: dict, screenshot_b64: str, source_url: str, language: str) -> Recipe:
    ingredients = [
        Ingredient(
            name=item["name"],
            amount=item.get("amount"),
            unit=item.get("unit"),
        )
        for item in data.get("ingredients", [])
    ]

    return Recipe(
        title=data["title"],
        description=data.get("description"),
        servings=data.get("servings"),
        prep_time=data.get("prep_time"),
        cook_time=data.get("cook_time"),
        ingredients=ingredients,
        steps=data.get("steps", []),
        source_url=source_url,
        screenshot_base64=screenshot_b64,
        language=language,
    )
