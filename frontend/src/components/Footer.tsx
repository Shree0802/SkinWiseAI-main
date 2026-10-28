import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-cream-200/80 border-t border-cream-300 text-stone-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-lavender-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-stone-900">
                SkinWise <span className="text-lavender-600">AI</span>
              </span>
            </div>
            <p className="text-sm text-stone-600 max-w-md leading-relaxed">
              Empowering consumers, young adults, and skincare enthusiasts with transparent, explainable skin analysis and routine recommendations powered by the YouCam Skin AI API.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-500 pt-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Zero-selfie retention by default &bull; Client-side privacy focused</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
              Features
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/analyze" className="hover:text-lavender-700 transition-colors">
                  Skin Diagnostics
                </Link>
              </li>
              <li>
                <Link to="/routine" className="hover:text-lavender-700 transition-colors">
                  Routine Builder
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-lavender-700 transition-colors">
                  Curated Shopping (₹)
                </Link>
              </li>
              <li>
                <Link to="/journal" className="hover:text-lavender-700 transition-colors">
                  Skin Progress Journal
                </Link>
              </li>
            </ul>
          </div>

          {/* Hackathon & Docs */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
              Hackathon Project
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Built for the YouCam API Skin AI & eCommerce VTO Hackathon on Devpost.
            </p>
            <a
              href="https://docs.makeupar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-lavender-700 hover:underline pt-1"
            >
              <span>YouCam S2S API Documentation</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-8 pt-8 border-t border-cream-300 text-xs text-stone-500 space-y-2">
          <p className="leading-relaxed">
            <strong>Cosmetic Information Disclaimer:</strong> SkinWise AI is an informational and cosmetic analysis assistant. It does not provide medical advice, diagnosis, treatment, or cure for dermatological pathologies. Always consult a qualified medical dermatologist for chronic or severe skin conditions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-stone-500 text-[11px]">
            <p>&copy; {new Date().getFullYear()} SkinWise AI. All prices displayed in Indian Rupees (₹).</p>
            <p className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for smarter skincare choices
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
