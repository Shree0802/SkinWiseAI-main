import React from 'react';
import { Sparkles, Check, Plus, ExternalLink } from 'lucide-react';
import type { ProductItem } from '../types';

interface ProductCardProps {
  product: ProductItem;
  isSelectedForCompare?: boolean;
  onToggleCompare?: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSelectedForCompare = false,
  onToggleCompare,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-cream-300 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Header tags: Category & Sample Catalogue Badge */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-lavender-50 text-lavender-700 border border-lavender-200">
            {product.category}
          </span>

          {product.is_sample_catalogue && (
            <span
              title="Demonstration catalogue entry"
              className="text-[10px] px-2 py-0.5 rounded bg-cream-200 text-stone-600 font-medium border border-cream-300"
            >
              Demo Catalogue
            </span>
          )}
        </div>

        {/* Product Brand & Title */}
        <div className="text-xs text-stone-500 font-medium">{product.brand}</div>
        <h3 className="font-bold text-base text-stone-900 group-hover:text-lavender-700 transition-colors mt-0.5">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Match score & explainability if present */}
        {product.match_score !== undefined && product.match_score !== null && (
          <div className="mt-3 p-2.5 bg-lavender-50/60 rounded-xl border border-lavender-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-lavender-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-lavender-600" />
                <span>Match Score</span>
              </span>
              <span className="font-bold text-lavender-900">{product.match_score}%</span>
            </div>
            {product.match_reasons && product.match_reasons.length > 0 && (
              <ul className="text-[11px] text-stone-600 space-y-0.5 mt-1">
                {product.match_reasons.slice(0, 2).map((reason, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-lavender-500" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Key Ingredients */}
        <div className="mt-3">
          <div className="text-[11px] text-stone-400 font-medium mb-1 uppercase tracking-wider">
            Key Ingredients
          </div>
          <div className="flex flex-wrap gap-1.5">
            {product.key_ingredients.map((ing, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200/60"
              >
                {ing}
              </span>
            ))}
          </div>
        </div>

        {/* Suitability Pills */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {product.suitability_tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-[10px] font-medium px-2 py-0.5 rounded bg-cream-100 text-stone-600 border border-cream-200"
            >
              {tag}
            </span>
          ))}
          {product.is_fragrance_free && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Fragrance-Free
            </span>
          )}
        </div>
      </div>

      {/* Footer: Price in INR & Actions */}
      <div className="mt-5 pt-4 border-t border-cream-200 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-stone-400 block -mb-0.5 font-medium">Price</span>
          <span className="text-lg font-bold text-stone-900">
            ₹{product.price_inr.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleCompare && (
            <button
              onClick={() => onToggleCompare(product)}
              className={`p-2 rounded-xl text-xs font-medium border flex items-center gap-1 transition-all ${
                isSelectedForCompare
                  ? 'bg-lavender-600 text-white border-lavender-600 shadow-sm'
                  : 'bg-white text-stone-600 border-cream-300 hover:border-lavender-400'
              }`}
              title={isSelectedForCompare ? 'Remove from compare' : 'Add to compare'}
            >
              {isSelectedForCompare ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isSelectedForCompare ? 'Added' : 'Compare'}</span>
            </button>
          )}

          {product.verified_url && (
            <a
              href={product.verified_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors"
              title="View sample source link"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
