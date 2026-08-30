import { DealParticipantId, TenantId } from '@daos/shared-kernel';
import { ParticipantRole, ParticipantStatus } from '@daos/shared-kernel';

export class DealParticipant {
  private constructor(
    public readonly id: DealParticipantId,
    public readonly dealId: string,
    public readonly tenantId: string,
    public readonly entityId: string,
    private _role: ParticipantRole,
    private _status: ParticipantStatus,
    public readonly effectiveFrom: string,
    private _effectiveTo: string | null,
  ) {}

  static add(params: {
    dealId: string;
    tenantId: string;
    entityId: string;
    role: ParticipantRole;
  }): DealParticipant {
    return new DealParticipant(
      DealParticipantId.create(),
      params.dealId,
      params.tenantId,
      params.entityId,
      params.role,
      'ACTIVE',
      new Date().toISOString(),
      null,
    );
  }

  static reconstruct(params: {
    id: DealParticipantId;
    dealId: string;
    tenantId: string;
    entityId: string;
    role: ParticipantRole;
    status: ParticipantStatus;
    effectiveFrom: string;
    effectiveTo: string | null;
  }): DealParticipant {
    return new DealParticipant(
      params.id,
      params.dealId,
      params.tenantId,
      params.entityId,
      params.role,
      params.status,
      params.effectiveFrom,
      params.effectiveTo,
    );
  }

  get role(): ParticipantRole {
    return this._role;
  }

  get status(): ParticipantStatus {
    return this._status;
  }

  get effectiveTo(): string | null {
    return this._effectiveTo;
  }

  deactivate(): void {
    if (this._status === 'INACTIVE') return;
    this._status = 'INACTIVE';
    this._effectiveTo = new Date().toISOString();
  }

  changeRole(role: ParticipantRole): void {
    if (this._status === 'INACTIVE') throw new Error('Cannot change role of inactive participant');
    this._role = role;
  }
}
