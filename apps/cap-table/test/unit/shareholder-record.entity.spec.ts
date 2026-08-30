import { ShareholderRecordId } from '@daos/shared-kernel';

import { ShareholderRecord } from '../../src/domain/entities/shareholder-record.entity';

function create() {
  return ShareholderRecord.create({
    shareholderId: 'sh-001',
    name: 'Acme Ventures',
    shareholderType: 'investor',
    walletAddress: '0xAb58',
    shareClassId: 'common',
    unitsHeld: 1000n,
  });
}

describe('ShareholderRecord entity', () => {
  it('creates a record', () => {
    const record = create();
    expect(record.shareholderId).toBe('sh-001');
    expect(record.name).toBe('Acme Ventures');
    expect(record.shareholderType).toBe('investor');
    expect(record.unitsHeld).toBe(1000n);
    expect(record.version).toBe(1);
  });

  it('rejects missing shareholder id', () => {
    expect(() => ShareholderRecord.create({ shareholderId: '   ', name: 'X', shareholderType: 'investor', walletAddress: null, shareClassId: 'common', unitsHeld: 1n })).toThrow(
      'Shareholder id is required',
    );
  });

  it('rejects missing name', () => {
    expect(() => ShareholderRecord.create({ shareholderId: 'sh-1', name: '  ', shareholderType: 'investor', walletAddress: null, shareClassId: 'common', unitsHeld: 1n })).toThrow(
      'Shareholder name is required',
    );
  });

  it('rejects negative units', () => {
    expect(() => ShareholderRecord.create({ shareholderId: 'sh-1', name: 'X', shareholderType: 'investor', walletAddress: null, shareClassId: 'common', unitsHeld: -1n })).toThrow(
      'Held units cannot be negative',
    );
  });

  it('adjusts units and refuses to go negative', () => {
    const record = create();
    record.adjustUnits(-400n);
    expect(record.unitsHeld).toBe(600n);
    expect(() => record.adjustUnits(-700n)).toThrow('Insufficient units held');
  });

  it('reconstructs preserving id and version', () => {
    const original = create();
    original.adjustUnits(500n);
    const clone = ShareholderRecord.reconstruct({
      id: ShareholderRecordId.create(original.id.value),
      shareholderId: original.shareholderId,
      name: original.name,
      shareholderType: original.shareholderType,
      walletAddress: original.walletAddress,
      shareClassId: original.shareClassId,
      unitsHeld: original.unitsHeld,
      version: original.version,
    });
    expect(clone.id.value).toBe(original.id.value);
    expect(clone.version).toBe(original.version);
    expect(clone.unitsHeld).toBe(1500n);
  });
});