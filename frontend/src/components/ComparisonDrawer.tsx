import React from 'react';
import { X, Check, Minus, Sparkles } from 'lucide-react';
import type { ProductItem } from '../types';

interface ComparisonDrawerProps {
  products: ProductItem[];
  onRemove: (productId: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export const ComparisonDrawer: React.FC<ComparisonDrawerProps> = ({
  products,
  onRemove,
  onClear,
  onClose,
}) => {
  if (products.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-cream-300 shadow-2xl transition-transform animate-in slide-in-from-bottom-5 duration-300 max-h-[85vh] overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-lavender-100 text-lavender-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Product Comparison ({products.length} / 3)
              </h3>
              <p className="text-xs text-stone-500">
                Compare ingredients, suitability, and prices side-by-side in Indian Rupees (₹)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="text-xs text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-cream-50 rounded-2xl p-4 border border-cream-200 relative flex flex-col justify-between"
            >
              <button
                onClick={() => onRemove(p.id)}
                className="absolute top-3 right-3 text-stone-400 hover:text-rose-600 p-1 rounded-full hover:bg-white transition-colors"
                title="Remove from comparison"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-3">
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-lavender-100 text-lavender-700">
                  {p.category}
                </span>
                <div>
                  <div className="text-xs text-stone-500 font-medium">{p.brand}</div>
                  <h4 className="font-bold text-stone-900 text-sm mt-0.5">{p.name}</h4>
                  <div className="text-base font-extrabold text-stone-900 mt-1">
                    ₹{p.price_inr.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Key Ingredients */}
                <div>
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                    Key Actives
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {p.key_ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded bg-white border border-cream-300 text-stone-700"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suitability */}
                <div>
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                    Skin Types
                  </span>
                  <div className="text-xs text-stone-700 font-medium">
                    {p.suitability_tags.join(', ')}
                  </div>
                </div>

                {/* Fragrance Free */}
                <div className="flex items-center gap-1.5 text-xs text-stone-700 pt-1">
                  {p.is_fragrance_free ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Fragrance-Free Formulation</span>
                    </>
                  ) : (
                    <>
                      <Minus className="w-4 h-4 text-stone-400" />
                      <span>Contains Fragrance / Essential Oils</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
