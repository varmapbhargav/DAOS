import {
  CapitalStack,
  DealId,
  Money,
  TenantId,
} from '@daos/shared-kernel';

import { Deal } from '../../src/domain/aggregates/deal.aggregate';
import { CapitalStackValidator } from '../../src/domain/services/capital-stack-validator';
import { ClosingConditionChecker } from '../../src/domain/services/closing-condition-checker';

const tenantId = TenantId.create('tenant-deal');
const validator = new CapitalStackValidator();
const checker = new ClosingConditionChecker();

const stack: CapitalStack = {
  tranches: [
    { trancheType: 'senior', amount: Money.of(50000000n, 'USD'), coupon: 8, seniority: 1 },
    { trancheType: 'juniorDebt', amount: Money.of(25000000n, 'USD'), coupon: 12, seniority: 2 },
  ],
};

function structured(): Deal {
  return Deal.structure({
    tenantId,
    name: 'Aurora Credit Facility',
    assetId: 'asset-1',
    sponsorId: 'sponsor-1',
  });
}

function structuredWithCondition(): Deal {
  const deal = Deal.structure({
    tenantId,
    name: 'Aurora Credit Facility',
    assetId: 'asset-1',
    sponsorId: 'sponsor-1',
    closingConditions: [{ conditionType: 'legal', description: 'Executed loan documents', metAt: null }],
  });
  deal.updateCapitalStack(stack, validator);
  deal.finalizeTermSheet('user-1');
  return deal;
}

describe('Deal aggregate', () => {
  it('structures in draft status with a structure event', () => {
    const deal = structured();
    expect(deal.status).toBe('draft');
    expect(deal.name).toBe('Aurora Credit Facility');
    expect(deal.assetId).toBe('asset-1');
    expect(deal.sponsorId).toBe('sponsor-1');
    expect(deal.capitalStack).toBeNull();
    expect(deal.version).toBe(1);
    const events = deal.pullEvents();
    expect(events.map((e) => e.eventType)).toContain('deal.structured.v1');
  });

  it('requires a non-empty name', () => {
    expect(() =>
      Deal.structure({ tenantId, name: '   ', assetId: 'asset-1', sponsorId: 'sponsor-1' }),
    ).toThrow('Deal name is required');
  });

  it('updates the capital stack and moves to structuring', () => {
    const deal = structured();
    deal.updateCapitalStack(stack, validator);
    expect(deal.status).toBe('structuring');
    expect(deal.capitalStack?.tranches).toHaveLength(2);
    expect(deal.version).toBe(2);
    expect(deal.pullEvents().map((e) => e.eventType)).not.toContain('deal.term-sheet.finalized.v1');
  });

  it('rejects an invalid capital stack', () => {
    const deal = structured();
    const bad: CapitalStack = {
      tranches: [{ trancheType: 'senior', amount: Money.of(0n, 'USD'), coupon: 8, seniority: 1 }],
    };
    expect(() => deal.updateCapitalStack(bad, validator)).toThrow('Invalid capital stack');
    expect(deal.status).toBe('draft');
  });

  it('finalizes the term sheet into legal review', () => {
    const deal = structured();
    deal.updateCapitalStack(stack, validator);
    deal.finalizeTermSheet('user-1');
    expect(deal.status).toBe('legalReview');
    expect(deal.pullEvents().map((e) => e.eventType)).toContain('deal.term-sheet.finalized.v1');
  });

  it('cannot finalize the term sheet before structuring', () => {
    const deal = structured();
    expect(() => deal.finalizeTermSheet('user-1')).toThrow('cannot finalize term sheet');
  });

  it('marks a closing condition as met and raises an event', () => {
    const deal = structuredWithCondition();
    deal.meetClosingCondition('Executed loan documents');
    expect(deal.closingConditions[0].metAt).not.toBeNull();
    expect(deal.pullEvents().map((e) => e.eventType)).toContain('deal.closing-condition.met.v1');
  });

  it('approves only when all closing conditions are met', () => {
    const deal = structuredWithCondition();
    expect(() => deal.approve('credit-analyst', checker)).toThrow('until all closing conditions are met');

    deal.meetClosingCondition('Executed loan documents');
    deal.approve('credit-analyst', checker);
    expect(deal.status).toBe('approved');
    expect(deal.approvedBy).toBe('credit-analyst');
    expect(deal.pullEvents().map((e) => e.eventType)).toContain('deal.approved.v1');
  });

  it('cannot approve before the term sheet is finalized', () => {
    const deal = structured();
    deal.updateCapitalStack(stack, validator);
    expect(() => deal.approve('credit-analyst', checker)).toThrow('cannot be approved until term sheet is finalized');
  });

  it('closes only after approval', () => {
    const deal = structuredWithCondition();
    deal.meetClosingCondition('Executed loan documents');
    expect(() => deal.close('closer')).toThrow('cannot be closed until it is approved');

    deal.approve('credit-analyst', checker);
    deal.close('closer');
    expect(deal.status).toBe('closed');
    expect(deal.closedAt).not.toBeNull();
    expect(deal.pullEvents().map((e) => e.eventType)).toContain('deal.closed.v1');
  });

  it('cancels and refuses double cancellation or closing', () => {
    const deal = structured();
    deal.cancel('sponsor withdrew');
    expect(deal.status).toBe('cancelled');
    expect(deal.pullEvents().map((e) => e.eventType)).toContain('deal.cancelled.v1');
    expect(() => deal.cancel('again')).toThrow('already cancelled');
    expect(() => deal.close('closer')).toThrow('Cancelled deals cannot be closed');
  });

  it('reconstructs from persisted state preserving version', () => {
    const original = structured();
    original.updateCapitalStack(stack, validator);
    const clone = Deal.reconstruct({
      id: DealId.create(original.id.value),
      tenantId: original.tenantId,
      name: original.name,
      assetId: original.assetId,
      sponsorId: original.sponsorId,
      status: original.status,
      capitalStack: original.capitalStack,
      economicRights: original.economicRights,
      governanceTerms: original.governanceTerms,
      closingConditions: original.closingConditions,
      approvedBy: original.approvedBy,
      closedAt: original.closedAt,
      version: original.version,
    });
    expect(clone.version).toBe(original.version);
    expect(clone.status).toBe('structuring');
    expect(clone.capitalStack?.tranches).toHaveLength(2);
    expect(clone.pullEvents()).toHaveLength(0);
  });
});
