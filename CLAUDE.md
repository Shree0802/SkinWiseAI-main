# CLAUDE.md — Developer Guide for SkinWise AI

## Quick Start Commands (Windows PowerShell)

### Run Backend
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API will be running at `http://localhost:8000` with Swagger UI at `http://localhost:8000/docs`.

### Run Frontend
```powershell
cd frontend
npm run dev
```
Frontend will be running at `http://localhost:5173`.

### Run Automated Tests
```powershell
# Backend Pytest Suite (19 tests)
cd backend
.\.venv\Scripts\pytest -v

# Frontend Vitest Suite
cd frontend
npm run test

# Production Build Check
cd frontend
npm run build
```

---

## Key Architectural Principles

1. **YouCam S2S Integration**:
   - `YouCamClient` in `backend/app/services/youcam_client.py` handles:
     1. `POST /s2s/v2.0/file` -> registers upload & gets pre-signed PUT URL.
     2. `PUT <url>` -> transfers binary image bytes to storage bucket.
     3. `POST /s2s/v2.0/task/skin-analysis` -> creates async skin analysis task.
     4. `GET /s2s/v2.0/task/skin-analysis/{task_id}` -> bounded polling (1.5s interval, max 60s).
     5. `normalize_results()` -> parses UI scores, raw model indexes, and mask overlay URLs.
2. **Zero Fabrication**:
   - Never invent or fabricate scores or clinical metrics if omitted by the API.
   - Demo / sample mode is clearly tagged (`is_demo=True`, amber banner) and never presented as genuine analysis.
3. **Data Privacy**:
   - Raw selfies are processed ephemerally and NEVER saved to disk or database.
   - Only non-sensitive structured metrics are stored in SQLite (`backend/skinwise.db`).
4. **Currency**:
   - All shopping catalogue prices are strictly formatted in Indian Rupees (₹).
