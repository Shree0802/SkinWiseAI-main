import { describe, it, expect } from 'vitest';
import { getNormalizedApiBaseUrl, buildApiUrl } from '../services/apiClient';

describe('apiClient URL construction and normalization', () => {
  it('guarantees /api/v1 prefix without duplication', () => {
    // buildApiUrl ensures single /api/v1
    const healthUrl = buildApiUrl('/health');
    expect(healthUrl).toMatch(/\/api\/v1\/health$/);
    expect(healthUrl).not.toContain('/api/v1/api/v1');
  });

  it('prevents duplicated prefix if endpoint already includes /api/v1', () => {
    const urlFromPrefix = buildApiUrl('/api/v1/health');
    expect(urlFromPrefix).toMatch(/\/api\/v1\/health$/);
    expect(urlFromPrefix).not.toContain('/api/v1/api/v1');
  });

  it('correctly constructs dynamic paths with parameters', () => {
    const reportUrl = buildApiUrl('/skin-analysis/report-xyz-123');
    expect(reportUrl).toMatch(/\/api\/v1\/skin-analysis\/report-xyz-123$/);

    const journalUrl = buildApiUrl('/journal/entry-456');
    expect(journalUrl).toMatch(/\/api\/v1\/journal\/entry-456$/);
  });

  it('normalized base URL does not have trailing slashes', () => {
    const base = getNormalizedApiBaseUrl();
    expect(base.endsWith('/')).toBe(false);
    expect(base.endsWith('/api/v1')).toBe(true);
  });
});
