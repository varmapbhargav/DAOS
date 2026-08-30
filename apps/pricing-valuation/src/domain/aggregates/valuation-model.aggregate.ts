import { AggregateRoot, Money, TenantId, ValuationModelId, ValuationModelType } from '@daos/shared-kernel';

import { ValuationApproved } from '../events/valuation-approved.event';
import { ValuationDiscrepancyDetected } from '../events/valuation-discrepancy-detected.event';
import { ValuationModelRun } from '../events/valuation-model-run.event';
import { ValuationRejected } from '../events/valuation-rejected.event';

export type ValuationModelStatus = 'initiated' | 'run' | 'approved' | 'rejected';

export type InitiateValuationParams = {
  tenantId: TenantId;
  assetId: string;
  methodology: ValuationModelType;
};

export class ValuationModel extends AggregateRoot {
  private constructor(
    public readonly id: ValuationModelId,
    public readonly tenantId: TenantId,
    private _assetId: string,
    private _methodology: ValuationModelType,
    private _status: ValuationModelStatus,
    private _value: Money | null,
    private _reportId: string | null,
    private _rejectionReason: string | null,
    private _discrepancyDetected: boolean,
  ) {
    super();
  }

  static initiate(params: InitiateValuationParams): ValuationModel {
    if (!params.assetId.trim()) throw new Error('Asset id is required');
    const model = new ValuationModel(
      ValuationModelId.create(),
      params.tenantId,
      params.assetId.trim(),
      params.methodology,
      'initiated',
      null,
      null,
      null,
      false,
    );
    model.incrementVersion();
    return model;
  }

  runValuation(params: { value: Money; reportId: string }): void {
    if (this._status !== 'initiated') throw new Error('Only initiated valuations can be run');
    this._value = params.value;
    this._reportId = params.reportId;
    this._status = 'run';
    this.raise(
      new ValuationModelRun(this.id.value, this.tenantId.value, this._assetId, {
        amount: this._value.amount.toString(),
        currency: this._value.currency,
      }, this._reportId),
    );
    this.incrementVersion();
  }

  detectDiscrepancy(comparatorValue: Money): void {
    if (this._discrepancyDetected) throw new Error('Discrepancy already detected');
    if (!this._value) throw new Error('No model value to compare');
    this._discrepancyDetected = true;
    this.raise(
      new ValuationDiscrepancyDetected(this.id.value, this.tenantId.value, this._assetId, {
        amount: comparatorValue.amount.toString(),
        currency: comparatorValue.currency,
      }, {
        amount: this._value.amount.toString(),
        currency: this._value.currency,
      }),
    );
    this.incrementVersion();
  }

  approve(): void {
    if (this._status !== 'run') throw new Error('Only run valuations can be approved');
    if (!this._value) throw new Error('Valuation has no value');
    this._status = 'approved';
    this.raise(
      new ValuationApproved(this.id.value, this.tenantId.value, this._assetId, {
        amount: this._value.amount.toString(),
        currency: this._value.currency,
      }),
    );
    this.incrementVersion();
  }

  reject(reason: string): void {
    if (this._status !== 'run') throw new Error('Only run valuations can be rejected');
    this._status = 'rejected';
    this._rejectionReason = reason;
    this.raise(new ValuationRejected(this.id.value, this.tenantId.value, this._assetId, reason));
    this.incrementVersion();
  }

  get assetId(): string {
    return this._assetId;
  }

  get methodology(): ValuationModelType {
    return this._methodology;
  }

  get status(): ValuationModelStatus {
    return this._status;
  }

  get value(): Money | null {
    return this._value;
  }

  get reportId(): string | null {
    return this._reportId;
  }

  get rejectionReason(): string | null {
    return this._rejectionReason;
  }

  get discrepancyDetected(): boolean {
    return this._discrepancyDetected;
  }

  static reconstruct(params: {
    id: ValuationModelId;
    tenantId: TenantId;
    assetId: string;
    methodology: ValuationModelType;
    status: ValuationModelStatus;
    value: Money | null;
    reportId: string | null;
    rejectionReason: string | null;
    discrepancyDetected: boolean;
    version: number;
  }): ValuationModel {
    const model = new ValuationModel(
      params.id,
      params.tenantId,
      params.assetId,
      params.methodology,
      params.status,
      params.value,
      params.reportId,
      params.rejectionReason,
      params.discrepancyDetected,
    );
    model._version = params.version;
    return model;
  }
}
