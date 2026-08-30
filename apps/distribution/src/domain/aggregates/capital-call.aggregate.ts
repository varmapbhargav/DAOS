import { AggregateRoot, CapitalCallId, CapitalCallStatus, Money, TenantId } from '@daos/shared-kernel';

import { CapitalCallFunded } from '../events/capital-call-funded.event';
import { CapitalCallIssued } from '../events/capital-call-issued.event';

export type IssueCapitalCallParams = {
  tenantId: TenantId;
  closingId: string;
  investorId: string;
  amount: Money;
  dueDate: string;
};

export class CapitalCall extends AggregateRoot {
  private constructor(
    public readonly id: CapitalCallId,
    public readonly tenantId: TenantId,
    private _closingId: string,
    private _investorId: string,
    private _amount: Money,
    private _amountFunded: Money,
    private _status: CapitalCallStatus,
    private _dueDate: string,
    private _fundedAt: string | null,
  ) {
    super();
  }

  static issue(params: IssueCapitalCallParams): CapitalCall {
    if (!params.investorId.trim()) throw new Error('Investor id is required');
    if (!params.dueDate.trim()) throw new Error('Due date is required');
    if (params.amount.amount <= 0n) throw new Error('Capital call amount must be positive');
    const call = new CapitalCall(
      CapitalCallId.create(),
      params.tenantId,
      params.closingId,
      params.investorId.trim(),
      params.amount,
      Money.zero(params.amount.currency),
      'issued',
      params.dueDate.trim(),
      null,
    );
    call.raise(
      new CapitalCallIssued(
        call.id.value,
        call.tenantId.value,
        call._closingId,
        call._investorId,
        call._amount,
        call._dueDate,
      ),
    );
    call.incrementVersion();
    return call;
  }

  recordFunding(paid: Money): void {
    if (paid.currency !== this._amount.currency) throw new Error('Currency mismatch');
    if (this._status === 'funded') throw new Error('Capital call already fully funded');
    const nextFunded = this._amountFunded.add(paid);
    if (nextFunded.amount > this._amount.amount) throw new Error('Funding exceeds the capital call amount');
    this._amountFunded = nextFunded;
    if (nextFunded.amount >= this._amount.amount) {
      this._status = 'funded';
      this._fundedAt = new Date().toISOString();
    } else {
      this._status = 'partiallyFunded';
    }
    this.raise(
      new CapitalCallFunded(this.id.value, this.tenantId.value, paid, nextFunded, this._status),
    );
    this.incrementVersion();
  }

  markDefaulted(): void {
    if (this._status === 'funded') throw new Error('Funded capital calls cannot be defaulted');
    this._status = 'defaulted';
    this.incrementVersion();
  }

  get closingId(): string {
    return this._closingId;
  }

  get investorId(): string {
    return this._investorId;
  }

  get amount(): Money {
    return this._amount;
  }

  get amountFunded(): Money {
    return this._amountFunded;
  }

  get status(): CapitalCallStatus {
    return this._status;
  }

  get dueDate(): string {
    return this._dueDate;
  }

  get fundedAt(): string | null {
    return this._fundedAt;
  }

  static reconstruct(params: {
    id: CapitalCallId;
    tenantId: TenantId;
    closingId: string;
    investorId: string;
    amount: Money;
    amountFunded: Money;
    status: CapitalCallStatus;
    dueDate: string;
    fundedAt: string | null;
    version: number;
  }): CapitalCall {
    const call = new CapitalCall(
      params.id,
      params.tenantId,
      params.closingId,
      params.investorId,
      params.amount,
      params.amountFunded,
      params.status,
      params.dueDate,
      params.fundedAt,
    );
    call._version = params.version;
    return call;
  }
}