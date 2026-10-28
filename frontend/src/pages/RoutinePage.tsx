import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sun,
  Moon,
  Sparkles,
  ShoppingBag,
  Sliders,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import type { RoutineResponse } from '../types';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const RoutinePage: React.FC = () => {
  const location = useLocation();
  const prefill = (location.state as any) || {};

  // Form State
  const [skinType, setSkinType] = useState<string>(prefill.skinType || 'Combination');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(
    prefill.concerns && prefill.concerns.length > 0
      ? prefill.concerns
      : ['pores', 'oiliness']
  );
  const [budgetTier, setBudgetTier] = useState<'budget' | 'moderate' | 'premium'>('moderate');
  const [preferences, setPreferences] = useState<string[]>(['fragrance_free']);
  const [avoidIngredients, setAvoidIngredients] = useState<string[]>([]);
  const [reportId] = useState<string | undefined>(prefill.reportId);

  // Results State
  const [routine, setRoutine] = useState<RoutineResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableConcerns = [
    { key: 'acne', label: 'Acne & Breakouts' },
    { key: 'pores', label: 'Enlarged Pores' },
    { key: 'texture', label: 'Uneven Texture' },
    { key: 'spots', label: 'Dark Spots & Pigmentation' },
    { key: 'oiliness', label: 'Excess Sebum / Oil' },
    { key: 'moisture', label: 'Dryness / Dehydration' },
    { key: 'redness', label: 'Redness & Sensitivity' },
    { key: 'wrinkles', label: 'Fine Lines & Wrinkles' },
    { key: 'dark_circles', label: 'Under-Eye Dark Circles' },
  ];

  const availablePreferences = [
    { key: 'fragrance_free', label: 'Fragrance-Free Only' },
    { key: 'minimalist', label: 'Minimalist (3-Step Essential)' },
    { key: 'cruelty_free', label: 'Cruelty-Free' },
    { key: 'vegan', label: 'Vegan Formulations' },
  ];

  const availableAvoid = [
    'Synthetic Fragrance',
    'Denatured Alcohol',
    'Essential Oils',
    'Harsh Sulfates (SLS)',
    'Parabens',
  ];

  // Auto-generate on first load
  useEffect(() => {
    handleGenerateRoutine();
  }, []);

  const toggleConcern = (key: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const togglePreference = (key: string) => {
    setPreferences((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleAvoid = (ing: string) => {
    setAvoidIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const handleGenerateRoutine = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await apiClient.generateRoutine({
        skin_type: skinType,
        primary_concerns: selectedConcerns,
        budget_tier: budgetTier,
        preferences,
        avoid_ingredients: avoidIngredients,
        report_id: reportId,
      });
      setRoutine(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate personalized routine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lavender-50 text-lavender-700 text-xs font-semibold mb-3 border border-lavender-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explainable Decision Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Personalized Routine Builder
        </h1>
        <p className="text-sm text-stone-600 mt-2">
          Transparent, non-medical cosmetic routines crafted around your skin type, primary concerns, and budget tier.
        </p>
      </div>

      {/* Routine Configuration Questionnaire */}
      <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 pb-4 mb-6 border-b border-cream-200">
          <Sliders className="w-5 h-5 text-lavender-600" />
          <h2 className="text-lg font-bold text-stone-900">Customise Preferences</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Skin Type Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
              1. Skin Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Combination', 'Oily', 'Dry', 'Sensitive', 'Normal'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSkinType(st)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                    skinType === st
                      ? 'bg-lavender-600 text-white border-lavender-600 shadow-sm'
                      : 'bg-white text-stone-700 border-cream-300 hover:border-lavender-400'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Tier */}
          <div>
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
              2. Budget Tier (₹)
            </label>
            <div className="space-y-2">
              {[
                { key: 'budget', label: 'Budget-Friendly', range: 'Under ₹500 / step' },
                { key: 'moderate', label: 'Standard Balance', range: '₹500 – ₹1,500 / step' },
                { key: 'premium', label: 'Specialty Actives', range: 'Above ₹1,500 / step' },
              ].map((tier) => (
                <button
                  key={tier.key}
                  type="button"
                  onClick={() => setBudgetTier(tier.key as any)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                    budgetTier === tier.key
                      ? 'bg-lavender-600 text-white border-lavender-600 shadow-sm'
                      : 'bg-white text-stone-700 border-cream-300 hover:border-lavender-400'
                  }`}
                >
                  <span>{tier.label}</span>
                  <span className={budgetTier === tier.key ? 'text-lavender-100' : 'text-stone-400'}>
                    {tier.range}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preferences & Lifestyle */}
          <div>
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
              3. Preferences & Style
            </label>
            <div className="space-y-1.5">
              {availablePreferences.map((pref) => (
                <button
                  key={pref.key}
                  type="button"
                  onClick={() => togglePreference(pref.key)}
                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-between ${
                    preferences.includes(pref.key)
                      ? 'bg-lavender-50 text-lavender-800 border-lavender-300 font-semibold'
                      : 'bg-white text-stone-600 border-cream-300 hover:bg-cream-50'
                  }`}
                >
                  <span>{pref.label}</span>
                  {preferences.includes(pref.key) && <CheckCircle2 className="w-3.5 h-3.5 text-lavender-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Primary Concerns Chips */}
        <div className="mt-6 pt-6 border-t border-cream-200">
          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
            4. Focus Concerns to Address
          </label>
          <div className="flex flex-wrap gap-2">
            {availableConcerns.map((c) => {
              const active = selectedConcerns.includes(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => toggleConcern(c.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? 'bg-lavender-600 text-white border-lavender-600 shadow-2xs'
                      : 'bg-white text-stone-700 border-cream-300 hover:border-lavender-400'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ingredients to Avoid */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
            5. Ingredients to Avoid
          </label>
          <div className="flex flex-wrap gap-2">
            {availableAvoid.map((ing) => {
              const active = avoidIngredients.includes(ing);
              return (
                <button
                  key={ing}
                  type="button"
                  onClick={() => toggleAvoid(ing)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    active
                      ? 'bg-rose-50 text-rose-700 border-rose-300 font-semibold'
                      : 'bg-white text-stone-600 border-cream-300 hover:border-cream-400'
                  }`}
                >
                  {active ? `✕ ${ing}` : `+ ${ing}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMessage}
          </div>
        )}
        <div className="mt-6 pt-4 border-t border-cream-200 flex justify-end">
          <button
            onClick={handleGenerateRoutine}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-lavender-600 hover:bg-lavender-700 shadow-sm transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Update Routine Suggestions</span>
          </button>
        </div>
      </div>

      {/* Routine Steps Presentation */}
      {routine && (
        <div className="space-y-12">
          {/* Morning Routine */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-900">Morning (AM) Routine</h2>
                <p className="text-xs text-stone-500">Protection, hydration, and environmental defense</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {routine.morning_steps.map((step) => (
                <div
                  key={step.step_number}
                  className="bg-white rounded-2xl border border-cream-300 p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Step {step.step_number}
                      </span>
                      <span className="text-[10px] text-stone-400 font-semibold uppercase">
                        {step.product_category}
                      </span>
                    </div>

                    <h3 className="font-bold text-stone-900 text-sm mb-2">{step.step_name}</h3>
                    <p className="text-xs text-stone-600 leading-relaxed mb-3">{step.rationale}</p>

                    {step.recommended_ingredients.length > 0 && (
                      <div className="space-y-1 mt-3 pt-3 border-t border-cream-200">
                        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                          Look for Actives:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {step.recommended_ingredients.map((ing, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-1.5 py-0.5 rounded bg-cream-100 text-stone-700 font-medium"
                            >
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Evening Routine */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-900">Evening (PM) Routine</h2>
                <p className="text-xs text-stone-500">Cellular renewal, repair, and barrier restoration</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {routine.evening_steps.map((step) => (
                <div
                  key={step.step_number}
                  className="bg-white rounded-2xl border border-cream-300 p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        Step {step.step_number}
                      </span>
                      <span className="text-[10px] text-stone-400 font-semibold uppercase">
                        {step.product_category}
                      </span>
                    </div>

                    <h3 className="font-bold text-stone-900 text-sm mb-2">{step.step_name}</h3>
                    <p className="text-xs text-stone-600 leading-relaxed mb-3">{step.rationale}</p>

                    {step.recommended_ingredients.length > 0 && (
                      <div className="space-y-1 mt-3 pt-3 border-t border-cream-200">
                        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                          Look for Actives:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {step.recommended_ingredients.map((ing, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-1.5 py-0.5 rounded bg-cream-100 text-stone-700 font-medium"
                            >
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Shop Matched Products CTA */}
          <div className="p-6 bg-lavender-50 rounded-3xl border border-lavender-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Ready to find verified products for this routine?
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Explore our curated catalogue priced in Indian Rupees (₹) with matched ingredient breakdowns.
              </p>
            </div>
            <Link
              to="/shop"
              state={{ skinType, concerns: selectedConcerns }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-lavender-600 hover:bg-lavender-700 shadow-sm shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Matched Products (₹)</span>
            </Link>
          </div>
        </div>
      )}

      {/* Disclaimers & Patch Test Box */}
      <DisclaimerBanner showPatchTest={true} />
    </div>
  );
};
