# SkinWise AI — Devpost Hackathon Submission

**Elevator Pitch:** An explainable AI skincare decision assistant powered by the Perfect Corp YouCam Skin AI API that connects empirical facial diagnostics with transparent cosmetic routines and budget-aware shopping in Indian Rupees (₹).

---

## 💡 Inspiration
Walk down any skincare aisle or browse an online beauty store in India, and you'll find hundreds of serums, toners, and creams with confusing chemical percentages (BHA, AHA, Retinoids, Niacinamide, Peptides). For students and young consumers, this leads to two common pitfalls:
1. **Product Overload & Damaged Skin Barriers**: Layering too many incompatible active ingredients simultaneously.
2. **Wasted Money**: Purchasing expensive hyped products that don't match their actual skin needs or exceed their student budgets.

We built **SkinWise AI** for the **YouCam API Skin AI & eCommerce VTO Hackathon** to transform skincare from marketing guesswork into a transparent, objective, and budget-friendly experience.

---

## ✨ What It Does

SkinWise AI delivers an end-to-end consumer workflow:

1. **YouCam Skin Diagnostics**: The user uploads a front-facing selfie. SkinWise AI interfaces via an asynchronous server-to-server workflow with Perfect Corp's YouCam Skin AI API to extract empirical metrics across pores, wrinkles, skin texture, dark spots, oiliness, hydration, and dark eye circles.
2. **Zero Fabrication Policy**: If the AI model does not return a metric, SkinWise AI never invents or guesses a score. Missing data remains transparently unassessed.
3. **Deterministic Routine Formulation**: Instead of generic AI text hallucinations, our rule engine builds tailored Morning (AM) and Evening (PM) cosmetic routines based on validated cosmetic science, with clear rationales for each step, patch-test guidance, and non-medical disclaimers.
4. **Smart Skincare Shopping in Indian Rupees (₹)**: A curated catalogue of Indian skincare products featuring key actives, full ingredient listings, suitability tags, and a multi-factor matching algorithm that explains exactly why each product was recommended. Users can compare up to 3 products side-by-side.
5. **Skin Progress Journal**: Users can log daily observations (skin feel, product reactions, breakouts, improvements) linked to their diagnostic reports, stored securely in a local database with full deletion controls.
6. **Privacy-First Design**: Raw facial photos are processed ephemerally and never saved to disk.

---

## 🛠️ How We Built It

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router v7, Lucide React icons.
- **Backend**: Python 3.13, FastAPI, Pydantic Settings, HTTPX (async client), SQLite, SQLAlchemy 2.0.
- **YouCam S2S Integration**: Multi-stage asynchronous pipeline:
  1. `POST /s2s/v2.0/file` to register the upload and receive a signed S3 upload URL.
  2. Binary `PUT` request to upload the image directly to the storage bucket.
  3. `POST /s2s/v2.0/task/skin-analysis` with 13 targeted SD diagnostics actions.
  4. Bounded polling on `GET /s2s/v2.0/task/skin-analysis/{task_id}` until success or failure.
  5. Calibrated normalization engine that parses UI scores, raw model indexes, and detection mask overlays.
- **Testing**: 19 automated Pytest backend tests (mocking external API states, timeouts, validation errors, and database CRUD) + Vitest frontend test suite.

---

## 🧗 Challenges We Ran Into

- **YouCam Two-Step S2S Flow**: Unlike simple REST APIs where image bytes are sent directly in a single multipart POST, Perfect Corp's enterprise pipeline requires registering the file, PUTting binary bytes to a pre-signed URL, triggering the task, and bounded polling. Isolating this workflow into a dedicated, testable `YouCamClient` service ensured resilience and clean error boundaries.
- **Explainability vs. Black-Box AI**: Many AI apps generate arbitrary routine text. We designed a deterministic, rule-based routine builder where every active ingredient recommendation is backed by a specific reason and balanced against user preferences (fragrance-free, minimalist, budget limits).
- **Graceful Fallbacks & Transparency**: For hackathon judges and users without pre-configured YouCam keys, we engineered a dedicated **Demo Mode** that clearly labels sample synthetic data so the app can be evaluated offline without ever pretending mock data is real analysis.

---

## 🏆 Accomplishments That We're Proud Of

- **Zero-Friction UI**: Built an accessible design system with warm cream backgrounds (`#FAF8F5`), soft lavender accents (`#7E69AB`), and clean typography that feels like a premium consumer health app.
- **100% Test Coverage for Core Workflows**: Pytest test suite covering mock YouCam network responses, timeout errors, image validations, routine rules, and SQLite persistence.
- **Localized for India**: Curated real formulations (Minimalist, Derma Co style actives) with prices accurately displayed in Indian Rupees (₹).
- **Strict Ethical & Safety Standards**: Includes prominent cosmetic disclaimers, medical warnings, and detailed 48-hour patch-test instructions.

---

## 📚 What We Learned

- How to integrate asynchronous computer vision task queues via server-to-server APIs with bounded backoff polling.
- The importance of user privacy when handling biometric facial images, and how to design ephemeral image pipelines with zero disk retention.
- Structuring explainable recommendation algorithms that build consumer trust over opaque generative AI output.

---

## 🚀 What's Next for SkinWise AI

- **eCommerce Virtual Try-On (VTO)**: Integrating YouCam's Virtual Try-On SDK to allow users to preview tinted sunscreens and lip treatments directly on their camera feed.
- **Barcode & Ingredient Scanner**: Scanning physical product ingredient labels in stores to instantly evaluate compatibility with the user's skin profile.
- **Longitudinal Trend Graphs**: Visualizing skin hydration and redness improvements over 30/60/90 days of consistent routine adherence.
