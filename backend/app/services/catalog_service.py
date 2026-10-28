from typing import List, Optional, Dict
from app.models.schemas import ProductItem, ProductMatchRequest

SAMPLE_PRODUCTS: List[ProductItem] = [
    ProductItem(
        id="prod-001",
        name="Gentle Hydrating Cleanser",
        brand="DermaPure India",
        category="Cleanser",
        price_inr=399.0,
        description="A soothing daily cream-to-foam cleanser formulated with barrier-protecting ceramides and pure hyaluronic acid.",
        key_ingredients=["Ceramides NP", "Hyaluronic Acid", "Colloidal Oat"],
        all_ingredients=["Aqua", "Glycerin", "Cetearyl Alcohol", "Ceramide NP", "Sodium Hyaluronate", "Colloidal Oatmeal", "Phenoxyethanol"],
        suitability_tags=["Dry", "Sensitive", "Combination", "Normal"],
        target_concerns=["moisture", "redness", "texture"],
        is_fragrance_free=True,
        is_cruelty_free=True,
        is_sample_catalogue=True,
        verified_url="https://example.com/catalogue/dermapure-gentle-cleanser"
    ),
    ProductItem(
        id="prod-002",
        name="BHA 2% Salicylic Clarifying Cleanser",
        brand="MinimalSkin Labs",
        category="Cleanser",
        price_inr=349.0,
        description="Pore-clearing salicylic gel cleanser that dissolves stubborn sebum and dead skin cells to prevent breakouts.",
        key_ingredients=["Salicylic Acid 2%", "Zinc PCA", "Tea Tree Extract"],
        all_ingredients=["Aqua", "Sodium Lauroyl Sarcosinate", "Salicylic Acid", "Zinc PCA", "Melaleuca Alternifolia Leaf Extract", "Glycerin"],
        suitability_tags=["Oily", "Acne-Prone", "Combination"],
        target_concerns=["acne", "pores", "oiliness"],
        is_fragrance_free=True,
        is_cruelty_free=True,
        is_sample_catalogue=True,
        verified_url="https://example.com/catalogue/minimalkin-bha-cleanser"
    ),
    ProductItem(
        id="prod-003",
        name="Centella & Green Tea Balancing Toner",
        brand="EarthBotanics",
        category="Toner",
        price_inr=499.0,
        description="Alcohol-free calming toner infused with 80% Jeju green tea and Centella Asiatica to reduce post-wash redness.",
        key_ingredients=["Centella Asiatica Extract", "Camellia Sinensis (Green Tea)", "Allantoin"],
        all_ingredients=["Camellia Sinensis Leaf Water", "Centella Asiatica Extract", "Butylene Glycol", "Allantoin", "Sodium Hyaluronate"],
        suitability_tags=["Sensitive", "Combination", "Oily", "Normal"],
        target_concerns=["redness", "oiliness", "texture"],
        is_fragrance_free=True,
        is_cruelty_free=True,
        is_sample_catalogue=True,
        verified_url="https://example.com/catalogue/earthbotanics-centella-toner"
    ),
    ProductItem(
        id="prod-004",
        name="10% Niacinamide + Zinc 1% Sebum Control Serum",
        brand="PureFormulas",
        category="Serum",
        price_inr=599.0,
        description="High-strength vitamin and mineral blemish formula that diminishes visible pores, curbs oiliness, and evens skin tone.",
        key_ingredients=["Niacinamide 10%", "Zinc PCA 1%", "Hyaluronic Acid"],
        all_ingredients=["Aqua", "Niacinamide", "Pentylene Glycol", "Zinc PCA", "Dimethyl Isosorbide", "Tamarindus Indica Seed Gum", "Phenoxyethanol"],
        suitability_tags=["Oily", "Combination", "Acne-Prone"],
        target_concerns=["pores", "oiliness", "spots", "texture"],
        is_fragrance_free=True,
        is_cruelty_free=True,
        is_sample_catalogue=True,
        verified_url="https://example.com/catalogue/pureformulas-niacinamide"
    ),
    ProductItem(
        id="prod-005",
        name="10% Vitamin C + Ferulic Glow Serum",
        brand="LumiDerm Skin",
        category="Serum",
        price_inr=699.0,
        description="Stabilized 3-O-Ethyl Ascorbic Acid serum with ferulic acid to brighten dull complexion and fade sun spots.",
        key_ingredients=["3-O-Ethyl Ascorbic Acid 10%", "Ferulic Acid 0.5%", "Vitamin E"],
        all_ingredients=["Aqua", "3-O-Ethyl Ascorbic Acid", "Propanediol", "Ferulic Acid", "Tocopherol", "Sodium Gluconate", "Ethylhexylglycerin"],
        suitability_tags=["Combination", "Dry", "Normal", "Mature"],
        target_concerns=["spots", "radiance", "wrinkles"],
        is_fragrance_free=True,
        is_cruelty_free=True,
        is_sample_catalogue=True,
        verified_url="https://example.com/catalogue/lumiderm-vitamin-c"
    ),
    ProductItem(
        id="prod-006",
        name="Multi-Molecular Hyaluronic Acid 2% + B5",
        brand="PureFormulas",
        category="Serum",
        price_inr=499.0,
        description="Combines low, medium, and high molecular weight hyaluronic acid with Provitamin B5 for multi-depth hydration.",
        key_ingredients=["Hyaluronic Acid 2%", "Panthenol (Vitamin B5)", "Ahnfeltia Concinna Extract"],
        all_ingredients=["Aqua", "Sodium Hyaluronate", "Sodium Hyaluronate Crosspolymer", "Panthenol", "Ahnfeltia Concinna Extract", "Glycerin"],
        suitability_tags=["Dry", "Dehydrated", "Sensitive", "Normal", "Combination"],
        target_concerns=["moisture", "texture", "wrinkles"],
        is_fragrance_free=True,
        is_cruelty_free=True,
        is_sample_catalogue=True,
        verified_url="https://example.com/catalogue/pureformulas-hyaluronic-acid"
    ),
    ProductItem(
        id="prod-007",
        name="Granactive Retinoid 2% Night Elixir",
        brand="DermaPure India",
        category="Treatment",
        price_inr=799.0,
        description="Advanced next-generation non-irritating retinoid complex targeting fine lines, elasticity loss, and cellular renewal.",
        key_ingredients=["Hydroxypinacolone Retinoate (Granactive Retinoid 2%)", "Squalane", "Bisabolol"],
        all_ingredients=["Squalane", "C12-15 Alkyl Benzoate", "Bisabolol", "Dimethyl Isosorbide", "Hydroxypinacolone Retinoate", "Jojoba Oil"],
        suitability_tags=["Mature", "Combination", "Dry", "Normal"],
        target_concerns=["wrinkles", "firmness", "texture"],
        is_fragrance_free=True,
        is_cruelty_free=True,
        is_sample_catalogue=True,
        verified_url="https://example.com/catalogue/dermapure-granactive-retinoid"
    ),
    ProductItem(
        id="prod-008",
        name="Ceramide & Peptide Barrier Repair Cream",
        brand="DermaPure India",
        category="Moisturizer",
        price_inr=549.0,
        description="Intensive barrier restoration cream with a 3:1:1 physiological lipid ratio of ceramides, cholesterol, and fatty acids.",
        key_ingredients=["Ceramide NP/AP/EOP", "Copper Peptides", "Cholesterol", "Shea Butter"],
        all_ingredients=["Aqua", "Caprylic/Capric Triglyceride", "Glycerin", "Ceramide NP", "Ceramide AP", "Cholesterol", "Palmitoyl Tripeptide-1"],
        suitability_tags=["Dry", "Sensitive", "Mature", "Normal"],
        target_concerns=["moisture", "redness", "firmness"],
        is_fragrance_free=True,
        is_cruelty_free=True,
        is_sample_catalogue=True,
        verified_url="https://example.com/catalogue/dermapure-barrier-cream"
    ),
    ProductItem(
        id="prod-009",
        name="Oil-Free Matte Hydro Gel Moisturizer",
        brand="MinimalSkin Labs",
        category="Moisturizer",
        price_inr=429.0,
        description="Ultra-lightweight oil-free water gel that absorbs in seconds, balancing sebum without clogging pores.",
        key_ingredients=["Betaine", "Centella Asiatica", "Zinc PCA", "Polyglutamic Acid"],
        all_ingredients=["Aqua", "Butylene Glycol", "Betaine", "Centella Asiatica Extract", "Zinc PCA", "Carbomer", "Sodium Hydroxide"],
        suitability_tags=["Oily", "Acne-Prone", "Combination"],
        target_concerns=["oiliness", "pores", "moisture"],
        is_fragrance_free=True,
        is_cruelty_free=True,
        is_sample_catalogue=True,
        verified_url="https://example.com/catalogue/minimalkin-hydro-gel"
    ),
    ProductItem(
        id="prod-010",
        name="Ultra-Light Invisible Fluid Sunscreen SPF 50+ PA++++",
        brand="SunArmor India",
        category="Sunscreen",
        price_inr=599.0,
        description="Zero white cast, non-greasy hybrid sunscreen with modern European UV filters and blue-light defense.",
        key_ingredients=["Tinosorb M", "Tinosorb S", "Uvinul A Plus", "Niacinamide 2%"],
        all_ingredients=["Aqua", "Diethylamino Hydroxybenzoyl Hexyl Benzoate", "Ethylhexyl Triazone", "Methylene Bis-Benzotriazolyl", "Niacinamide"],
        suitability_tags=["Oily", "Combination", "Dry", "Sensitive", "Normal"],
        target_concerns=["spots", "wrinkles", "radiance"],
        is_fragrance_free=True,
        is_cruelty_free=True,
        is_sample_catalogue=True,
        verified_url="https://example.com/catalogue/sunarmor-fluid-sunscreen"
    ),
    ProductItem(
        id="prod-011",
        name="Mineral Matte Tinted Sunscreen SPF 50",
        brand="SunArmor India",
        category="Sunscreen",
        price_inr=649.0,
        description="100% Zinc Oxide mineral sunscreen with a universal Indian skin tone tint and velvet matte finish.",
        key_ingredients=["Zinc Oxide 25%", "Iron Oxides", "Ectoin"],
        all_ingredients=["Zinc Oxide", "Cyclopentasiloxane", "Dimethicone", "Iron Oxides", "Ectoin", "Tocopheryl Acetate"],
        suitability_tags=["Sensitive", "Acne-Prone", "Oily"],
        target_concerns=["redness", "spots", "oiliness"],
        is_fragrance_free=True,
        is_cruelty_free=True,
        is_sample_catalogue=True,
        verified_url="https://example.com/catalogue/sunarmor-mineral-sunscreen"
    ),
    ProductItem(
        id="prod-012",
        name="Caffeine 5% + EGCG Depuffing Eye Solution",
        brand="PureFormulas",
        category="Eye Care",
        price_inr=499.0,
        description="Concentrated eye serum targeting stubborn dark circles and fluid retention under the delicate orbital eye area.",
        key_ingredients=["Caffeine 5%", "Epigallocatechin Gallatyl Glucoside (EGCG)", "Hyaluronic Acid"],
        all_ingredients=["Aqua", "Caffeine", "Maltodextrin", "Glycerin", "Propanediol", "Epigallocatechin Gallatyl Glucoside", "Sodium Hyaluronate"],
        suitability_tags=["All Skin Types", "Dry", "Combination", "Oily"],
        target_concerns=["dark_circles", "eyebags"],
        is_fragrance_free=True,
        is_cruelty_free=True,
        is_sample_catalogue=True,
        verified_url="https://example.com/catalogue/pureformulas-caffeine-eye"
    )
]

class CatalogService:
    def __init__(self):
        self._products = SAMPLE_PRODUCTS

    def get_all_products(
        self,
        category: Optional[str] = None,
        skin_type: Optional[str] = None,
        max_budget: Optional[float] = None
    ) -> List[ProductItem]:
        results = self._products
        if category:
            results = [p for p in results if p.category.lower() == category.lower()]
        if skin_type:
            results = [p for p in results if skin_type.capitalize() in p.suitability_tags or "All Skin Types" in p.suitability_tags]
        if max_budget is not None and max_budget > 0:
            results = [p for p in results if p.price_inr <= max_budget]
        return results

    def get_product_by_id(self, product_id: str) -> Optional[ProductItem]:
        for p in self._products:
            if p.id == product_id:
                return p
        return None

    def match_products(self, req: ProductMatchRequest) -> List[ProductItem]:
        """
        Explainable matching algorithm:
        Scores products based on:
        - Skin Type Match (+30)
        - Target Concern Matches (+20 per matched concern)
        - Budget Compliance (+15)
        - Fragrance-Free Preference (+10)
        - Avoided Ingredients Penalty (-100 if present)
        """
        scored_products: List[ProductItem] = []
        user_skin = (req.skin_type or "").capitalize()
        user_concerns = [c.lower() for c in req.concerns]
        avoid_list = [a.lower() for a in req.avoid_ingredients]
        wants_fragrance_free = "fragrance_free" in [p.lower() for p in req.preferences]

        for p in self._products:
            # Check for explicitly avoided ingredients
            violates_avoid = False
            for avoided in avoid_list:
                for ing in p.all_ingredients:
                    if avoided in ing.lower():
                        violates_avoid = True
                        break
                if violates_avoid:
                    break
            if violates_avoid:
                continue

            # Category filter if provided
            if req.categories and p.category.lower() not in [c.lower() for c in req.categories]:
                continue

            score = 20.0  # baseline suitability score
            reasons: List[str] = []

            # 1. Skin Type Match
            if user_skin and (user_skin in p.suitability_tags or "All Skin Types" in p.suitability_tags):
                score += 30.0
                reasons.append(f"Formulated for {user_skin} skin")
            
            # 2. Target Concerns
            matched_c = [c for c in user_concerns if c in [tc.lower() for tc in p.target_concerns]]
            if matched_c:
                score += len(matched_c) * 15.0
                reasons.append(f"Targets: {', '.join(matched_c).replace('_', ' ').capitalize()}")

            # 3. Budget Filter & Match
            if req.max_budget_inr:
                if p.price_inr <= req.max_budget_inr:
                    score += 15.0
                    reasons.append(f"Fits within ₹{req.max_budget_inr:,.0f} budget (₹{p.price_inr:,.0f})")
                else:
                    # Exceeds budget
                    continue

            # 4. Fragrance-free preference
            if wants_fragrance_free and p.is_fragrance_free:
                score += 10.0
                reasons.append("Fragrance-free formula")

            # Key ingredients highlight
            if p.key_ingredients:
                reasons.append(f"Key actives: {', '.join(p.key_ingredients[:2])}")

            # Cap score to 99%
            final_score = min(round(score, 1), 99.0)

            # Clone and set matched attributes
            matched_item = p.model_copy()
            matched_item.match_score = final_score
            matched_item.match_reasons = reasons
            scored_products.append(matched_item)

        # Sort descending by match score
        scored_products.sort(key=lambda x: x.match_score or 0, reverse=True)
        return scored_products

    def compare_products(self, product_ids: List[str]) -> List[ProductItem]:
        return [p for p in self._products if p.id in product_ids]

catalog_service = CatalogService()
