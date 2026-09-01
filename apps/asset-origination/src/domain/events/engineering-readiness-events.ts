import { DomainEvent, EngineeringReadinessStatus } from '@daos/shared-kernel';

export class EngineeringReadinessAssessed extends DomainEvent {
  get eventType(): string {
    return 'origination-case.engineering-readiness-assessed.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly assessmentId: string,
    public readonly caseId: string,
    public readonly status: EngineeringReadinessStatus,
    public readonly checksPassed: number,
    public readonly checksTotal: number,
    public readonly failedChecks: string[],
    public readonly assessedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}

export class AssetEngineeringReady extends DomainEvent {
  get eventType(): string {
    return 'asset.engineering-ready.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly caseId: string,
    public readonly assetId: string,
    public readonly readinessStatus: EngineeringReadinessStatus,
    public readonly assessedAt: string,
  ) {
    super(aggregateId, tenantId);
  }
}