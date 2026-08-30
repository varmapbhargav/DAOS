import { AggregateRoot, MintRequestId, MintStatus, TenantId } from '@daos/shared-kernel';

export class MintRequest extends AggregateRoot {
  private constructor(
    public readonly id: MintRequestId,
    public readonly tenantId: TenantId,
    public readonly issuanceId: string,
    private _amountMinorUnits: string,
    private _toAddress: string,
    private _status: MintStatus,
    private _txHash: string | null,
    private _requestedBy: string,
    private _requestedAt: string,
    private _confirmedAt: string | null,
  ) {
    super();
  }

  static request(params: {
    tenantId: TenantId;
    issuanceId: string;
    amountMinorUnits: string;
    toAddress: string;
    requestedBy: string;
  }): MintRequest {
    if (!params.toAddress.trim()) throw new Error('Mint destination address is required');
    if (BigInt(params.amountMinorUnits) <= 0n) throw new Error('Mint amount must be positive');
    const request = new MintRequest(
      MintRequestId.create(),
      params.tenantId,
      params.issuanceId,
      params.amountMinorUnits,
      params.toAddress.trim(),
      'pending',
      null,
      params.requestedBy,
      new Date().toISOString(),
      null,
    );
    request.incrementVersion();
    return request;
  }

  static reconstruct(params: {
    id: MintRequestId;
    tenantId: TenantId;
    issuanceId: string;
    amountMinorUnits: string;
    toAddress: string;
    status: MintStatus;
    txHash: string | null;
    requestedBy: string;
    requestedAt: string;
    confirmedAt: string | null;
    version: number;
  }): MintRequest {
    const request = new MintRequest(
      params.id,
      params.tenantId,
      params.issuanceId,
      params.amountMinorUnits,
      params.toAddress,
      params.status,
      params.txHash,
      params.requestedBy,
      params.requestedAt,
      params.confirmedAt,
    );
    request._version = params.version;
    return request;
  }

  get amountMinorUnits(): string {
    return this._amountMinorUnits;
  }

  get toAddress(): string {
    return this._toAddress;
  }

  get status(): MintStatus {
    return this._status;
  }

  get txHash(): string | null {
    return this._txHash;
  }

  get requestedBy(): string {
    return this._requestedBy;
  }

  get requestedAt(): string {
    return this._requestedAt;
  }

  get confirmedAt(): string | null {
    return this._confirmedAt;
  }

  confirm(txHash: string): void {
    if (this._status === 'confirmed') throw new Error('Mint request already confirmed');
    if (this._status === 'failed') throw new Error('Failed mint requests cannot be confirmed');
    this._status = 'confirmed';
    this._txHash = txHash;
    this._confirmedAt = new Date().toISOString();
    this.incrementVersion();
  }

  markFailed(): void {
    this._status = 'failed';
    this.incrementVersion();
  }
}