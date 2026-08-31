import {
  AssetReference,
  CapitalStack,
  CapitalTranche,
  CapitalTrancheType,
  ClosingCondition,
  DealDocumentReference,
  DealEconomicsData,
  DealEntityReference,
  DealId,
  DealMetadata,
  DealStatus,
  EconomicRights,
  GovernanceTerms,
  Money,
  OpportunityReference,
  TenantId,
} from '@daos/shared-kernel';

import { Deal } from '../../../domain/aggregates/deal.aggregate';
import { DealParticipant } from '../../../domain/entities/deal-participant.entity';
import { DealStatusHistory } from '../../../domain/entities/deal-status-history.entity';
import { DealOrmEntity } from '../entities/deal.orm-entity';

type TrancheJson = {
  trancheId: string;
  name: string;
  type: string;
  currency: string;
  targetAmount: { amount: string; currency: string };
  committedAmount: { amount: string; currency: string } | null;
  fundedAmount: { amount: string; currency: string } | null;
  seniority: number;
  ranking: number;
  economics: object;
};

function moneyFromJson(j: { amount: string; currency: string }): Money {
  return Money.of(BigInt(j.amount), j.currency);
}

function moneyToJson(m: Money): { amount: string; currency: string } {
  return { amount: m.amount.toString(), currency: m.currency };
}

export class DealMapper {
  static toDomain(e: DealOrmEntity): Deal {
    const stack = e.capitalStack
      ? {
          tranches: (e.capitalStack as unknown as { tranches: TrancheJson[] }).tranches.map(
            (t): CapitalTranche => ({
              trancheId: t.trancheId,
              name: t.name,
              type: t.type as CapitalTrancheType,
              currency: t.currency,
              targetAmount: moneyFromJson(t.targetAmount),
              committedAmount: t.committedAmount ? moneyFromJson(t.committedAmount) : null,
              fundedAmount: t.fundedAmount ? moneyFromJson(t.fundedAmount) : null,
              seniority: t.seniority,
              ranking: t.ranking,
              economics: t.economics as CapitalTranche['economics'],
            }),
          ),
        }
      : null;

    return Deal.reconstruct({
      id: DealId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      name: e.name,
      assetId: e.assetId,
      sponsorId: e.sponsorId,
      status: e.status as DealStatus,
      metadata: e.metadata as unknown as DealMetadata | null,
      capitalStack: stack,
      economicRights: e.economicRights as unknown as EconomicRights | null,
      governanceTerms: e.governanceTerms as unknown as GovernanceTerms | null,
      closingConditions: e.closingConditions as unknown as ClosingCondition[],
      economics: e.economics as unknown as DealEconomicsData | null,
      approvedBy: e.approvedBy,
      approvedAt: e.approvedAt,
      rejectedBy: e.rejectedBy,
      rejectedAt: e.rejectedAt,
      rejectionReason: e.rejectionReason,
      closedAt: e.closedAt,
      holdReason: e.holdReason,
      previousStatusBeforeHold: e.previousStatusBeforeHold as DealStatus | null,
      idempotencyKey: e.idempotencyKey,
      correlationId: e.correlationId,
      statusHistory: [],  // loaded separately
      participants: [],   // loaded separately
      documents: e.documents as unknown as DealDocumentReference[],
      assetReferences: e.assetReferences as unknown as AssetReference[],
      entityReferences: e.entityReferences as unknown as DealEntityReference[],
      opportunityReference: e.opportunityReference as unknown as OpportunityReference | null,
      version: e.version,
    });
  }

  static toOrm(domain: Deal): DealOrmEntity {
    const e = new DealOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.name = domain.name;
    e.assetId = domain.assetId;
    e.sponsorId = domain.sponsorId;
    e.status = domain.status;
    e.metadata = domain.metadata ?? null;
    e.capitalStack = domain.capitalStack
      ? {
          tranches: domain.capitalStack.tranches.map((t) => ({
            trancheId: t.trancheId,
            name: t.name,
            type: t.type,
            currency: t.currency,
            targetAmount: moneyToJson(t.targetAmount),
            committedAmount: t.committedAmount ? moneyToJson(t.committedAmount) : null,
            fundedAmount: t.fundedAmount ? moneyToJson(t.fundedAmount) : null,
            seniority: t.seniority,
            ranking: t.ranking,
            economics: t.economics,
          })),
        }
      : null;
    e.economicRights = domain.economicRights;
    e.governanceTerms = domain.governanceTerms;
    e.closingConditions = domain.closingConditions;
    e.economics = domain.economics;
    e.approvedBy = domain.approvedBy;
    e.approvedAt = domain.approvedAt;
    e.rejectedBy = domain.rejectedBy;
    e.rejectedAt = domain.rejectedAt;
    e.rejectionReason = domain.rejectionReason;
    e.closedAt = domain.closedAt;
    e.holdReason = domain.holdReason;
    e.previousStatusBeforeHold = domain.previousStatusBeforeHold;
    e.idempotencyKey = domain.idempotencyKey;
    e.correlationId = domain.correlationId;
    e.assetReferences = domain.assetReferences;
    e.entityReferences = domain.entityReferences;
    e.opportunityReference = domain.opportunityReference;
    e.documents = domain.documents;
    e.version = domain.version;
    return e;
  }
}
