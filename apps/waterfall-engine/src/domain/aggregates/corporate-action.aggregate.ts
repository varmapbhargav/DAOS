import {
  AggregateRoot,
  CorporateActionId,
  CorporateActionStatus,
  CorporateActionType,
  InvestorElection,
  TenantId,
} from '@daos/shared-kernel';

import { CorporateActionAnnounced } from '../events/corporate-action-announced.event';
import { CorporateActionExecuted } from '../events/corporate-action-executed.event';
import { ElectionClosed } from '../events/election-closed.event';

export type AnnounceCorporateActionParams = {
  tenantId: TenantId;
  issuanceId: string;
  type: CorporateActionType;
  exDate: string;
  recordDate: string;
  paymentDate: string;
  options: string[];
};

export class CorporateAction extends AggregateRoot {
  private constructor(
    public readonly id: CorporateActionId,
    public readonly tenantId: TenantId,
    private _issuanceId: string,
    private _type: CorporateActionType,
    private _exDate: string,
    private _recordDate: string,
    private _paymentDate: string,
    private _options: string[],
    private _elections: InvestorElection[],
    private _status: CorporateActionStatus,
  ) {
    super();
  }

  static announce(params: AnnounceCorporateActionParams): CorporateAction {
    if (!params.issuanceId.trim()) throw new Error('Issuance id is required');
    if (params.options.length === 0) throw new Error('At least one election option is required');
    const action = new CorporateAction(
      CorporateActionId.create(),
      params.tenantId,
      params.issuanceId.trim(),
      params.type,
      params.exDate,
      params.recordDate,
      params.paymentDate,
      [...params.options],
      [],
      'announced',
    );
    action.raise(new CorporateActionAnnounced(action.id.value, action.tenantId.value, action._issuanceId, action._type));
    action.incrementVersion();
    return action;
  }

  openElection(): void {
    if (this._status === 'cancelled') throw new Error('Cancelled corporate actions cannot be opened');
    this._status = 'electionOpen';
    this.incrementVersion();
  }

  closeElection(elections: InvestorElection[]): void {
    if (this._status !== 'electionOpen') throw new Error('Only corporate actions with an open election can be closed');
    this._elections = [...elections];
    this._status = 'electionClosed';
    this.raise(new ElectionClosed(this.id.value, this.tenantId.value, this._issuanceId, this._elections.length));
    this.incrementVersion();
  }

  execute(): void {
    if (this._status !== 'electionClosed') throw new Error('Only corporate actions with closed elections can be executed');
    this._status = 'completed';
    this.raise(new CorporateActionExecuted(this.id.value, this.tenantId.value, this._issuanceId, this._type));
    this.incrementVersion();
  }

  get issuanceId(): string {
    return this._issuanceId;
  }

  get type(): CorporateActionType {
    return this._type;
  }

  get exDate(): string {
    return this._exDate;
  }

  get recordDate(): string {
    return this._recordDate;
  }

  get paymentDate(): string {
    return this._paymentDate;
  }

  get options(): string[] {
    return [...this._options];
  }

  get elections(): InvestorElection[] {
    return this._elections.map((e) => ({ ...e }));
  }

  get status(): CorporateActionStatus {
    return this._status;
  }

  static reconstruct(params: {
    id: CorporateActionId;
    tenantId: TenantId;
    issuanceId: string;
    type: CorporateActionType;
    exDate: string;
    recordDate: string;
    paymentDate: string;
    options: string[];
    elections: InvestorElection[];
    status: CorporateActionStatus;
    version: number;
  }): CorporateAction {
    const action = new CorporateAction(
      params.id,
      params.tenantId,
      params.issuanceId,
      params.type,
      params.exDate,
      params.recordDate,
      params.paymentDate,
      params.options,
      params.elections,
      params.status,
    );
    action._version = params.version;
    return action;
  }
}
