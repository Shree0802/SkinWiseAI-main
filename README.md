# SkinWise AI 🌿✨
### Explainable Skincare Decision Assistant powered by YouCam Skin AI API

> 🌐 **Live Web Application**: [https://skin-wise-ai-main.vercel.app](https://skin-wise-ai-main.vercel.app)  
> ⚡ **Live Production Backend**: [https://skinwiseai-main.onrender.com](https://skinwiseai-main.onrender.com)  
> 📑 **API Documentation (Swagger UI)**: [https://skinwiseai-main.onrender.com/docs](https://skinwiseai-main.onrender.com/docs)  
> 🏥 **API Health & Readiness Check**: [https://skinwiseai-main.onrender.com/api/v1/health](https://skinwiseai-main.onrender.com/api/v1/health)  

[![Live App on Vercel](https://img.shields.io/badge/Live%20App-skin--wise--ai--main.vercel.app-6366F1?style=for-the-badge&logo=vercel)](https://skin-wise-ai-main.vercel.app)
[![Backend on Render](https://img.shields.io/badge/Backend-skinwiseai--main.onrender.com-46E3B7?style=for-the-badge&logo=render)](https://skinwiseai-main.onrender.com)
[![Built for YouCam API Hackathon](https://img.shields.io/badge/Devpost-YouCam%20Skin%20AI%20Hackathon%202026-6366F1?style=for-the-badge)](https://devpost.com)
[![Python FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.13-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React Vite TS](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20TypeScript-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Tests Passing](https://img.shields.io/badge/Tests-27%20Pytest%20%2B%209%20Vitest%20Passed-10B981?style=for-the-badge)](https://pytest.org)

**SkinWise AI** solves a critical consumer problem: helping students and skincare consumers navigate overwhelming skincare shelves with objective computer vision diagnostics, explainable cosmetic routines, and smart shopping in **Indian Rupees (₹)**.

- **Live Production Frontend**: [https://skin-wise-ai-main.vercel.app](https://skin-wise-ai-main.vercel.app)
- **Live Production Backend**: [https://skinwiseai-main.onrender.com](https://skinwiseai-main.onrender.com)
- **Production API v1 Base**: [https://skinwiseai-main.onrender.com/api/v1](https://skinwiseai-main.onrender.com/api/v1)
- **Swagger Documentation**: [https://skinwiseai-main.onrender.com/docs](https://skinwiseai-main.onrender.com/docs)
- **GitHub Repository**: [https://github.com/Shree0802/SkinWiseAI-main](https://github.com/Shree0802/SkinWiseAI-main)

---

## 🌟 Key Features

1. **Real YouCam Skin AI Integration (Server-to-Server v2.0)**:
   - Implements Perfect Corp's official enterprise pipeline: file initialization (`POST /s2s/v2.0/file`), binary PUT upload to signed storage URL, task generation (`POST /s2s/v2.0/task/skin-analysis`), and bounded polling (`GET /s2s/v2.0/task/skin-analysis/{task_id}`).
   - Strictly uses verified Standard Definition actions (`wrinkle`, `pore`, `texture`, `acne`, `age_spot`, `redness`, `oiliness`, `moisture`, `dark_circle`, `eye_bag`, `skin_type`, `radiance`, `firmness`).
2. **Zero-Fabrication Policy**:
   - Never hallucinates, guesses, or invents missing metrics. If the API omits a field, it remains transparently labeled as unassessed.
   - Offline / demo results are explicitly marked with `[DEMO MODE]` and `source="demo_mock"`.
3. **Transparent Routine Builder**:
   - Deterministic rule engine constructing Morning (AM) and Evening (PM) cosmetic routines with explicit rationales, patch-test guidance, and non-medical disclaimers.
4. **Smart Indian Skincare Shopping (₹)**:
   - Curated product catalogue priced in Indian Rupees (₹) with an explainable multi-vector matching algorithm that calculates match scores and explicit reasons.
   - Interactive side-by-side comparison drawer for up to 3 products.
5. **Skin Progress Journal**:
   - Record daily observations, track skin feel changes, and link past diagnostic scans stored locally in SQLite or production PostgreSQL with full user deletion controls.
6. **Privacy-First Design & In-Memory Image Validation**:
   - Zero-selfie retention: facial images are held in memory during the active request and never written to disk or database.
   - Rigorous image validation via Pillow (`PIL.Image`) ensuring files are genuine, non-corrupted JPEG/PNG/WebP photos.

---

## 🏗️ Project Architecture

```
skinwise-ai/
  frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS
    src/
      components/               # Navbar, Footer, MetricCard, ProductCard, ComparisonDrawer, etc.
      pages/                    # LandingPage, AnalysisPage, ResultsPage, RoutinePage, ShopPage, JournalPage
      services/                 # apiClient.ts (Typed Fetch wrapper with auto /api/v1 normalization & timeouts)
      types/                    # TypeScript interfaces
      tests/                    # Vitest test suite (apiClient, metricCalculation, productPricing)
    package.json
    vercel.json                 # SPA rewrites ensuring route refreshes work seamlessly
    .env.example
  backend/                      # FastAPI Python Application
    app/
      api/                      # Versioned routers (health, analysis, routine, products, journal)
      models/                   # Pydantic schemas & SQLAlchemy DB models
      services/                 # youcam_client.py, routine_engine.py, catalog_service.py
      config.py                 # Pydantic BaseSettings with environment validation
      database.py               # SQLite & PostgreSQL compatible database engine
      main.py                   # FastAPI entrypoint with Lifespan & CORS configuration
    tests/                      # Pytest automated test suite (27 tests)
    requirements.txt
    .env.example
  render.yaml                   # Infrastructure-as-code for Render deployment
  vercel.json                   # Root SPA rewrite configuration
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
API_V1_PREFIX=/api/v1

# YouCam API Configuration (Perfect Corp S2S Enterprise API)
# Obtain your API key from Perfect Corp YouCam developer portal (https://docs.makeupar.com)
YOUCAM_API_KEY=
YOUCAM_API_BASE_URL=https://yce-api-01.makeupar.com
YOUCAM_POLL_INTERVAL=1.5
YOUCAM_POLL_TIMEOUT=60.0

# In development, set to True for offline testing. In production, set to False.
ALLOW_DEMO_FALLBACK=True

# SQLite Database for local dev
DATABASE_URL=sqlite:///./skinwise.db

# CORS Allowed Origins (Comma-separated)
CORS_ORIGINS=https://skin-wise-ai-main.vercel.app,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000
```

> **Note on Demo Mode:** If you do not have an active YouCam API key, leaving `YOUCAM_API_KEY` empty with `ALLOW_DEMO_FALLBACK=True` allows local review with clearly labeled synthetic demo data.

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

### Backend Test Suite (Pytest — 27 tests passed)
```powershell
cd backend
pytest -v
```

**Test Coverage Includes:**
- `/api/v1/health` accurate status, service mode, and database connectivity.
- CORS origin verification with credentials protection.
- In-memory image validation (rejecting non-image MIME types, corrupted bytes, empty files).
- Complete YouCam S2S workflow (`POST /file` -> `PUT` binary -> `POST /task` -> bounded `GET` polling).
- YouCam polling timeout and 429 rate limit handling.
- Secret sanitization (redacting API keys and Bearer tokens in error messages and logs).
- Metric normalization without data fabrication.
- Routine generation rules for Oily, Dry, Sensitive, and Mature skin.
- Product matching with budget constraints and avoided ingredients.
- Journal and report persistence, linking, and unlinked report deletion.
- Full end-to-end user journey test (`test_complete_end_to_end_user_journey`).

### Frontend Test Suite (Vitest — 9 tests passed)
```powershell
cd frontend
npm run test
```

### Frontend Linting (Oxlint — 0 warnings, 0 errors)
```powershell
cd frontend
npm run lint
```

### Production Build Verification
```powershell
cd frontend
npm run build
```

---

## ☁️ Deployment Guide

### Frontend Deployment (Vercel)

- **Root Directory**: `frontend`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Environment Variables**:
  ```env
  VITE_API_BASE_URL=https://skinwiseai-main.onrender.com/api/v1
  ```
- **SPA Routing**: Handled via `vercel.json` rewrites, ensuring direct browser reloads on `/analyze`, `/results/:id`, `/routine`, `/shop`, `/journal` resolve properly without 404s.

### Backend Deployment (Render)

- **Environment**: `Python`
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  ```env
  APP_NAME=SkinWise AI
  APP_ENV=production
  DEBUG=False
  API_V1_PREFIX=/api/v1
  YOUCAM_API_KEY=<your-official-youcam-api-key>
  YOUCAM_API_BASE_URL=https://yce-api-01.makeupar.com
  YOUCAM_POLL_INTERVAL=1.5
  YOUCAM_POLL_TIMEOUT=60
  ALLOW_DEMO_FALLBACK=False
  DATABASE_URL=sqlite:///./skinwise.db
  CORS_ORIGINS=https://skin-wise-ai-main.vercel.app,http://localhost:5173,http://127.0.0.1:5173
  ```

---

## 🔒 Security & Privacy Practices

1. **Credentials Isolation**: `YOUCAM_API_KEY` is exclusively handled on the server side by FastAPI and is never bundled in frontend JavaScript.
2. **Secret Sanitization**: Error handlers redact Bearer tokens and API keys to prevent accidental leaks.
3. **Zero-Selfie Disk Storage**: Facial images are processed in RAM only and are discarded after analysis.
4. **Data Ownership**: Only non-biometric structured scores and user notes are saved in the database, with one-click deletion available at any time.
5. **Medical Disclaimers**: Clear cosmetic-only disclaimers and patch-test guidelines are displayed across all pages.

---

## ⚖️ License & Disclaimer

SkinWise AI was developed for the **YouCam API Skin AI & eCommerce VTO Hackathon** on Devpost.  
*Disclaimer: SkinWise AI suggestions are for educational and cosmetic skincare purposes only. They do not constitute medical diagnosis, treatment, or clinical prescription. Consult a licensed dermatologist for chronic or severe skin conditions.*
