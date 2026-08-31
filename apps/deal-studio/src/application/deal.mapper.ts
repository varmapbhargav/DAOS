import {
  CapitalStack,
  ClosingCondition,
  DealStatus,
  EconomicRights,
  GovernanceTerms,
} from '@daos/shared-kernel';

import { Deal } from '../domain/aggregates/deal.aggregate';
import { TermSheet } from '../domain/aggregates/term-sheet.aggregate';

export interface MoneyDto {
  amountMinorUnits: string;
  currency: string;
}

export interface CapitalStackDto {
  tranches: {
    trancheId: string;
    name: string;
    type: string;
    currency: string;
    targetAmount: MoneyDto;
    seniority: number;
    ranking: number;
  }[];
}

export interface DealDto {
  id: string;
  tenantId: string;
  name: string;
  assetId: string;
  sponsorId: string;
  status: DealStatus;
  capitalStack: CapitalStackDto | null;
  economicRights: EconomicRights | null;
  governanceTerms: GovernanceTerms | null;
  closingConditions: ClosingCondition[];
  approvedBy: string | null;
  closedAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface TermSheetDto {
  id: string;
  tenantId: string;
  dealId: string;
  governanceTerms: GovernanceTerms | null;
  economicRights: EconomicRights | null;
  vestingSchedule: TermSheet['vestingSchedule'];
  transferRestrictions: TermSheet['transferRestrictions'];
  closingConditionIds: string[];
  status: string;
  finalizedAt: string | null;
  finalizedBy: string | null;
}

export function toDealDto(deal: Deal): DealDto {
  return {
    id: deal.id.value,
    tenantId: deal.tenantId.value,
    name: deal.name,
    assetId: deal.assetId,
    sponsorId: deal.sponsorId,
    status: deal.status,
    capitalStack: deal.capitalStack
      ? {
          tranches: deal.capitalStack.tranches.map((t) => ({
            trancheId: t.trancheId,
            name: t.name,
            type: t.type,
            currency: t.targetAmount.currency,
            targetAmount: {
              amountMinorUnits: t.targetAmount.amount.toString(),
              currency: t.targetAmount.currency,
            },
            seniority: t.seniority,
            ranking: t.ranking,
          })),
        }
      : null,
    economicRights: deal.economicRights,
    governanceTerms: deal.governanceTerms,
    closingConditions: deal.closingConditions,
    approvedBy: deal.approvedBy,
    closedAt: deal.closedAt,
    version: deal.version,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function toTermSheetDto(ts: TermSheet): TermSheetDto {
  return {
    id: ts.id.value,
    tenantId: ts.tenantId.value,
    dealId: ts.dealId,
    governanceTerms: ts.governanceTerms,
    economicRights: ts.economicRights,
    vestingSchedule: ts.vestingSchedule,
    transferRestrictions: ts.transferRestrictions,
    closingConditionIds: ts.closingConditionIds,
    status: ts.status,
    finalizedAt: ts.finalizedAt,
    finalizedBy: ts.finalizedBy,
  };
}
