import { AggregateRoot, Money, SettlementCycle, SettlementInstructionId, SettlementLeg, SettlementParty, SettlementStatus, SettlementType, TenantId } from '@daos/shared-kernel';

import { SettlementFailed } from '../events/settlement-failed.event';
import { SettlementInitiated } from '../events/settlement-initiated.event';
import { SettlementMatched } from '../events/settlement-matched.event';
import { TradeSettled } from '../events/trade-settled.event';

export type InitiateSettlementParams = {
  tenantId: TenantId;
  tradeReference: string;
  settlementType: SettlementType;
  cycle: SettlementCycle;
  settlementDate: string;
  securityId: string;
  quantity: bigint;
  amount: Money;
  legs: SettlementLeg[];
};

export class SettlementInstruction extends AggregateRoot {
  private constructor(
    public readonly id: SettlementInstructionId,
    public readonly tenantId: TenantId,
    private _tradeReference: string,
    private _settlementType: SettlementType,
    private _cycle: SettlementCycle,
    private _settlementDate: string,
    private _securityId: string,
    private _quantity: bigint,
    private _amount: Money,
    private _legs: SettlementLeg[],
    private _status: SettlementStatus,
    private _failureReason: string | null,
  ) {
    super();
  }

  static initiate(params: InitiateSettlementParams): SettlementInstruction {
    if (!params.tradeReference.trim()) throw new Error('Trade reference is required');
    if (params.quantity <= 0n) throw new Error('Settlement quantity must be positive');
    if (params.amount.amount < 0n) throw new Error('Settlement amount cannot be negative');
    if (params.legs.length === 0) throw new Error('At least one settlement leg is required');
    const instruction = new SettlementInstruction(
      SettlementInstructionId.create(),
      params.tenantId,
      params.tradeReference.trim(),
      params.settlementType,
      params.cycle,
      params.settlementDate,
      params.securityId,
      params.quantity,
      params.amount,
      params.legs,
      'initiated',
      null,
    );
    instruction.raise(
      new SettlementInitiated(
        instruction.id.value,
        instruction.tenantId.value,
        instruction._tradeReference,
        instruction._settlementType,
        instruction._settlementDate,
      ),
    );
    instruction.incrementVersion();
    return instruction;
  }

  match(): void {
    if (this._status === 'settled') throw new Error('Settled instructions cannot be matched');
    if (this._status === 'failed') throw new Error('Failed instructions cannot be matched');
    this._status = 'matched';
    this.raise(new SettlementMatched(this.id.value, this.tenantId.value, this._tradeReference, new Date().toISOString()));
    this.incrementVersion();
  }

  confirmSettlement(): void {
    if (this._status !== 'matched') throw new Error('Only matched instructions can be confirmed for settlement');
    this._status = 'settled';
    this.raise(new TradeSettled(this.id.value, this.tenantId.value, this._tradeReference, new Date().toISOString()));
    this.incrementVersion();
  }

  fail(reason: string): void {
    if (this._status === 'settled') throw new Error('Settled instructions cannot be failed');
    this._status = 'failed';
    this._failureReason = reason;
    this.raise(new SettlementFailed(this.id.value, this.tenantId.value, this._tradeReference, reason));
    this.incrementVersion();
  }

  get tradeReference(): string {
    return this._tradeReference;
  }

  get settlementType(): SettlementType {
    return this._settlementType;
  }

  get cycle(): SettlementCycle {
    return this._cycle;
  }

  get settlementDate(): string {
    return this._settlementDate;
  }

  get securityId(): string {
    return this._securityId;
  }

  get quantity(): bigint {
    return this._quantity;
  }

  get amount(): Money {
    return this._amount;
  }

  get legs(): SettlementLeg[] {
    return this._legs.map((l) => ({ ...l }));
  }

  get status(): SettlementStatus {
    return this._status;
  }

  get failureReason(): string | null {
    return this._failureReason;
  }

  static reconstruct(params: {
    id: SettlementInstructionId;
    tenantId: TenantId;
    tradeReference: string;
    settlementType: SettlementType;
    cycle: SettlementCycle;
    settlementDate: string;
    securityId: string;
    quantity: bigint;
    amount: Money;
    legs: SettlementLeg[];
    status: SettlementStatus;
    failureReason: string | null;
    version: number;
  }): SettlementInstruction {
    const instruction = new SettlementInstruction(
      params.id,
      params.tenantId,
      params.tradeReference,
      params.settlementType,
      params.cycle,
      params.settlementDate,
      params.securityId,
      params.quantity,
      params.amount,
      params.legs,
      params.status,
      params.failureReason,
    );
    instruction._version = params.version;
    return instruction;
  }
}
