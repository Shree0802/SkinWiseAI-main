# SkinWise AI 🌿✨
### Explainable Skincare Decision Assistant powered by YouCam Skin AI API

[![Built for YouCam API Hackathon](https://img.shields.io/badge/Devpost-YouCam%20Skin%20AI%20Hackathon%202026-6366F1?style=for-the-badge)](https://devpost.com)
[![Python FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.13-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React Vite TS](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20TypeScript-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Tests Passing](https://img.shields.io/badge/Tests-19%20Pytest%20%2B%205%20Vitest%20Passed-10B981?style=for-the-badge)](https://pytest.org)

**SkinWise AI** solves a critical consumer problem: helping students and skincare consumers navigate overwhelming skincare shelves with objective computer vision diagnostics, explainable cosmetic routines, and smart shopping in **Indian Rupees (₹)**.

---

## 🌟 Key Features

1. **Real YouCam Skin AI Integration (Server-to-Server v2.0)**:
   - Implements Perfect Corp's official enterprise pipeline: file initialization (`POST /s2s/v2.0/file`), binary PUT upload to signed storage URL, task generation (`POST /s2s/v2.0/task/skin-analysis`), and bounded polling (`GET /s2s/v2.0/task/skin-analysis/{task_id}`).
   - Extracts empirical scores for wrinkles, pores, skin texture, dark spots, redness, oiliness, hydration, and dark eye circles.
2. **Zero-Fabrication Policy**:
   - Never hallucinates, guesses, or invents missing metrics. If the API omits a field, it remains transparently labeled as unassessed.
3. **Transparent Routine Builder**:
   - Deterministic rule engine constructing Morning (AM) and Evening (PM) cosmetic routines with explicit rationales, patch-test guidance, and non-medical disclaimers.
4. **Smart Indian Skincare Shopping (₹)**:
   - Curated product catalogue priced in Indian Rupees (₹) with an explainable multi-vector matching algorithm that calculates match scores and explicit reasons.
   - Interactive side-by-side comparison drawer for up to 3 products.
5. **Skin Progress Journal**:
   - Record daily observations, track skin feel changes, and link past diagnostic scans stored locally in SQLite with full deletion controls.
6. **Privacy-First Design**:
   - Zero-selfie retention: facial images are processed ephemerally in memory and never written to disk or database.

---

## 🏗️ Project Architecture

```
skinwise-ai/
  frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS
    src/
      components/               # Navbar, Footer, MetricCard, ProductCard, ComparisonDrawer, etc.
      pages/                    # LandingPage, AnalysisPage, ResultsPage, RoutinePage, ShopPage, JournalPage
      services/                 # apiClient.ts (Typed Fetch wrapper)
      types/                    # TypeScript interfaces
      tests/                    # Vitest component & calculation tests
    package.json
    .env.example
  backend/                      # FastAPI Python Application
    app/
      api/                      # Versioned routers (health, analysis, routine, products, journal)
      models/                   # Pydantic schemas & SQLAlchemy DB models
      services/                 # youcam_client.py, routine_engine.py, catalog_service.py
      config.py                 # Pydantic BaseSettings
      database.py               # SQLite database & session management
      main.py                   # FastAPI entrypoint
    tests/                      # Pytest automated test suite (19 tests)
    requirements.txt
    .env.example
  docs/
    ARCHITECTURE.md             # Integration flow & sequence diagram
    DEVPOST_SUBMISSION.md       # Devpost hackathon submission draft
    DEMO_VIDEO_SCRIPT.md        # 2.5 minute video demo walkthrough
    SCREENSHOT_CHECKLIST.md     # Screenshot checklist for submission
  .gitignore
  README.md
  CLAUDE.md
```

---

## 🚀 Quick Start Guide (Windows PowerShell)

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)

---

### Step 1: Configure Backend Environment

```powershell
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
APP_NAME=SkinWise AI
APP_ENV=development
DEBUG=True

# YouCam API Configuration (Perfect Corp S2S)
# Obtain your API Key from: https://docs.makeupar.com
YOUCAM_API_KEY=YOUR_YOUCAM_API_KEY_HERE
YOUCAM_API_BASE_URL=https://yce-api-01.makeupar.com
YOUCAM_POLL_INTERVAL=1.5
YOUCAM_POLL_TIMEOUT=60.0

# When true, demo mode is available for offline testing if API key is unset
ALLOW_DEMO_FALLBACK=True

# SQLite Database
DATABASE_URL=sqlite:///./skinwise.db
```

> **Note on Demo Mode:** If you do not yet have active YouCam API credentials, leave `YOUCAM_API_KEY` empty and ensure `ALLOW_DEMO_FALLBACK=True`. SkinWise AI will run with clearly labeled synthetic demo data for local review and UI testing.

---

### Step 2: Install Backend Dependencies & Run Server

```powershell
# Inside backend directory:
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Backend API: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/health`

---

### Step 3: Install Frontend Dependencies & Run Client

In a separate terminal:

```powershell
cd frontend
cp .env.example .env
npm install
npm run dev
```

- Frontend Web App: `http://localhost:5173`

---

## 🧪 Automated Testing

### Run Backend Tests (Pytest)
```powershell
cd backend
.\.venv\Scripts\pytest -v
```
**Test Coverage Includes:**
- `/api/v1/health` status and DB connection.
- Image validation (rejecting non-image MIME types, empty files, size limits).
- Unconfigured API key handling.
- Mocked YouCam S2S workflow (`POST /file` -> `PUT` binary -> `POST /task` -> bounded `GET` polling).
- Task polling error states and timeout handling.
- Metric normalization without data fabrication.
- Routine generation rules for Oily, Dry, Sensitive, and Mature skin.
- Product matching with budget constraints and avoided ingredients.
- Journal and report persistence and deletion CRUD.

### Run Frontend Tests (Vitest)
```powershell
cd frontend
npm run test
```

### Production Build Verification
```powershell
cd frontend
npm run build
```

---

## 🔒 Security & Privacy Practices

1. **Credentials Isolation**: `YOUCAM_API_KEY` is exclusively consumed by the Python backend via server-side HTTPX client. It is never exposed in browser bundles or `VITE_` variables.
2. **Ephemeral Image Handling**: Uploaded facial images are held in server memory only during the active analysis request and are never written to disk.
3. **Data Retention & User Rights**: Only structured non-biometric metrics (scores, timestamps, notes) are stored in SQLite. Users can delete individual journal entries or past diagnostic reports at any time.
4. **Cosmetic Disclaimer**: Clear disclaimers and patch-test guidelines are integrated on all pages.

---

## 📝 Hackathon Submission Deliverables

- **Devpost Submission Draft**: [`docs/DEVPOST_SUBMISSION.md`](docs/DEVPOST_SUBMISSION.md)
- **Video Demo Script**: [`docs/DEMO_VIDEO_SCRIPT.md`](docs/DEMO_VIDEO_SCRIPT.md)
- **Screenshot Checklist**: [`docs/SCREENSHOT_CHECKLIST.md`](docs/SCREENSHOT_CHECKLIST.md)
- **Architecture Documentation**: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## ⚖️ License & Disclaimer

SkinWise AI was developed for the **YouCam API Skin AI & eCommerce VTO Hackathon** on Devpost.  
*Disclaimer: SkinWise AI suggestions are for informational and cosmetic skincare purposes only. They do not constitute medical diagnosis, treatment, or clinical prescription. Consult a licensed dermatologist for chronic or severe skin conditions.*
