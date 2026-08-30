import { IssuanceId, TenantId } from '@daos/shared-kernel';

import { Issuance } from '../../src/domain/aggregates/issuance.aggregate';

const tenantId = TenantId.create('tenant-issuance');

function created(): Issuance {
  return Issuance.create({
    tenantId,
    name: 'Aurora Fund I Token',
    instrumentType: 'fundUnit',
    network: 'ethereum',
  });
}

describe('Issuance aggregate', () => {
  it('creates in draft status with a created event', () => {
    const issuance = created();
    expect(issuance.status).toBe('draft');
    expect(issuance.name).toBe('Aurora Fund I Token');
    expect(issuance.instrumentType).toBe('fundUnit');
    expect(issuance.network).toBe('ethereum');
    expect(issuance.whitelist).toEqual([]);
    expect(issuance.version).toBe(1);
    const events = issuance.pullEvents();
    expect(events.map((e) => e.eventType)).toContain('issuance.created.v1');
  });

  it('requires a non-empty name', () => {
    expect(() =>
      Issuance.create({ tenantId, name: '   ', instrumentType: 'debtToken', network: 'polygon' }),
    ).toThrow('Issuance name is required');
  });

  it('signs legal docs and raises an event, refusing double sign', () => {
    const issuance = created();
    issuance.signLegalDocs('user-1');
    expect(issuance.status).toBe('legalDocsSigned');
    expect(issuance.pullEvents().map((e) => e.eventType)).toContain('issuance.legal-docs.signed.v1');
    expect(() => issuance.signLegalDocs('user-2')).toThrow('Only draft issuances can sign legal documents');
  });

  it('confirms a mint and raises a minted event, refusing double mint', () => {
    const issuance = created();
    issuance.signLegalDocs('user-1');
    issuance.confirmMint('mint-1', '1000000000000000000', '0xmint');
    expect(issuance.status).toBe('minted');
    expect(issuance.totalSupplyMinorUnits).toBe('1000000000000000000');
    expect(issuance.pullEvents().map((e) => e.eventType)).toContain('issuance.token.minted.v1');
    expect(() => issuance.confirmMint('mint-2', '1', '0xmint2')).toThrow('already minted');
  });

  it('adds and removes whitelist entries with events', () => {
    const issuance = created();
    issuance.addToWhitelist('0xAb58', 'investor-1');
    expect(issuance.whitelist).toHaveLength(1);
    expect(issuance.whitelist[0].walletAddress).toBe('0xAb58');
    expect(() => issuance.addToWhitelist('0xAb58', 'investor-2')).toThrow('already whitelisted');
    expect(issuance.pullEvents().map((e) => e.eventType)).toContain('issuance.whitelist.updated.v1');

    issuance.removeFromWhitelist('0xAb58');
    expect(issuance.whitelist).toHaveLength(0);
    expect(() => issuance.removeFromWhitelist('0xAb58')).toThrow('not on whitelist');
  });

  it('applies a transfer restriction', () => {
    const issuance = created();
    issuance.applyTransferRestriction({
      restrictionType: 'lockup',
      holdingPeriodDays: 180,
      jurisdictionBlock: 'US-NY',
    });
    expect(issuance.transferRestrictions).toHaveLength(1);
    expect(issuance.pullEvents().map((e) => e.eventType)).toContain('issuance.transfer-restriction.applied.v1');
  });

  it('syncs the cap table and completes the issuance', () => {
    const issuance = created();
    issuance.signLegalDocs('user-1');
    issuance.confirmMint('mint-1', '1000', '0xmint');
    issuance.openWhitelist();
    issuance.syncCapTable('cap-table-1');
    expect(issuance.status).toBe('complete');
    expect(issuance.capTableId).toBe('cap-table-1');
    expect(issuance.pullEvents().map((e) => e.eventType)).toContain('issuance.cap-table.synced.v1');
  });

  it('reconstructs from persisted state preserving version', () => {
    const original = created();
    original.signLegalDocs('user-1');
    const clone = Issuance.reconstruct({
      id: IssuanceId.create(original.id.value),
      tenantId: original.tenantId,
      name: original.name,
      instrumentType: original.instrumentType,
      network: original.network,
      status: original.status,
      capTableId: original.capTableId,
      whitelist: original.whitelist,
      transferRestrictions: original.transferRestrictions,
      tokenStandard: original.tokenStandard,
      totalSupplyMinorUnits: original.totalSupplyMinorUnits,
      version: original.version,
    });
    expect(clone.version).toBe(original.version);
    expect(clone.status).toBe('legalDocsSigned');
    expect(clone.pullEvents()).toHaveLength(0);
  });
});