import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Activity,
  ShieldCheck,
  BookOpen,
  ShoppingBag,
  Calendar,
  ArrowRight,
  Camera,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lavender-100/80 border border-lavender-200 text-lavender-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>YouCam API Hackathon 2026 Innovation</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
                Skin decisions made{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-lavender-700 to-indigo-600">
                  clear, explainable & smart.
                </span>
              </h1>

              <p className="text-lg text-stone-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Stop guessing through endless skincare shelves. Upload a selfie to receive real skin diagnostics from the <strong>YouCam Skin AI API</strong>, get transparent cosmetic routines, and compare products curated in Indian Rupees (₹).
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/analyze"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold text-white bg-lavender-600 hover:bg-lavender-700 shadow-lg shadow-lavender-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <Activity className="w-5 h-5" />
                  <span>Analyze My Skin</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-stone-700 bg-white hover:bg-cream-200 border border-cream-300 shadow-sm transition-all"
                >
                  <ShoppingBag className="w-4 h-4 text-stone-500" />
                  <span>Explore Products (₹)</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-cream-300/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-500">
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>No selfies stored on disk</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-lavender-600" />
                  <span>Curated in INR (₹)</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Lock className="w-4 h-4 text-stone-600" />
                  <span>Cosmetic & Explainable</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm rounded-3xl bg-white p-6 shadow-xl border border-cream-300">
                {/* Floating pill badge */}
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-lavender-600 text-white text-[11px] font-bold shadow-md">
                  Live Diagnostics Engine
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-cream-200">
                  <div>
                    <span className="text-xs text-stone-400 font-medium">Target User Assessment</span>
                    <h3 className="font-bold text-stone-900 text-lg">Combination Skin</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-400 font-medium">Health Index</span>
                    <div className="text-2xl font-extrabold text-lavender-700">82/100</div>
                  </div>
                </div>

                {/* Sample visual diagnostic meters */}
                <div className="space-y-4 py-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-stone-700">Hydration & Barrier</span>
                      <span className="text-emerald-700">Optimal (84%)</span>
                    </div>
                    <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
                      <div className="w-[84%] h-full bg-emerald-500 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-stone-700">Pores & Texture</span>
                      <span className="text-amber-700">Mild Concern (68%)</span>
                    </div>
                    <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
                      <div className="w-[68%] h-full bg-amber-500 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-stone-700">Sebum Balance</span>
                      <span className="text-orange-700">Needs Care (54%)</span>
                    </div>
                    <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
                      <div className="w-[54%] h-full bg-orange-500 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-xs text-stone-600">
                  <div className="font-semibold text-stone-800 mb-0.5">Automated Match Insight</div>
                  Recommending Niacinamide 5% + Zinc PCA to refine T-zone pores within ₹500 budget.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-lavender-600 mb-2 block">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            How SkinWise AI Transforms Your Routine
          </h2>
          <p className="text-stone-600 text-sm mt-3">
            Designed for students and young consumers confused by overwhelming skincare marketing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-8 border border-cream-300 shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-lavender-100 text-lavender-700 flex items-center justify-center font-bold text-lg mb-6 group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">1. Scan Your Skin</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Upload a front-facing selfie taken in natural light. We interface with the official <strong>YouCam Skin AI API</strong> to extract empirical cosmetic scores for wrinkles, pores, hydration, and spots.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-8 border border-cream-300 shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg mb-6 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">2. Transparent Routine</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Receive a step-by-step Morning and Evening regimen tailored to your actual skin findings, budget tier, and preferences (fragrance-free, minimalist, vegan) with clear rationales.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-8 border border-cream-300 shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-6 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">3. Smart Shopping in ₹</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Compare curated skincare products priced in Indian Rupees (₹). Understand exactly why an ingredient matches your skin before spending a single rupee.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: Explainable AI */}
          <div className="bg-white rounded-3xl p-8 border border-cream-300 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-lavender-50 text-lavender-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900">Explainable Decisions, Zero Hype</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Many skincare apps act as black boxes or push expensive affiliate products without justification. SkinWise AI provides deterministic, documented reasons for every recommended active—explaining why a 2% Salicylic Acid or Ceramide Complex fits your skin profile.
              </p>
              <ul className="space-y-2.5 text-xs text-stone-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Never invents scores or claims when API data is omitted</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Includes strict patch-test and non-medical advisories</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Supports fragrance-free and budget-conscious filtering</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Skin Progress Journal */}
          <div className="bg-white rounded-3xl p-8 border border-cream-300 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-coolblue-50 text-coolblue-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900">Personalized Skin Journal</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Skincare requires patience and consistency. Save your periodic reports to your local browser/SQLite database, log personal observations, track skin feel changes, and monitor progress over time.
              </p>
              <ul className="space-y-2.5 text-xs text-stone-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Save structured reports with timestamps</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Log skin sensations (Dry, Irritated, Breakout, Balanced)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant deletion controls to protect your personal history</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cosmetic Disclaimer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DisclaimerBanner showPatchTest={true} />
      </section>
    </div>
  );
};
