import { randomUUID } from 'node:crypto';

export class AssetLifecycleHistory {
  private constructor(
    public readonly id: string,
    public readonly assetId: string,
    public readonly tenantId: string,
    public readonly previousStatus: string,
    public readonly newStatus: string,
    public readonly transitionReason: string | null,
    public readonly changedBy: string,
    public readonly changedAt: string,
    public readonly metadata: Record<string, unknown> | null,
  ) {}

  static create(params: {
    assetId: string;
    tenantId: string;
    previousStatus: string;
    newStatus: string;
    transitionReason: string | null;
    changedBy: string;
    changedAt: string;
    metadata?: Record<string, unknown>;
  }): AssetLifecycleHistory {
    return new AssetLifecycleHistory(
      randomUUID(),
      params.assetId,
      params.tenantId,
      params.previousStatus,
      params.newStatus,
      params.transitionReason,
      params.changedBy,
      params.changedAt,
      params.metadata ?? null,
    );
  }

  static reconstruct(params: {
    id: string;
    assetId: string;
    tenantId: string;
    previousStatus: string;
    newStatus: string;
    transitionReason: string | null;
    changedBy: string;
    changedAt: string;
    metadata: Record<string, unknown> | null;
  }): AssetLifecycleHistory {
    return new AssetLifecycleHistory(
      params.id,
      params.assetId,
      params.tenantId,
      params.previousStatus,
      params.newStatus,
      params.transitionReason,
      params.changedBy,
      params.changedAt,
      params.metadata,
    );
  }

  toDto() {
    return {
      id: this.id,
      assetId: this.assetId,
      tenantId: this.tenantId,
      previousStatus: this.previousStatus,
      newStatus: this.newStatus,
      transitionReason: this.transitionReason,
      changedBy: this.changedBy,
      changedAt: this.changedAt,
      metadata: this.metadata,
    };
  }
}