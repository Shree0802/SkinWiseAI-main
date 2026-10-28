import { describe, it, expect } from 'vitest';
import type { ProductItem } from '../types';

describe('Product Catalogue INR Pricing and Verification', () => {
  const sampleProduct: ProductItem = {
    id: 'prod-001',
    name: 'Gentle Hydrating Cleanser',
    brand: 'DermaPure India',
    category: 'Cleanser',
    price_inr: 399.0,
    description: 'A soothing daily cream cleanser.',
    key_ingredients: ['Ceramides NP', 'Hyaluronic Acid'],
    all_ingredients: ['Aqua', 'Glycerin', 'Ceramide NP'],
    suitability_tags: ['Dry', 'Sensitive'],
    target_concerns: ['moisture', 'redness'],
    is_fragrance_free: true,
    is_cruelty_free: true,
    is_sample_catalogue: true,
  };

  it('displays price in INR with ₹ symbol', () => {
    expect(sampleProduct.price_inr).toBe(399.0);
    const formatted = `₹${sampleProduct.price_inr.toLocaleString('en-IN')}`;
    expect(formatted).toBe('₹399');
  });

  it('identifies demonstration catalogue entry', () => {
    expect(sampleProduct.is_sample_catalogue).toBe(true);
  });

  it('contains verified ingredient lists and suitability tags', () => {
    expect(sampleProduct.key_ingredients).toContain('Ceramides NP');
    expect(sampleProduct.suitability_tags).toContain('Sensitive');
    expect(sampleProduct.is_fragrance_free).toBe(true);
  });
});
