export interface OriginatorDto {
  entityId: string;
  legalName: string;
}

export interface CollateralDto {
  type: string;
  description: string;
  estimatedValue: {
    amountMinorUnits: string;
    currency: string;
  };
  lienPosition: number;
}

export interface ProvenanceRecordDto {
  sourceType: string;
  sourceRef: string;
  documentedAt: string;
  priorOwners: string[];
}

export interface AssetDto {
  id: string;
  tenantId: string;
  name: string;
  assetClass: string;
  assetSubClass: string;
  sponsorId: string;
  legalName: string;
  externalReference: string | null;
  internalReference: string | null;
  status: string;
  jurisdictions: string[];
  purchasePrice: {
    amountMinorUnits: string;
    currency: string;
  } | null;
  collateral: CollateralDto[];
  provenance: ProvenanceRecordDto[];
  valuation: {
    fairValueMinorUnits: string;
    currency: string;
    methodology: string;
    valuedAt: string | null;
  } | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  source: {
    sourceId: string;
    sourceType: string;
    sourceEntityId: string;
    sourceReference: string;
    originatedAt: string;
    submittedBy: string;
    relationshipManager: string;
  } | null;
}

export interface FindingDto {
  category: string;
  severity: string;
  description: string;
  status: string;
}

export interface DueDiligenceReportDto {
  id: string;
  tenantId: string;
  assetId: string;
  status: string;
  rating: string | null;
  findings: FindingDto[];
  completedBy: string | null;
  completedAt: string | null;
  summary: string | null;
  createdAt: string;
}

export interface AssetLifecycleHistoryDto {
  id: string;
  assetId: string;
  tenantId: string;
  previousStatus: string;
  newStatus: string;
  transitionReason: string | null;
  changedBy: string;
  changedAt: string;
  metadata: Record<string, unknown> | null;
}
