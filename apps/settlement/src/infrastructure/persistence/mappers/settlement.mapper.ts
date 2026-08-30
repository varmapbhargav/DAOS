import { CustodyAccountId, CustodyType, Holding, Money, SettlementCycle, SettlementInstructionId, SettlementLeg, SettlementStatus, SettlementType, TenantId } from '@daos/shared-kernel';

import { CustodyAccount } from '../../../domain/aggregates/custody-account.aggregate';
import { SettlementInstruction } from '../../../domain/aggregates/settlement-instruction.aggregate';
import {
  CustodyAccountOrmEntity,
  SettlementInstructionOrmEntity,
} from '../entities/settlement.orm-entities';

type MoneyRow = { amount: string; currency: string };

type LegRow = {
  party: string;
  securityId: string;
  quantity: string;
  amount: MoneyRow;
  settlementDate: string;
};

type HoldingRow = {
  securityId: string;
  quantity: string;
  available: string;
  locked: string;
  averagePrice: MoneyRow;
};

function moneyToRow(money: Money): MoneyRow {
  return { amount: money.amount.toString(), currency: money.currency };
}

function moneyFromRow(row: MoneyRow): Money {
  return Money.of(BigInt(row.amount), row.currency);
}

function legToRow(leg: SettlementLeg): LegRow {
  return {
    party: leg.party,
    securityId: leg.securityId,
    quantity: leg.quantity.toString(),
    amount: moneyToRow(leg.amount),
    settlementDate: leg.settlementDate,
  };
}

function legFromRow(row: LegRow): SettlementLeg {
  return {
    party: row.party as SettlementLeg['party'],
    securityId: row.securityId,
    quantity: BigInt(row.quantity),
    amount: moneyFromRow(row.amount),
    settlementDate: row.settlementDate,
  };
}

function holdingToRow(h: Holding): HoldingRow {
  return {
    securityId: h.securityId,
    quantity: h.quantity.toString(),
    available: h.available.toString(),
    locked: h.locked.toString(),
    averagePrice: moneyToRow(h.averagePrice),
  };
}

function holdingFromRow(row: HoldingRow): Holding {
  return {
    securityId: row.securityId,
    quantity: BigInt(row.quantity),
    available: BigInt(row.available),
    locked: BigInt(row.locked),
    averagePrice: moneyFromRow(row.averagePrice),
  };
}

export function settlementInstructionToOrm(
  s: SettlementInstruction,
): Partial<SettlementInstructionOrmEntity> {
  return {
    id: s.id.value,
    tenantId: s.tenantId.value,
    tradeReference: s.tradeReference,
    status: s.status,
    settlementType: s.settlementType,
    cycle: s.cycle,
    settlementDate: s.settlementDate,
    securityId: s.securityId,
    quantity: s.quantity.toString(),
    amount: moneyToRow(s.amount) as unknown as object,
    legs: s.legs.map(legToRow) as unknown as object,
    failureReason: s.failureReason,
    version: s.version,
  };
}

export function settlementInstructionFromOrm(
  e: SettlementInstructionOrmEntity,
): SettlementInstruction {
  return SettlementInstruction.reconstruct({
    id: SettlementInstructionId.create(e.id),
    tenantId: TenantId.create(e.tenantId),
    tradeReference: e.tradeReference,
    settlementType: e.settlementType as SettlementType,
    cycle: e.cycle as SettlementCycle,
    settlementDate: e.settlementDate,
    securityId: e.securityId,
    quantity: BigInt(e.quantity),
    amount: moneyFromRow(e.amount as MoneyRow),
    legs: ((e.legs as LegRow[]) ?? []).map(legFromRow),
    status: e.status as SettlementStatus,
    failureReason: e.failureReason,
    version: e.version,
  });
}

export function custodyAccountToOrm(a: CustodyAccount): Partial<CustodyAccountOrmEntity> {
  return {
    id: a.id.value,
    tenantId: a.tenantId.value,
    investorId: a.investorId,
    custodyType: a.custodyType,
    custodianRef: a.custodianRef,
    holdings: a.holdings.map(holdingToRow) as unknown as object,
    version: a.version,
  };
}

export function custodyAccountFromOrm(e: CustodyAccountOrmEntity): CustodyAccount {
  return CustodyAccount.reconstruct({
    id: CustodyAccountId.create(e.id),
    tenantId: TenantId.create(e.tenantId),
    investorId: e.investorId,
    custodyType: e.custodyType as CustodyType,
    custodianRef: e.custodianRef,
    holdings: ((e.holdings as HoldingRow[]) ?? []).map(holdingFromRow),
    version: e.version,
  });
}
