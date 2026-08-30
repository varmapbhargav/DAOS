import { AssetId, AssetClass, AssetSubClass, Collateral, Money, TenantId, ValuationMethodology, DDRating } from '@daos/shared-kernel';

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

function withValuation(asset: Asset): Asset {
  asset.updateValuation({
    fairValueMinorUnits: '105000000',
    currency: 'USD',
    methodology: 'dcf',
    valuedAt: new Date().toISOString(),
  }, 'test-actor');
  return asset;
}

describe('Asset aggregate', () => {
  it('originates in originated status with a record event', () => {
    const asset = originated();
    expect(asset.status).toBe('originated');
    expect(asset.name).toBe('Highland Logistics Facility');
    expect(asset.jurisdictions).toEqual(['US']);
    expect(asset.purchasePrice?.amount).toBe(100000000n);
    const events = asset.pullEvents();
    expect(events.map((e) => e.eventType)).toContain('asset.originated.v1');
  });

  it('requires a non-empty name', () => {
    expect(() => Asset.originate({ tenantId, name: '   ', assetClass: 'realEstate', sponsorId, jurisdictions: [] })).toThrow(
      'Asset name is required',
    );
  });

  it('moves through due diligence and records a due diligence completed event', () => {
    const asset = originated();
    asset.startScreening('test-actor');
    expect(asset.status).toBe('screening');
    asset.qualify('test-actor');
    expect(asset.status).toBe('qualified');
    asset.startDueDiligence('test-actor');
    expect(asset.status).toBe('dueDiligence');
    asset.completeDueDiligence('BBB' as DDRating, 'test-actor');
    expect(asset.status).toBe('valuation');
    expect(asset.pullEvents().map((e) => e.eventType)).toContain('asset.due-diligence.completed.v1');
  });

  it('refuses to enter due diligence after rejection', () => {
    const asset = originated();
    asset.reject('sponsor default risk', 'test-actor');
    expect(() => asset.startDueDiligence('test-actor')).toThrow('Rejected assets cannot resume due diligence');
  });

  it('updates valuation and records a valuation updated event', () => {
    const asset = originated();
    asset.updateValuation({
      fairValueMinorUnits: '110000000',
      currency: 'USD',
      methodology: 'comps',
      valuedAt: new Date().toISOString(),
    }, 'test-actor');
    expect(asset.status).toBe('valuation');
    expect(asset.valuation?.methodology).toBe('comps');
    expect(asset.pullEvents().map((e) => e.eventType)).toContain('asset.valuation.updated.v1');
  });

  it('approves only after due diligence is completed and a valuation exists', () => {
    const asset = originated();
    asset.startScreening('test-actor');
    asset.qualify('test-actor');
    asset.startDueDiligence('test-actor');
    asset.completeDueDiligence('BBB' as DDRating, 'test-actor');
    expect(() => asset.approve('test-actor', 'test-actor')).toThrow('without a valuation');

    withValuation(asset);
    asset.approve('test-actor', 'test-actor');
    expect(asset.status).toBe('approved');
    expect(asset.approvedBy).toBe('test-actor');
    expect(asset.pullEvents().map((e) => e.eventType)).toContain('asset.approved.v1');
  });

  it('rejects and records an asset rejected event, refusing double reject', () => {
    const asset = originated();
    asset.reject('lack of sponsor track record', 'test-actor');
    expect(asset.status).toBe('rejected');
    expect(asset.rejectionReason).toBe('lack of sponsor track record');
    expect(asset.pullEvents().map((e) => e.eventType)).toContain('asset.rejected.v1');
    expect(() => asset.reject('again', 'test-actor')).toThrow('Asset already rejected');
  });

  it('reconstructs from persisted state preserving version', () => {
    const original = originated();
    withValuation(original);
    const clone = Asset.reconstruct({
      id: AssetId.create(original.id.value),
      tenantId: original.tenantId,
      name: original.name,
      assetClass: original.assetClass,
      assetSubClass: original.assetSubClass,
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
    });
    expect(clone.version).toBe(original.version);
    expect(clone.status).toBe('valuation');
    expect(clone.valuation?.fairValueMinorUnits).toBe('105000000');
  });
});