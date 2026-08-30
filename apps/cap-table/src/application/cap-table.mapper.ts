import { ShareholderRecordState, ShareholderType, TransferLog } from '@daos/shared-kernel';

import { CapTable } from '../domain/aggregates/cap-table.aggregate';
import { ShareholderRecord } from '../domain/entities/shareholder-record.entity';

export interface ShareholderRecordDto {
  id: string;
  shareholderId: string;
  name: string;
  shareholderType: ShareholderType;
  walletAddress: string | null;
  shareClassId: string;
  unitsHeld: string;
  version: number;
}

export interface TransferLogDto {
  id: string;
  fromShareholderId: string;
  toShareholderId: string;
  shareClassId: string;
  units: string;
  transferType: string;
  recordedAt: string;
  chainTxHash: string | null;
}

export interface CapTableDto {
  id: string;
  tenantId: string;
  issuanceId: string | null;
  shareClassId: string;
  shareholders: ShareholderRecordDto[];
  transferLog: TransferLogDto[];
  totalIssuedUnits: string;
  syncedAt: string | null;
  version: number;
}

export interface WaterfallViewDto {
  capTableId: string;
  totalIssuedUnits: string;
  shareholderCount: number;
  byShareClass: Record<string, { units: string; shareholderCount: number; ownershipPct: string }>;
  byType: Record<string, { units: string; shareholderCount: number; ownershipPct: string }>;
}

export function toShareholderRecordDto(record: ShareholderRecord): ShareholderRecordDto {
  return {
    id: record.id.value,
    shareholderId: record.shareholderId,
    name: record.name,
    shareholderType: record.shareholderType,
    walletAddress: record.walletAddress,
    shareClassId: record.shareClassId,
    unitsHeld: record.unitsHeld.toString(),
    version: record.version,
  };
}

export function toTransferLogDto(entry: TransferLog): TransferLogDto {
  return {
    id: entry.id,
    fromShareholderId: entry.fromShareholderId,
    toShareholderId: entry.toShareholderId,
    shareClassId: entry.shareClassId,
    units: entry.units.toString(),
    transferType: entry.transferType,
    recordedAt: entry.recordedAt,
    chainTxHash: entry.chainTxHash,
  };
}

export function toCapTableDto(capTable: CapTable): CapTableDto {
  return {
    id: capTable.id.value,
    tenantId: capTable.tenantId.value,
    issuanceId: capTable.issuanceId,
    shareClassId: capTable.shareClassId,
    shareholders: capTable.shareholders.map(toShareholderRecordDto),
    transferLog: capTable.transferLog.map(toTransferLogDto),
    totalIssuedUnits: capTable.totalIssuedUnits.toString(),
    syncedAt: capTable.syncedAt,
    version: capTable.version,
  };
}

export function toWaterfallViewDto(capTable: CapTable): WaterfallViewDto {
  const total = capTable.totalIssuedUnits;
  const byShareClass: Record<string, { units: bigint; shareholderCount: number }> = {};
  const byType: Record<string, { units: bigint; shareholderCount: number }> = {};

  for (const record of capTable.shareholders) {
    const units = record.unitsHeld;
    const className = record.shareClassId;
    (byShareClass[className] ??= { units: 0n, shareholderCount: 0 }).units += units;
    byShareClass[className].shareholderCount += 1;

    const type = record.shareholderType;
    (byType[type] ??= { units: 0n, shareholderCount: 0 }).units += units;
    byType[type].shareholderCount += 1;
  }

  return {
    capTableId: capTable.id.value,
    totalIssuedUnits: total.toString(),
    shareholderCount: capTable.shareholders.length,
    byShareClass: Object.fromEntries(
      Object.entries(byShareClass).map(([k, v]) => [
        k,
        { units: v.units.toString(), shareholderCount: v.shareholderCount, ownershipPct: percent(total, v.units) },
      ]),
    ),
    byType: Object.fromEntries(
      Object.entries(byType).map(([k, v]) => [
        k,
        { units: v.units.toString(), shareholderCount: v.shareholderCount, ownershipPct: percent(total, v.units) },
      ]),
    ),
  };
}

function percent(total: bigint, part: bigint): string {
  if (total === 0n) return '0.00';
  const pct = (Number(part) / Number(total)) * 100;
  return pct.toFixed(2);
}