import {
  ClosingCondition,
  EconomicRights,
  TenantId,
  TermSheetId,
} from '@daos/shared-kernel';

import { TermSheet } from '../../src/domain/entities/term-sheet.entity';

const tenantId = TenantId.create('tenant-ts');

const economicRights: EconomicRights = {
  dividendPolicy: 'quarterly',
  preferredReturn: 8,
  carryPercentage: 20,
  hurdleRate: 8,
};

const condition: ClosingCondition = {
  conditionType: 'legal',
  description: 'Executed loan documents',
  metAt: null,
};

function draft(): TermSheet {
  return TermSheet.create({ tenantId, dealId: 'deal-1' });
}

function finalizable(): TermSheet {
  const ts = TermSheet.create({
    tenantId,
    dealId: 'deal-1',
    economicRights,
  });
  ts.addClosingCondition({
    conditionType: 'legal',
    description: 'Executed loan documents',
    metAt: null,
  });
  return ts;
}

describe('TermSheet entity', () => {
  it('creates a draft term sheet', () => {
    const ts = draft();
    expect(ts.status).toBe('draft');
    expect(ts.economicRights).toBeNull();
    expect(ts.closingConditions).toEqual([]);
    expect(ts.finalizedBy).toBeNull();
  });

  it('adds closing conditions', () => {
    const ts = draft();
    ts.addClosingCondition(condition);
    expect(ts.closingConditions).toHaveLength(1);
    expect(ts.closingConditions[0].description).toBe('Executed loan documents');
  });

  it('marks a closing condition as met', () => {
    const ts = draft();
    ts.addClosingCondition(condition);
    ts.markConditionMet('Executed loan documents');
    expect(ts.closingConditions[0].metAt).not.toBeNull();
  });

  it('throws when marking an unknown condition as met', () => {
    const ts = draft();
    expect(() => ts.markConditionMet('nope')).toThrow('Closing condition not found');
  });

  it('refuses to finalize without economic rights', () => {
    const ts = draft();
    ts.addClosingCondition(condition);
    expect(() => ts.finalize('user-1')).toThrow('without economic rights');
  });

  it('refuses to finalize without closing conditions', () => {
    const ts = draft();
    expect(() => ts.finalize('user-1')).toThrow('without closing conditions');
  });

  it('finalizes with economic rights and closing conditions', () => {
    const ts = finalizable();
    ts.finalize('user-1');
    expect(ts.status).toBe('finalized');
    expect(ts.finalizedBy).toBe('user-1');
    expect(ts.finalizedAt).not.toBeNull();
  });

  it('refuses to modify a finalized term sheet', () => {
    const ts = finalizable();
    ts.finalize('user-1');
    expect(() => ts.addClosingCondition(condition)).toThrow('finalized and cannot be modified');
    expect(() => ts.finalize('user-2')).toThrow('already finalized');
  });

  it('reconstructs from persisted state', () => {
    const ts = TermSheet.reconstruct({
      id: TermSheetId.create('ts-1'),
      tenantId,
      dealId: 'deal-1',
      governanceTerms: null,
      economicRights,
      vestingSchedule: null,
      transferRestrictions: [],
      closingConditions: [condition],
      status: 'finalized',
      finalizedAt: '2026-01-15T10:00:00.000Z',
      finalizedBy: 'user-1',
    });
    expect(ts.status).toBe('finalized');
    expect(ts.economicRights?.preferredReturn).toBe(8);
    expect(ts.closingConditions).toHaveLength(1);
  });
});
