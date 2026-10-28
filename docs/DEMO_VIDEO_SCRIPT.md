# SkinWise AI — Video Demo Script (2.5 Minutes)

**Video Title:** SkinWise AI — Explainable Skincare Assistant (YouCam API Hackathon)  
**Tone:** Confident, professional, clear, engaging.  
**Total Target Time:** ~2 minutes 30 seconds  

---

### [0:00 – 0:25] Scene 1: Introduction & The Consumer Problem
- **Visual:** Screen opens on the **SkinWise AI Landing Page** (`http://localhost:5173/`). Cursor smoothly scrolls past the value proposition, showing the warm cream aesthetic, trust badges, and feature highlights.
- **Narration:**
  > *"Every day, millions of young consumers and students browse online beauty stores, overwhelmed by hundreds of serums with confusing chemical percentages. Most either damage their skin barrier by layering incompatible actives, or waste their budget on products they don't need.*
  > *Meet SkinWise AI: an explainable skincare decision assistant built for the YouCam API Skin AI & eCommerce VTO Hackathon."*

---

### [0:25 – 0:55] Scene 2: Live YouCam Skin Analysis & Upload
- **Visual:** Presenter clicks **"Analyze My Skin"**. We transition to the `/analyze` page.
- **Action:** Drag and drop a clean front-facing portrait. Point out the lighting guidelines on the right side and the privacy consent notice.
- **Narration:**
  > *"Users start by uploading a natural-light selfie. Notice our strict privacy guarantee: facial images are processed ephemerally on the server and never saved to disk.*
  > *Behind the scenes, our FastAPI backend interfaces with Perfect Corp's YouCam Skin AI API via an asynchronous server-to-server workflow—registering the image, executing binary transfer, triggering the diagnostic task, and polling for results."*
- **Action:** Click **"Analyze Skin with YouCam AI"**. Progress states animate smoothly: *"Validating image"*, *"Connecting to YouCam Skin AI"*, *"Calibrating cosmetic vitality scores"*.

---

### [0:55 – 1:30] Scene 3: Diagnostic Results Dashboard
- **Visual:** Transition to the `/results` page displaying the analysis dashboard.
- **Action:** Highlight the Overall Health Score (e.g., 82/100), Skin Age, and Combination Skin assessment. Scroll down to show metric cards: Wrinkles, Pores, Skin Texture, Hydration, Redness, and Oiliness.
- **Narration:**
  > *"Here are the real diagnostic findings. SkinWise AI adheres to a strict Zero-Fabrication policy: we display exact calibrated scores and raw metrics returned by the API, with accessible non-medical explanations.*
  > *For metrics like Pores or Wrinkles, we can toggle 'View Detection Overlay' to see the exact computer vision mask returned by the YouCam engine.*
  > *From here, the user has clear next steps: build an explainable routine or explore matched products."*

---

### [1:30 – 1:55] Scene 4: Personalized Routine Builder
- **Visual:** Click **"Build My Routine"** (`/routine`). The skin type and identified concerns are pre-filled.
- **Action:** Select "Budget-Friendly (<₹500)" and check "Fragrance-Free Only". Click **"Update Routine Suggestions"**.
- **Narration:**
  > *"Instead of generic AI hallucinations, our deterministic formulation engine constructs a practical Morning and Evening routine tailored to the user's specific diagnostic findings, budget tier, and sensitivities.*
  > *Every step includes an explicit rationale, recommended actives—like Niacinamide 5% or Ceramide Complexes—and ingredients to avoid. Crucially, we prominently feature a 48-hour patch-test guide and medical disclaimers."*

---

### [1:55 – 2:15] Scene 5: Smart Shopping in Indian Rupees (₹) & Comparison
- **Visual:** Click **"Explore Matched Products (₹)"** (`/shop`).
- **Action:** Filter products using the price slider (₹500) and category pills. Click **"Compare"** on two products (e.g., *Gentle Hydrating Cleanser* and *BHA 2% Salicylic Cleanser*). The floating Comparison Drawer slides up from the bottom.
- **Narration:**
  > *"Next, the Smart Skincare Shop curates verified formulations with prices in Indian Rupees (₹). Our multi-vector matching algorithm explains exactly why each product matches the user's skin profile.*
  > *With our side-by-side comparison drawer, users can evaluate active ingredients, skin type suitability, and prices before purchasing."*

---

### [2:15 – 2:30] Scene 6: Skin Journal & Conclusion
- **Visual:** Navigate to the `/journal` page. Show the saved analysis report and click **"Log Observation"** to record a skin sensation ("Skin feel: Glowing").
- **Narration:**
  > *"Finally, users can maintain a Skin Progress Journal, linking daily observations to past scans and monitoring long-term skin health with complete data deletion controls.*
  > *SkinWise AI turns complex cosmetic computer vision into empowered, explainable decisions. Thank you for watching!"*
