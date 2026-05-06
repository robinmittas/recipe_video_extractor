# 🍳 Recipe Video Extractor

Turn any YouTube or Instagram cooking video into a structured recipe with ingredients, steps, and a screenshot — in seconds.

**Stack:** FastAPI · Claude API · yt-dlp · Whisper · Next.js · SQLite · Railway · Vercel

---

## How it works

```
URL (YouTube / Instagram)
        │
        ├── yt-dlp          → download video + description
        ├── youtube-transcript-api / Whisper → transcript
        ├── ffmpeg          → screenshot at 25% of video
        └── Claude API      → structured recipe (title, ingredients, steps)
                │
                └── saved to SQLite → served via FastAPI → displayed in Next.js PWA
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- [ffmpeg](https://ffmpeg.org/) installed (`brew install ffmpeg` on Mac)
- An [Anthropic API key](https://console.anthropic.com/)
- *(Optional)* An [OpenAI API key](https://platform.openai.com/) — only needed for Instagram videos without a description

---

## Running locally

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/recipe-video-extractor.git
cd recipe-video-extractor
```

### 2. Backend

```bash
# Create and activate a conda env (or any venv)
conda create -n recipe-extractor python=3.11
conda activate recipe-extractor

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Start the server (runs on http://localhost:8000)
python run.py
```

The API docs are available at **http://localhost:8000/docs**

**Test with curl:**
```bash
curl -X POST http://localhost:8000/recipe \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/shorts/YOUR_VIDEO_ID", "language": "en"}'
```

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# .env.local already points to http://localhost:8000 — no changes needed locally

# Start the dev server (runs on http://localhost:3000)
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Deploying to production

### Step 1 — Push to GitHub

Create a new repo at [github.com/new](https://github.com/new), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/recipe-video-extractor.git
git push -u origin main
```

---

### Step 2 — Deploy backend on Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your `recipe-video-extractor` repo
3. Railway auto-detects the `Dockerfile` → click **Deploy**
4. Go to the **Variables** tab and add:

   | Key | Value |
   |-----|-------|
   | `ANTHROPIC_API_KEY` | `sk-ant-...` |
   | `OPENAI_API_KEY` | `sk-...` *(optional — Instagram audio only)* |

5. Go to **Settings** → **Networking** → **Generate Domain**
   → you get a URL like `https://recipe-video-extractor.up.railway.app`

> **Note on the database:** Railway runs containers, so `recipes.db` resets on each redeploy by default. To persist recipes across deploys, add a **Volume** in Railway mounted at `/app` — Railway will keep the file between deploys.

---

### Step 3 — Deploy frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Under **Environment Variables** add:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://your-app.up.railway.app` |

4. Click **Deploy** → you get a URL like `https://recipe-video-extractor.vercel.app`

---

### Step 4 — Install on iPhone as a PWA

1. Open your Vercel URL in **Safari on iPhone** (must be Safari)
2. Tap the **Share** button (square with arrow ↑)
3. Tap **Add to Home Screen**
4. The app appears on your home screen as a fullscreen native-like app

---

## Redeployment

Once Railway and Vercel are connected to GitHub, redeployment is just:

```bash
git add .
git commit -m "describe your change"
git push origin main
# Railway and Vercel auto-redeploy within ~2 minutes
```

---

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/recipe` | Extract and save a recipe from a video URL |
| `GET` | `/recipes` | List all saved recipes (supports `?search=pasta`) |
| `GET` | `/recipes/{id}` | Get a single recipe with full details |
| `GET` | `/recipes/{id}/screenshot` | Get the recipe screenshot as JPEG |
| `DELETE` | `/recipes/{id}` | Delete a recipe |
| `GET` | `/health` | Health check |

**POST `/recipe` body:**
```json
{
  "url": "https://www.youtube.com/shorts/...",
  "language": "en"
}
```
Supported languages: `en` (English), `de` (German)

---

## Cost per video

| Service | Cost |
|---------|------|
| yt-dlp (video download) | Free |
| YouTube captions | Free |
| OpenAI Whisper (Instagram audio) | ~$0.001–0.009 |
| Claude Sonnet (recipe extraction) | ~$0.013–0.015 |
| **Total per video** | **~$0.01–0.02** |

---

## Project structure

```
recipe-video-extractor/
├── app/
│   ├── main.py          # FastAPI app + all endpoints
│   ├── models.py        # Pydantic schemas
│   ├── database.py      # SQLAlchemy + SQLite setup
│   ├── downloader.py    # yt-dlp video download
│   ├── transcriber.py   # YouTube captions + Whisper fallback
│   ├── screenshot.py    # ffmpeg frame extraction
│   └── recipe_parser.py # Claude API recipe extraction
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Home — URL input
│   │   ├── library/page.tsx      # Recipe library + search
│   │   └── recipes/[id]/page.tsx # Recipe detail
│   ├── components/
│   │   ├── Nav.tsx
│   │   └── RecipeCard.tsx
│   └── lib/api.ts        # API client
├── Dockerfile            # Backend container for Railway
├── railway.toml          # Railway config
├── requirements.txt
└── run.py                # Local dev server
```
