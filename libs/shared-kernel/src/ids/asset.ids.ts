// Typed IDs for Asset Origination
import { randomUUID } from 'node:crypto';

import { DomainId } from '../ids/domain-id';

export class AssetId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): AssetId {
    return new AssetId(value ?? randomUUID());
  }
}
export class DueDiligenceReportId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): DueDiligenceReportId {
    return new DueDiligenceReportId(value ?? randomUUID());
  }
}
export class CashFlowModelId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): CashFlowModelId {
    return new CashFlowModelId(value ?? randomUUID());
  }
}
export class OriginationCaseId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): OriginationCaseId {
    return new OriginationCaseId(value ?? randomUUID());
  }
}
export class SubmissionId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): SubmissionId {
    return new SubmissionId(value ?? randomUUID());
  }
}
export class CounterpartyId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): CounterpartyId {
    return new CounterpartyId(value ?? randomUUID());
  }
}
export class OwnershipId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): OwnershipId {
    return new OwnershipId(value ?? randomUUID());
  }
}
export class RightsId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): RightsId {
    return new RightsId(value ?? randomUUID());
  }
}
export class EncumbranceId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): EncumbranceId {
    return new EncumbranceId(value ?? randomUUID());
  }
}
export class ProvenanceEventId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): ProvenanceEventId {
    return new ProvenanceEventId(value ?? randomUUID());
  }
}
export class EvidenceId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): EvidenceId {
    return new EvidenceId(value ?? randomUUID());
  }
}
export class ClaimId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): ClaimId {
    return new ClaimId(value ?? randomUUID());
  }
}
export class DataRequestId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): DataRequestId {
    return new DataRequestId(value ?? randomUUID());
  }
}
export class ScreeningId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): ScreeningId {
    return new ScreeningId(value ?? randomUUID());
  }
}
export class QualificationId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): QualificationId {
    return new QualificationId(value ?? randomUUID());
  }
}
export class CompletenessId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): CompletenessId {
    return new CompletenessId(value ?? randomUUID());
  }
}
export class BlockerId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): BlockerId {
    return new BlockerId(value ?? randomUUID());
  }
}
export class DueDiligenceCaseId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): DueDiligenceCaseId {
    return new DueDiligenceCaseId(value ?? randomUUID());
  }
}
export class DdFindingId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): DdFindingId {
    return new DdFindingId(value ?? randomUUID());
  }
}
export class AssetRiskAssessmentId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): AssetRiskAssessmentId {
    return new AssetRiskAssessmentId(value ?? randomUUID());
  }
}
export class RiskItemId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): RiskItemId {
    return new RiskItemId(value ?? randomUUID());
  }
}
export class ValuationId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): ValuationId {
    return new ValuationId(value ?? randomUUID());
  }
}
export class ApprovalId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): ApprovalId {
    return new ApprovalId(value ?? randomUUID());
  }
}
export class ApprovalDecisionId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): ApprovalDecisionId {
    return new ApprovalDecisionId(value ?? randomUUID());
  }
}
export class EngineeringReadinessId extends DomainId {
  private constructor(value: string) {
    super(value);
  }
  static create(value?: string): EngineeringReadinessId {
    return new EngineeringReadinessId(value ?? randomUUID());
  }
}
