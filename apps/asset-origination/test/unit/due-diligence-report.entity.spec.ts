import { DDRating, DueDiligenceReportId, Finding, TenantId } from '@daos/shared-kernel';

import { DueDiligenceReport } from '../../src/due-diligence/domain/entities/due-diligence-report.entity';

const tenantId = TenantId.create('tenant-dd');

const finding: Finding = {
  category: 'environmental',
  severity: 'warning',
  description: 'Phase 1 ESA flagged minor contamination',
  status: 'open',
};

describe('DueDiligenceReport entity', () => {
  it('creates a draft report with no rating', () => {
    const report = DueDiligenceReport.create({ tenantId, assetId: 'asset-1' });
    expect(report.status).toBe('draft');
    expect(report.rating).toBeNull();
    expect(report.findings).toEqual([]);
  });

  it('adds findings', () => {
    const report = DueDiligenceReport.create({ tenantId, assetId: 'asset-1' });
    report.addFinding(finding);
    expect(report.findings).toHaveLength(1);
    expect(report.findings[0].category).toBe('environmental');
  });

  it('completes with rating, reviewer and timestamp', () => {
    const report = DueDiligenceReport.create({ tenantId, assetId: 'asset-1' });
    report.complete({
      rating: 'A' as DDRating,
      completedBy: 'user-1',
      completedAt: '2026-01-15T10:00:00.000Z',
      summary: 'No material findings',
    });
    expect(report.status).toBe('completed');
    expect(report.rating).toBe('A');
    expect(report.completedBy).toBe('user-1');
    expect(report.completedAt).toBe('2026-01-15T10:00:00.000Z');
    expect(report.summary).toBe('No material findings');
  });

  it('refuses to complete an already completed report', () => {
    const report = DueDiligenceReport.create({ tenantId, assetId: 'asset-1' });
    report.complete({ rating: 'BBB' as DDRating, completedBy: 'user-1', completedAt: '2026-01-15T10:00:00.000Z' });
    expect(() =>
      report.complete({ rating: 'A' as DDRating, completedBy: 'user-1', completedAt: '2026-01-15T11:00:00.000Z' }),
    ).toThrow('already completed');
  });

  it('reconstructs from persisted state', () => {
    const report = DueDiligenceReport.reconstruct({
      id: DueDiligenceReportId.create('report-1'),
      tenantId,
      assetId: 'asset-1',
      status: 'completed',
      rating: 'BBB' as DDRating,
      findings: [finding],
      completedBy: 'user-1',
      completedAt: '2026-01-15T10:00:00.000Z',
      summary: 'OK',
    });
    expect(report.status).toBe('completed');
    expect(report.rating).toBe('BBB');
    expect(report.findings).toHaveLength(1);
  });
});
