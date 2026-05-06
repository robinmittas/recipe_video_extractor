import base64
import json
import tempfile
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy.orm import Session

load_dotenv()

from .database import RecipeRecord, get_db, init_db
from .downloader import download_video
from .models import Ingredient, Recipe, RecipeInDB, RecipeRequest, RecipeSummary
from .recipe_parser import parse_recipe
from .screenshot import extract_screenshot
from .transcriber import get_transcript

app = FastAPI(title="Recipe Video Extractor", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    init_db()


# ------------------------------------------------------------------
# Health
# ------------------------------------------------------------------

@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}


# ------------------------------------------------------------------
# Extract + save
# ------------------------------------------------------------------

@app.post("/recipe", response_model=RecipeInDB)
async def extract_recipe(request: RecipeRequest, db: Session = Depends(get_db)) -> RecipeInDB:
    """Download a video, extract the recipe via Claude, and persist it.

    Args:
        request: URL and target language.

    Returns:
        Saved RecipeInDB with auto-assigned id.

    Raises:
        HTTPException: 400 if the video cannot be downloaded.
        HTTPException: 500 if processing or Claude extraction fails.
    """
    with tempfile.TemporaryDirectory() as tmp_dir:
        try:
            video_data = download_video(request.url, tmp_dir)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Failed to download video: {exc}")

        try:
            transcript = get_transcript(video_data, request.url)
            screenshot_b64 = extract_screenshot(video_data.video_path, video_data.duration)
            recipe = parse_recipe(
                transcript=transcript,
                description=video_data.description,
                title=video_data.title,
                screenshot_b64=screenshot_b64,
                source_url=request.url,
                language=request.language,
            )
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Failed to process video: {exc}")

        return _save_recipe(db, recipe)


# ------------------------------------------------------------------
# Library CRUD
# ------------------------------------------------------------------

@app.get("/recipes", response_model=list[RecipeSummary])
def list_recipes(search: Optional[str] = None, db: Session = Depends(get_db)) -> list[RecipeSummary]:
    query = db.query(RecipeRecord)
    if search:
        query = query.filter(RecipeRecord.title.ilike(f"%{search}%"))
    records = query.order_by(RecipeRecord.created_at.desc()).all()
    return [_to_summary(r) for r in records]


@app.get("/recipes/{recipe_id}", response_model=RecipeInDB)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)) -> RecipeInDB:
    record = _get_or_404(db, recipe_id)
    return _to_full(record)


@app.get("/recipes/{recipe_id}/screenshot")
def get_screenshot(recipe_id: int, db: Session = Depends(get_db)) -> Response:
    record = _get_or_404(db, recipe_id)
    if not record.screenshot_base64:
        raise HTTPException(status_code=404, detail="No screenshot for this recipe")
    return Response(content=base64.b64decode(record.screenshot_base64), media_type="image/jpeg")


@app.delete("/recipes/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)) -> dict:
    record = _get_or_404(db, recipe_id)
    db.delete(record)
    db.commit()
    return {"deleted": recipe_id}


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def _get_or_404(db: Session, recipe_id: int) -> RecipeRecord:
    record = db.query(RecipeRecord).filter(RecipeRecord.id == recipe_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return record


def _save_recipe(db: Session, recipe: Recipe) -> RecipeInDB:
    record = RecipeRecord(
        title=recipe.title,
        description=recipe.description,
        servings=recipe.servings,
        prep_time=recipe.prep_time,
        cook_time=recipe.cook_time,
        ingredients=json.dumps([i.model_dump() for i in recipe.ingredients]),
        steps=json.dumps(recipe.steps),
        source_url=recipe.source_url,
        screenshot_base64=recipe.screenshot_base64,
        language=recipe.language,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _to_full(record)


def _to_full(record: RecipeRecord) -> RecipeInDB:
    return RecipeInDB(
        id=record.id,
        title=record.title,
        description=record.description,
        servings=record.servings,
        prep_time=record.prep_time,
        cook_time=record.cook_time,
        ingredients=[Ingredient(**i) for i in json.loads(record.ingredients)],
        steps=json.loads(record.steps),
        source_url=record.source_url,
        screenshot_base64=record.screenshot_base64,
        language=record.language,
        created_at=record.created_at,
    )


def _to_summary(record: RecipeRecord) -> RecipeSummary:
    return RecipeSummary(
        id=record.id,
        title=record.title,
        description=record.description,
        servings=record.servings,
        prep_time=record.prep_time,
        cook_time=record.cook_time,
        source_url=record.source_url,
        language=record.language,
        created_at=record.created_at,
    )
