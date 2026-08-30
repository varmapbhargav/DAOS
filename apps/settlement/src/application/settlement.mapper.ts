import { CustodyType, Holding, SettlementCycle, SettlementLeg, SettlementParty, SettlementStatus, SettlementType } from '@daos/shared-kernel';

import { CustodyAccount } from '../domain/aggregates/custody-account.aggregate';
import { SettlementInstruction } from '../domain/aggregates/settlement-instruction.aggregate';
import { toMoneyDto } from './money.mapper';

export interface SettlementInstructionDto {
  id: string;
  tenantId: string;
  tradeReference: string;
  settlementType: SettlementType;
  cycle: SettlementCycle;
  settlementDate: string;
  securityId: string;
  quantity: string;
  amount: { amount: string; currency: string };
  legs: SettlementLegDto[];
  status: SettlementStatus;
  failureReason: string | null;
  version: number;
}

export interface SettlementLegDto {
  party: SettlementParty;
  securityId: string;
  quantity: string;
  amount: { amount: string; currency: string };
  settlementDate: string;
}

export interface CustodyAccountDto {
  id: string;
  tenantId: string;
  investorId: string;
  custodyType: CustodyType;
  custodianRef: string;
  holdings: HoldingDto[];
  version: number;
}

export interface HoldingDto {
  securityId: string;
  quantity: string;
  available: string;
  locked: string;
  averagePrice: { amount: string; currency: string };
}

export function toSettlementInstructionDto(instruction: SettlementInstruction): SettlementInstructionDto {
  return {
    id: instruction.id.value,
    tenantId: instruction.tenantId.value,
    tradeReference: instruction.tradeReference,
    settlementType: instruction.settlementType,
    cycle: instruction.cycle,
    settlementDate: instruction.settlementDate,
    securityId: instruction.securityId,
    quantity: instruction.quantity.toString(),
    amount: toMoneyDto(instruction.amount),
    legs: instruction.legs.map(toLegDto),
    status: instruction.status,
    failureReason: instruction.failureReason,
    version: instruction.version,
  };
}

function toLegDto(leg: SettlementLeg): SettlementLegDto {
  return {
    party: leg.party,
    securityId: leg.securityId,
    quantity: leg.quantity.toString(),
    amount: toMoneyDto(leg.amount),
    settlementDate: leg.settlementDate,
  };
}

export function toCustodyAccountDto(account: CustodyAccount): CustodyAccountDto {
  return {
    id: account.id.value,
    tenantId: account.tenantId.value,
    investorId: account.investorId,
    custodyType: account.custodyType,
    custodianRef: account.custodianRef,
    holdings: account.holdings.map(toHoldingDto),
    version: account.version,
  };
}

function toHoldingDto(holding: Holding): HoldingDto {
  return {
    securityId: holding.securityId,
    quantity: holding.quantity.toString(),
    available: holding.available.toString(),
    locked: holding.locked.toString(),
    averagePrice: toMoneyDto(holding.averagePrice),
  };
}
