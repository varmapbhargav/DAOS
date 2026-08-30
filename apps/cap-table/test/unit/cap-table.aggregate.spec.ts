import { CapTableId, TenantId } from '@daos/shared-kernel';

import { CapTable } from '../../src/domain/aggregates/cap-table.aggregate';
import { ShareholderRecord } from '../../src/domain/entities/shareholder-record.entity';

const tenantId = TenantId.create('tenant-cap');

function seed(): CapTable {
  const capTable = CapTable.initialize({ tenantId, issuanceId: 'issuance-1' });
  capTable.addShareholder(ShareholderRecord.create({ shareholderId: 'sh-a', name: 'Alice', shareholderType: 'investor', walletAddress: '0xA', shareClassId: 'common', unitsHeld: 10000n }));
  capTable.addShareholder(ShareholderRecord.create({ shareholderId: 'sh-b', name: 'Bob', shareholderType: 'sponsor', walletAddress: '0xB', shareClassId: 'common', unitsHeld: 5000n }));
  return capTable;
}

describe('CapTable aggregate', () => {
  it('initializes empty', () => {
    const capTable = CapTable.initialize({ tenantId, issuanceId: 'issuance-1' });
    expect(capTable.totalIssuedUnits).toBe(0n);
    expect(capTable.shareholders).toHaveLength(0);
    expect(capTable.issuanceId).toBe('issuance-1');
    expect(capTable.shareClassId).toBe('common');
    expect(capTable.version).toBe(1);
  });

  it('adds shareholders and raises an updated event', () => {
    const capTable = seed();
    expect(capTable.shareholders).toHaveLength(2);
    expect(capTable.totalIssuedUnits).toBe(15000n);
    expect(capTable.pullEvents().map((e) => e.eventType)).toContain('cap-table.updated.v1');
  });

  it('rejects a duplicate shareholder', () => {
    const capTable = seed();
    expect(() =>
      capTable.addShareholder(ShareholderRecord.create({ shareholderId: 'sh-a', name: 'Alice2', shareholderType: 'investor', walletAddress: '0xA', shareClassId: 'common', unitsHeld: 100n })),
    ).toThrow('already exists');
  });

  it('transfers shares and records the transfer', () => {
    const capTable = seed();
    capTable.pullEvents();
    const transfer = capTable.transferShares({ fromShareholderId: 'sh-a', toShareholderId: 'sh-b', units: 2000n });
    expect(capTable.getShareholder('sh-a').unitsHeld).toBe(8000n);
    expect(capTable.getShareholder('sh-b').unitsHeld).toBe(7000n);
    expect(capTable.totalIssuedUnits).toBe(15000n);
    expect(capTable.transferLog).toHaveLength(1);
    expect(transfer.units).toBe(2000n);
    expect(capTable.pullEvents().map((e) => e.eventType)).toContain('cap-table.transfer-recorded.v1');
  });

  it('rejects transfers that would leave a shareholder negative', () => {
    const capTable = seed();
    expect(() => capTable.transferShares({ fromShareholderId: 'sh-a', toShareholderId: 'sh-b', units: 99999n })).toThrow(
      'Insufficient units held',
    );
  });

  it('rejects non-positive and self transfers', () => {
    const capTable = seed();
    expect(() => capTable.transferShares({ fromShareholderId: 'sh-a', toShareholderId: 'sh-b', units: 0n })).toThrow(
      'Transfer units must be positive',
    );
    expect(() => capTable.transferShares({ fromShareholderId: 'sh-a', toShareholderId: 'sh-a', units: 100n })).toThrow(
      'Cannot transfer to the same shareholder',
    );
  });

  it('rejects transfers to a non-shareholder', () => {
    const capTable = seed();
    expect(() => capTable.transferShares({ fromShareholderId: 'sh-a', toShareholderId: 'nobody', units: 100n })).toThrow(
      'Recipient nobody is not a shareholder',
    );
  });

  it('syncs from chain state', () => {
    const capTable = seed();
    capTable.pullEvents();
    capTable.syncFromChain({
      totalIssuedUnits: 30000n,
      blockNumber: '14500000',
      shareholders: [
        { shareholderId: 'sh-a', name: 'Alice', walletAddress: '0xA', shareClassId: 'common', units: 20000n },
        { shareholderId: 'sh-c', name: 'Carol', walletAddress: '0xC', shareClassId: 'preferred', units: 10000n },
      ],
    });
    expect(capTable.totalIssuedUnits).toBe(30000n);
    expect(capTable.shareholders).toHaveLength(2);
    expect(capTable.syncedAt).not.toBeNull();
    expect(capTable.pullEvents().map((e) => e.eventType)).toContain('cap-table.synced.v1');
  });

  it('reconstructs preserving version', () => {
    const capTable = seed();
    const clone = CapTable.reconstruct({
      id: CapTableId.create(capTable.id.value),
      tenantId: capTable.tenantId,
      issuanceId: capTable.issuanceId,
      shareClassId: capTable.shareClassId,
      shareholders: capTable.shareholders,
      transferLog: capTable.transferLog,
      totalIssuedUnits: capTable.totalIssuedUnits,
      syncedAt: capTable.syncedAt,
      version: capTable.version,
    });
    expect(clone.version).toBe(capTable.version);
    expect(clone.shareholders).toHaveLength(2);
    expect(clone.pullEvents()).toHaveLength(0);
  });
});