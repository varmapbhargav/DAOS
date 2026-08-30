import {
  CapTableId,
  ShareholderRecordId,
  ShareholderType,
  TenantId,
  TransferLog,
} from '@daos/shared-kernel';

import { CapTable } from '../../../domain/aggregates/cap-table.aggregate';
import { ShareholderRecord } from '../../../domain/entities/shareholder-record.entity';
import { CapTableOrmEntity } from '../entities/cap-table.orm-entity';
import { ShareholderRecordOrmRow, TransferLogOrmRow } from '../entities/cap-table.orm-rows';

export class CapTableMapper {
  static toOrm(capTable: CapTable): Partial<CapTableOrmEntity> {
    return {
      id: capTable.id.value,
      tenantId: capTable.tenantId.value,
      issuanceId: capTable.issuanceId,
      shareClassId: capTable.shareClassId,
      shareholders: capTable.shareholders.map(toShareholderRow) as object,
      transferLog: capTable.transferLog.map(toTransferRow) as object,
      totalIssuedUnits: capTable.totalIssuedUnits.toString(),
      syncedAt: capTable.syncedAt ? new Date(capTable.syncedAt) : null,
      version: capTable.version,
    };
  }

  static toDomain(e: CapTableOrmEntity): CapTable {
    const shareholders = ((e.shareholders as ShareholderRecordOrmRow[]) ?? []).map(fromShareholderRow);
    const transferLog = ((e.transferLog as TransferLogOrmRow[]) ?? []).map(fromTransferRow);
    return CapTable.reconstruct({
      id: CapTableId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      issuanceId: e.issuanceId,
      shareClassId: e.shareClassId,
      shareholders,
      transferLog,
      totalIssuedUnits: BigInt(e.totalIssuedUnits),
      syncedAt: e.syncedAt ? e.syncedAt.toISOString() : null,
      version: e.version,
    });
  }
}

function toShareholderRow(record: ShareholderRecord): ShareholderRecordOrmRow {
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

function fromShareholderRow(row: ShareholderRecordOrmRow): ShareholderRecord {
  return ShareholderRecord.reconstruct({
    id: ShareholderRecordId.create(row.id),
    shareholderId: row.shareholderId,
    name: row.name,
    shareholderType: row.shareholderType as ShareholderType,
    walletAddress: row.walletAddress,
    shareClassId: row.shareClassId,
    unitsHeld: BigInt(row.unitsHeld),
    version: row.version,
  });
}

function toTransferRow(entry: TransferLog): TransferLogOrmRow {
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

function fromTransferRow(row: TransferLogOrmRow): TransferLog {
  return {
    id: row.id,
    fromShareholderId: row.fromShareholderId,
    toShareholderId: row.toShareholderId,
    shareClassId: row.shareClassId,
    units: BigInt(row.units),
    transferType: row.transferType,
    recordedAt: row.recordedAt,
    chainTxHash: row.chainTxHash,
  };
}