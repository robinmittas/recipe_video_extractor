import datetime
from typing import Optional

from pydantic import BaseModel


class Ingredient(BaseModel):
    name: str
    amount: Optional[str] = None
    unit: Optional[str] = None


class Recipe(BaseModel):
    title: str
    description: Optional[str] = None
    servings: Optional[str] = None
    prep_time: Optional[str] = None
    cook_time: Optional[str] = None
    ingredients: list[Ingredient]
    steps: list[str]
    source_url: str
    screenshot_base64: Optional[str] = None
    language: str = "en"


class RecipeInDB(Recipe):
    id: int
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


class RecipeSummary(BaseModel):
    """Lightweight recipe used in list views — no screenshot payload."""

    id: int
    title: str
    description: Optional[str] = None
    servings: Optional[str] = None
    prep_time: Optional[str] = None
    cook_time: Optional[str] = None
    source_url: str
    language: str
    created_at: datetime.datetime


class RecipeRequest(BaseModel):
    url: str
    language: str = "de"


class RecipeUpdate(BaseModel):
    """All fields optional — only supplied fields are updated."""

    title: Optional[str] = None
    description: Optional[str] = None
    servings: Optional[str] = None
    prep_time: Optional[str] = None
    cook_time: Optional[str] = None
    ingredients: Optional[list[Ingredient]] = None
    steps: Optional[list[str]] = None
    language: Optional[str] = None
