import { Money, SettlementInstructionId, SettlementLeg, TenantId } from '@daos/shared-kernel';

import { SettlementInstruction } from '../../src/domain/aggregates/settlement-instruction.aggregate';

describe('SettlementInstruction aggregate', () => {
  const tenantId = TenantId.create('tenant-1');

  function makeLeg(overrides: Partial<SettlementLeg> = {}): SettlementLeg {
    return {
      party: 'centralCounterparty',
      securityId: 'security-1',
      quantity: 1000n,
      amount: Money.of(100000n, 'USD'),
      settlementDate: '2026-10-05',
      ...overrides,
    };
  }

  function initiate(overrides: Partial<Parameters<typeof SettlementInstruction.initiate>[0]> = {}) {
    return SettlementInstruction.initiate({
      tenantId,
      tradeReference: 'trade-ref-1',
      settlementType: 'deliveryVsPayment',
      cycle: 'T2',
      settlementDate: '2026-10-05',
      securityId: 'security-1',
      quantity: 1000n,
      amount: Money.of(100000n, 'USD'),
      legs: [makeLeg(), makeLeg({ party: 'brokerBuyer' })],
      ...overrides,
    });
  }

  it('initiates an instruction and raises SettlementInitiated', () => {
    const instruction = initiate();

    expect(instruction.id).toBeInstanceOf(SettlementInstructionId);
    expect(instruction.status).toBe('initiated');
    expect(instruction.pullEvents().map((e) => e.eventType)).toContain('settlement.initiated.v1');
  });

  it('rejects invalid initiate parameters', () => {
    expect(() => initiate({ tradeReference: '' })).toThrow('Trade reference is required');
    expect(() => initiate({ quantity: 0n })).toThrow('Settlement quantity must be positive');
    expect(() => initiate({ legs: [] })).toThrow('At least one settlement leg is required');
  });

  it('matches a pending instruction and raises SettlementMatched', () => {
    const instruction = initiate();
    instruction.pullEvents();
    instruction.match();

    expect(instruction.status).toBe('matched');
    expect(instruction.pullEvents().map((e) => e.eventType)).toContain('settlement.matched.v1');
  });

  it('confirms a matched instruction and raises TradeSettled', () => {
    const instruction = initiate();
    instruction.pullEvents();
    instruction.match();
    instruction.pullEvents();
    instruction.confirmSettlement();

    expect(instruction.status).toBe('settled');
    expect(instruction.pullEvents().map((e) => e.eventType)).toContain('trade.settled.v1');
  });

  it('refuses confirmation before matching', () => {
    const instruction = initiate();
    expect(() => instruction.confirmSettlement()).toThrow(
      'Only matched instructions can be confirmed for settlement',
    );
  });

  it('fails an instruction and raises SettlementFailed', () => {
    const instruction = initiate();
    instruction.pullEvents();
    instruction.fail('custodian rejection');

    expect(instruction.status).toBe('failed');
    expect(instruction.failureReason).toBe('custodian rejection');
    expect(instruction.pullEvents().map((e) => e.eventType)).toContain('settlement.failed.v1');
  });
});
