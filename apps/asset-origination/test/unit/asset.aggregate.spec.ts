import { DDRating } from '@daos/shared-kernel';
import { AssetClass, AssetId, AssetSubClass, Money, TenantId } from '@daos/shared-kernel';

import { Asset } from '../../src/domain/aggregates/asset.aggregate';

const tenantId = TenantId.create('tenant-asset');
const sponsorId = 'sponsor-1';

function originated(): Asset {
  return Asset.originate({
    tenantId,
    name: 'Highland Logistics Facility',
    assetClass: 'realEstate',
    assetSubClass: 'land',
    sponsorId,
    legalName: 'Highland Logistics Facility',
    country: 'US',
    jurisdictions: ['US'],
    purchasePrice: Money.of(100000000n, 'USD'),
  });
}

function throughDueDiligence(asset: Asset): Asset {
  asset.startScreening('test-actor');
  asset.qualify('test-actor');
  asset.startDueDiligence('test-actor');
  asset.completeDueDiligence('BBB' as DDRating, 'test-actor');
  return asset;
}

function withValuation(asset: Asset): Asset {
  asset.updateValuation({
    fairValueMinorUnits: '105000000',
    currency: 'USD',
    methodology: 'dcf',
    valuedAt: new Date().toISOString(),
  }, 'test-actor');
  return asset;
}

function readyForApproval(): Asset {
  const asset = throughDueDiligence(originated());
  withValuation(asset);
  asset.startRiskReview('test-actor');
  asset.submitForApproval('test-actor');
  return asset;
}

describe('Asset aggregate', () => {
  it('originates in ORIGINATED status with a record event', () => {
    const asset = originated();
    expect(asset.status).toBe('ORIGINATED');
    expect(asset.name).toBe('Highland Logistics Facility');
    expect(asset.jurisdictions).toEqual(['US']);
    expect(asset.purchasePrice?.amount).toBe(100000000n);
    const events = asset.pullEvents();
    expect(events.map((e) => e.eventType)).toContain('asset.originated.v1');
  });

  it('requires a non-empty name', () => {
    expect(() => Asset.originate({ tenantId, name: '   ', assetClass: 'realEstate', assetSubClass: 'land', sponsorId, legalName: 'n/a', country: 'US', jurisdictions: [] })).toThrow(
      'Asset name is required',
    );
  });

  it('moves through due diligence and records a due diligence completed event', () => {
    const asset = originated();
    asset.startScreening('test-actor');
    expect(asset.status).toBe('SCREENING');
    asset.qualify('test-actor');
    expect(asset.status).toBe('QUALIFIED');
    asset.startDueDiligence('test-actor');
    expect(asset.status).toBe('DUE_DILIGENCE');
    asset.completeDueDiligence('BBB' as DDRating, 'test-actor');
    expect(asset.status).toBe('VALUATION');
    expect(asset.pullEvents().map((e) => e.eventType)).toContain('asset.due-diligence.completed.v1');
  });

  it('refuses to enter due diligence after rejection', () => {
    const asset = originated();
    asset.reject('sponsor default risk', 'test-actor');
    expect(() => asset.startDueDiligence('test-actor')).toThrow('Invalid transition from REJECTED to DUE_DILIGENCE');
  });

  it('updates valuation without changing lifecycle status (AO-000)', () => {
    const asset = throughDueDiligence(originated());
    const before = asset.status;
    asset.updateValuation({
      fairValueMinorUnits: '110000000',
      currency: 'USD',
      methodology: 'comps',
      valuedAt: new Date().toISOString(),
    }, 'test-actor');
    expect(asset.status).toBe(before);
    expect(asset.valuation?.methodology).toBe('comps');
    expect(asset.pullEvents().map((e) => e.eventType)).toContain('asset.valuation.updated.v1');
  });

  it('requires a valuation and DD rating before submission for approval', () => {
    const asset = throughDueDiligence(originated());
    asset.startRiskReview('test-actor');
    expect(() => asset.submitForApproval('test-actor')).toThrow('without a valuation');
    withValuation(asset);
    asset.completeRiskReview('test-actor');
    expect(asset.status).toBe('READY_FOR_APPROVAL');
  });

  it('approves only from READY_FOR_APPROVAL', () => {
    const asset = readyForApproval();
    asset.approve('test-actor', 'test-actor');
    expect(asset.status).toBe('APPROVED');
    expect(asset.approvedBy).toBe('test-actor');
    expect(asset.pullEvents().map((e) => e.eventType)).toContain('asset.approved.v1');
  });

  it('cannot be approved before it is ready for approval', () => {
    const asset = throughDueDiligence(originated());
    withValuation(asset);
    expect(() => asset.approve('test-actor', 'test-actor')).toThrow('READY_FOR_APPROVAL');
  });

  it('rejects and records an asset rejected event, refusing double reject', () => {
    const asset = originated();
    asset.reject('lack of sponsor track record', 'test-actor');
    expect(asset.status).toBe('REJECTED');
    expect(asset.rejectionReason).toBe('lack of sponsor track record');
    expect(asset.pullEvents().map((e) => e.eventType)).toContain('asset.rejected.v1');
    expect(() => asset.reject('again', 'test-actor')).toThrow('Asset is already rejected');
  });

  it('reconstructs from persisted state preserving version', () => {
    const original = readyForApproval();
    const clone = Asset.reconstruct({
      id: AssetId.create(original.id.value),
      tenantId: original.tenantId,
      name: original.name,
      assetClass: original.assetClass as AssetClass,
      assetSubClass: original.assetSubClass as AssetSubClass,
      sponsorId: original.sponsorId,
      status: original.status,
      jurisdictions: original.jurisdictions,
      country: original.country,
      purchasePrice: original.purchasePrice,
      collateral: original.collateral,
      provenance: original.provenance,
      valuation: original.valuation,
      dueDiligenceRating: original.dueDiligenceRating,
      approvedBy: null,
      rejectionReason: null,
      version: original.version,
      externalReference: original.externalReference,
      internalReference: original.internalReference,
      legalName: original.legalName,
      source: original.source,
      screening: null,
      qualification: null,
    });
    expect(clone.version).toBe(original.version);
    expect(clone.status).toBe('READY_FOR_APPROVAL');
    expect(clone.valuation?.fairValueMinorUnits).toBe('105000000');
  });
});
