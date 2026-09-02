import { DomainEvent, ValuationCurrency, ValuationMethodology } from '@daos/shared-kernel';

export class ValuationRequested extends DomainEvent {
  get eventType(): string {
    return 'origination-case.valuation-requested.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly valuationId: string,
    public readonly requestedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}

export class ValuationUploaded extends DomainEvent {
  get eventType(): string {
    return 'origination-case.valuation-uploaded.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly valuationId: string,
    public readonly currentMarketValue: number | null,
    public readonly fairValue: number | null,
    public readonly currency: ValuationCurrency,
    public readonly valuer: string,
    public readonly methodology: ValuationMethodology,
    public readonly uploadedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}

export class ValuationApproved extends DomainEvent {
  get eventType(): string {
    return 'origination-case.valuation-approved.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly valuationId: string,
    public readonly approvedBy: string,
  ) {
    super(aggregateId, tenantId);
  }
}

export class ValuationRejected extends DomainEvent {
  get eventType(): string {
    return 'origination-case.valuation-rejected.v1';
  }
  constructor(
    aggregateId: string,
    tenantId: string,
    public readonly valuationId: string,
    public readonly rejectedBy: string,
    public readonly reason: string,
  ) {
    super(aggregateId, tenantId);
  }
}