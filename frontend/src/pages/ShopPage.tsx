import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import type { ProductItem } from '../types';
import { apiClient } from '../services/apiClient';
import { ProductCard } from '../components/ProductCard';
import { ComparisonDrawer } from '../components/ComparisonDrawer';

export const ShopPage: React.FC = () => {
  const location = useLocation();
  const prefill = (location.state as any) || {};

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSkinType, setSelectedSkinType] = useState<string>(prefill.skinType || 'All');
  const [maxBudget, setMaxBudget] = useState<number>(800);
  const [onlyFragranceFree, setOnlyFragranceFree] = useState<boolean>(false);
  const [userConcerns] = useState<string[]>(prefill.concerns || []);

  // Comparison State
  const [compareList, setCompareList] = useState<ProductItem[]>([]);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);

  const categories = ['All', 'Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Treatment', 'Eye Care'];
  const skinTypes = ['All', 'Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSkinType, maxBudget, onlyFragranceFree]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      if (userConcerns.length > 0 || selectedSkinType !== 'All' || onlyFragranceFree) {
        // Run explainable matching
        const matched = await apiClient.matchProducts({
          skin_type: selectedSkinType !== 'All' ? selectedSkinType : undefined,
          concerns: userConcerns,
          max_budget_inr: maxBudget,
          categories: selectedCategory !== 'All' ? [selectedCategory] : [],
          preferences: onlyFragranceFree ? ['fragrance_free'] : [],
        });
        setProducts(matched);
      } else {
        const data = await apiClient.getProducts({
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          skin_type: selectedSkinType !== 'All' ? selectedSkinType : undefined,
          max_budget: maxBudget,
        });
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompare = (product: ProductItem) => {
    const exists = compareList.some((p) => p.id === product.id);
    if (exists) {
      setCompareList((prev) => prev.filter((p) => p.id !== product.id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 products at a time.');
        return;
      }
      setCompareList((prev) => [...prev, product]);
      setShowDrawer(true);
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.key_ingredients.some((i) => i.toLowerCase().includes(q));

    const matchesFragrance = onlyFragranceFree ? p.is_fragrance_free : true;
    return matchesSearch && matchesFragrance;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-cream-300">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lavender-50 text-lavender-700 text-xs font-semibold mb-2 border border-lavender-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Indian Skincare Catalogue</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            Smart Skincare Shopping
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Compare products with transparent ingredient rationales, priced in Indian Rupees (₹).
          </p>
        </div>

        {/* Demo Catalogue Notice */}
        <div className="p-3 bg-cream-100 rounded-xl border border-cream-300 text-xs text-stone-600 max-w-sm">
          <strong>Transparency Notice:</strong> All items in this catalogue are sample demonstration entries with verified Indian formulations and standard market prices.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-cream-300 p-6 shadow-sm space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, brand, or key ingredient (e.g. Niacinamide, Salicylic)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-lavender-500 text-sm bg-cream-50/50"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                selectedCategory === cat
                  ? 'bg-lavender-600 text-white border-lavender-600 shadow-sm'
                  : 'bg-white text-stone-600 border-cream-300 hover:border-lavender-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filters Row: Skin Type, Budget, Fragrance-Free */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-cream-200">
          {/* Skin Type */}
          <div>
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
              Skin Type
            </label>
            <select
              value={selectedSkinType}
              onChange={(e) => setSelectedSkinType(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-cream-300 text-xs font-medium focus:ring-lavender-500 bg-white"
            >
              {skinTypes.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Skin Types' : `${st} Skin`}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
              <span>Max Budget (₹)</span>
              <span className="text-lavender-700 font-extrabold text-sm">
                Up to ₹{maxBudget.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="300"
              max="1500"
              step="50"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full accent-lavender-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>₹300</span>
              <span>₹800</span>
              <span>₹1,500+</span>
            </div>
          </div>

          {/* Fragrance-Free Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-cream-100 border border-cream-300">
            <div>
              <span className="text-xs font-bold text-stone-900 block">Fragrance-Free Only</span>
              <span className="text-[11px] text-stone-500">Sensitive skin preference</span>
            </div>
            <input
              type="checkbox"
              checked={onlyFragranceFree}
              onChange={(e) => setOnlyFragranceFree(e.target.checked)}
              className="w-4 h-4 text-lavender-600 rounded border-cream-400 focus:ring-lavender-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Comparison floating button if items selected */}
      {compareList.length > 0 && !showDrawer && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowDrawer(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-stone-900 text-white font-bold text-xs shadow-2xl hover:bg-stone-800 transition-all border border-stone-700"
          >
            <Layers className="w-4 h-4 text-lavender-400" />
            <span>Compare Selected ({compareList.length})</span>
          </button>
        </div>
      )}

      {/* Product Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-stone-500">
            Showing {filteredProducts.length} verified products
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-500 text-sm">
            Filtering product catalogue...
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSelectedForCompare={compareList.some((p) => p.id === product.id)}
                onToggleCompare={handleToggleCompare}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-cream-300 p-12 text-center text-stone-500">
            <ShoppingBag className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-semibold text-stone-800">No products matched your criteria.</p>
            <p className="text-xs text-stone-500 mt-1">Try increasing your budget slider or clearing specific filters.</p>
          </div>
        )}
      </div>

      {/* Comparison Drawer */}
      {showDrawer && (
        <ComparisonDrawer
          products={compareList}
          onRemove={(id) => setCompareList((prev) => prev.filter((p) => p.id !== id))}
          onClear={() => setCompareList([])}
          onClose={() => setShowDrawer(false)}
        />
      )}
    </div>
  );
};
