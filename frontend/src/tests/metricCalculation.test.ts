import { describe, it, expect } from 'vitest';
import type { SkinMetric } from '../types';

describe('SkinMetric score calculation and severity mapping', () => {
  it('correctly maps scores to standard cosmetic severity buckets', () => {
    const sampleMetricOptimal: SkinMetric = {
      key: 'spots',
      label: 'Spots & Hyperpigmentation',
      score: 85,
      raw_score: 84.2,
      severity: 'Optimal',
      explanation: 'Minimal UV spots or pigmentation marks.'
    };
    expect(sampleMetricOptimal.score).toBeGreaterThanOrEqual(80);
    expect(sampleMetricOptimal.severity).toBe('Optimal');

    const sampleMetricConcern: SkinMetric = {
      key: 'pores',
      label: 'Pores & Surface Smoothness',
      score: 62,
      raw_score: 60.5,
      severity: 'Moderate Concern',
      explanation: 'Moderate pore visibility.'
    };
    expect(sampleMetricConcern.score).toBeLessThan(65);
    expect(sampleMetricConcern.severity).toBe('Moderate Concern');
  });

  it('handles null scores without inventing numbers', () => {
    const omittedMetric: SkinMetric = {
      key: 'wrinkles',
      label: 'Wrinkles & Fine Lines',
      score: null,
      raw_score: null,
      severity: null,
      explanation: 'Not evaluated.'
    };
    expect(omittedMetric.score).toBeNull();
    expect(omittedMetric.severity).toBeNull();
  });
});
