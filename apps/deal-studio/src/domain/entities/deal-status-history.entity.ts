import { DealStatusHistoryId } from '@daos/shared-kernel';
import { DealStatus } from '@daos/shared-kernel';

export class DealStatusHistory {
  private constructor(
    public readonly id: DealStatusHistoryId,
    public readonly dealId: string,
    public readonly tenantId: string,
    public readonly previousStatus: DealStatus | null,
    public readonly newStatus: DealStatus,
    public readonly reason: string,
    public readonly changedBy: string,
    public readonly changedAt: string,
    public readonly metadata: Record<string, unknown>,
  ) {}

  static record(params: {
    dealId: string;
    tenantId: string;
    previousStatus: DealStatus | null;
    newStatus: DealStatus;
    reason: string;
    changedBy: string;
    metadata?: Record<string, unknown>;
  }): DealStatusHistory {
    return new DealStatusHistory(
      DealStatusHistoryId.create(),
      params.dealId,
      params.tenantId,
      params.previousStatus,
      params.newStatus,
      params.reason,
      params.changedBy,
      new Date().toISOString(),
      params.metadata ?? {},
    );
  }

  static reconstruct(params: {
    id: DealStatusHistoryId;
    dealId: string;
    tenantId: string;
    previousStatus: DealStatus | null;
    newStatus: DealStatus;
    reason: string;
    changedBy: string;
    changedAt: string;
    metadata: Record<string, unknown>;
  }): DealStatusHistory {
    return new DealStatusHistory(
      params.id,
      params.dealId,
      params.tenantId,
      params.previousStatus,
      params.newStatus,
      params.reason,
      params.changedBy,
      params.changedAt,
      params.metadata,
    );
  }
}
