# 🍳 Recipe Video Extractor

Turn any YouTube or Instagram cooking video into a structured recipe with ingredients, steps, and a screenshot — in seconds.

**Stack:** FastAPI · Claude API · yt-dlp · Next.js · SQLite · Turso · Render · Vercel

---

## How it works

```
URL (YouTube / Instagram)
        │
        ├── yt-dlp                        → download video + description
        ├── youtube-transcript-api/Whisper → transcript
        ├── ffmpeg                         → screenshot at 25% of video
        └── Claude API                     → structured recipe (title, ingredients, steps)
                │
                └── saved to Turso (hosted SQLite) → FastAPI → Next.js PWA
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- [ffmpeg](https://ffmpeg.org/) — `brew install ffmpeg` on Mac
- An [Anthropic API key](https://console.anthropic.com/) — required
- An [OpenAI API key](https://platform.openai.com/) — optional, only for Instagram videos without a description

---

## Running locally

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/recipe-video-extractor.git
cd recipe-video-extractor
```

### 2. Backend

```bash
# Create and activate a conda environment
conda create -n recipe-extractor python=3.11
conda activate recipe-extractor

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Open .env and fill in your ANTHROPIC_API_KEY
# Leave TURSO_* empty for local dev — it will use a local recipes.db file instead

# Start the server → http://localhost:8000
python run.py
```

API docs available at **http://localhost:8000/docs**

**Quick test:**
```bash
curl -X POST http://localhost:8000/recipe -H "Content-Type: application/json" -d '{"url": "https://www.youtube.com/shorts/YOUR_VIDEO_ID", "language": "en"}'
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# .env.local already points to http://localhost:8000 — no changes needed

npm run dev   # → http://localhost:3000
```

---

## Deploying to production

### Step 1 — Push to GitHub

Create a new **private** repo at [github.com/new](https://github.com/new), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/recipe-video-extractor.git
git push -u origin main
```

> **Note:** GitHub no longer accepts passwords — use a Personal Access Token.
> GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → tick `repo` → copy the `ghp_...` token and use it as your password.

---

### Step 2 — Set up Turso (persistent database)

The database is hosted on [Turso](https://turso.tech) — free tier, persists across all redeploys.

**Option A — via browser (no CLI needed):**
1. Go to [turso.tech](https://turso.tech) → Sign up (free)
2. Click **Create Database** → name it `recipe-extractor` → pick a region close to you
3. Open the database → click **Generate Token** → copy it
4. Copy the database URL shown on the page (looks like `libsql://recipe-extractor-xxx.turso.io`)

**Option B — via CLI:**
```bash
curl -sSfL https://get.tur.so/install.sh | bash  # install CLI
turso auth login                                   # opens browser
turso db create recipe-extractor
turso db show recipe-extractor --url               # copy the URL
turso db tokens create recipe-extractor            # copy the token
```

Save these two values — you'll need them in Steps 3 and 4.

---

### Step 3 — Deploy backend on Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect GitHub → select your `recipe-video-extractor` repo
3. Set **Runtime** to **Docker**
4. Under **Environment Variables** add:

   | Key | Value |
   |-----|-------|
   | `ANTHROPIC_API_KEY` | `sk-ant-...` |
   | `TURSO_DATABASE_URL` | `libsql://recipe-extractor-xxx.turso.io` |
   | `TURSO_AUTH_TOKEN` | your Turso token |
   | `OPENAI_API_KEY` | `sk-...` *(optional)* |

5. Click **Deploy** → you get a URL like `https://recipe-video-extractor.onrender.com`

> **Free tier note:** Render spins the service down after 15 min of inactivity. The first request after a break takes ~50 seconds to wake up. This is normal and fine for personal use.

---

### Step 4 — Deploy frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Under **Environment Variables** add:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://recipe-video-extractor.onrender.com` |

4. Click **Deploy** → you get a URL like `https://recipe-video-extractor.vercel.app`

---

### Step 5 — Install on iPhone and Android as a PWA

The app is a **PWA (Progressive Web App)** — it installs directly from the browser on both platforms. No App Store or Play Store needed.

**iPhone (Safari only):**
1. Open your Vercel URL in **Safari** (must be Safari, not Chrome)
2. Tap the **Share** button (square with arrow ↑)
3. Tap **Add to Home Screen**
4. The app appears as a fullscreen icon on your home screen

**Android (Chrome or any Chromium browser):**
1. Open your Vercel URL in **Chrome**
2. Chrome automatically shows an **"Add to Home Screen"** or **"Install App"** banner at the bottom
3. Tap it — or tap the three-dot menu → **Add to Home Screen**
4. The app appears as a fullscreen icon on your home screen

| | iPhone | Android |
|---|---|---|
| Required browser | Safari | Chrome, Edge, Brave, Samsung Browser |
| How | Share → Add to Home Screen | Banner auto-appears or menu → Add to Home Screen |
| Fullscreen | ✅ | ✅ |

**To test locally on your phone (same WiFi as your Mac):**
```bash
ipconfig getifaddr en0   # get your Mac's local IP, e.g. 192.168.1.42
# Then open http://192.168.1.42:3000 in your phone browser
```

---

### Step 6 — Add your app icon (optional)

1. Open `generate_icon.html` in your browser
2. Click **Download apple-touch-icon.png**
3. Save it to `frontend/public/apple-touch-icon.png`
4. Commit and push

---

## Redeployment

Once Render and Vercel are connected to GitHub, every push auto-redeploys both:

```bash
git add .
git commit -m "describe your change"
git push origin main
# Render + Vercel redeploy automatically within ~2 minutes
```

---

## How the database works

| Event | DB affected? |
|-------|-------------|
| Service sleeps (inactivity) | ❌ No — data safe in Turso |
| You push a new deploy | ❌ No — data safe in Turso |
| Local development | Uses local `recipes.db` file (auto-created) |

Without Turso env vars set, the backend falls back to a local `recipes.db` file — convenient for development without needing a Turso account.

---

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/recipe` | Extract and save a recipe from a video URL |
| `GET` | `/recipes` | List saved recipes (supports `?search=pasta`) |
| `GET` | `/recipes/{id}` | Get a single recipe with full details |
| `GET` | `/recipes/{id}/screenshot` | Recipe screenshot as JPEG |
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
| Turso database | Free (up to 500 DBs / 9 GB) |
| Render hosting | Free |
| Vercel hosting | Free |
| OpenAI Whisper (Instagram audio) | ~$0.001–0.009 |
| Claude Sonnet (recipe extraction) | ~$0.013–0.015 |
| **Total per video** | **~$0.01–0.02** |

---

## Project structure

```
recipe-video-extractor/
├── app/
│   ├── main.py           # FastAPI app + all endpoints
│   ├── models.py         # Pydantic schemas
│   ├── database.py       # SQLAlchemy — Turso (prod) or SQLite (dev)
│   ├── downloader.py     # yt-dlp video download
│   ├── transcriber.py    # YouTube captions + Whisper fallback
│   ├── screenshot.py     # ffmpeg frame extraction
│   └── recipe_parser.py  # Claude API recipe extraction
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Home — URL input + language toggle
│   │   ├── library/page.tsx       # Recipe library + search
│   │   └── recipes/[id]/page.tsx  # Recipe detail + PDF export
│   ├── components/
│   │   ├── Nav.tsx
│   │   └── RecipeCard.tsx
│   └── lib/api.ts         # API client
├── Dockerfile             # Backend container (used by Render)
├── generate_icon.html     # One-click PWA icon generator
├── requirements.txt
└── run.py                 # Local dev server
```
