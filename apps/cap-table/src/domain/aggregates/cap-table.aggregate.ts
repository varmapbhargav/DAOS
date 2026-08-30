import {
  AggregateRoot,
  CapTableId,
  ShareholderRecordState,
  TenantId,
  TransferLog,
} from '@daos/shared-kernel';
import { randomUUID } from 'node:crypto';

import { ShareholderRecord } from '../entities/shareholder-record.entity';
import { CapTableUpdated } from '../events/cap-table-updated.event';
import { CapTableSynced } from '../events/cap-table-synced.event';
import { TransferRecorded } from '../events/transfer-recorded.event';

export type InitializeCapTableParams = {
  tenantId: TenantId;
  issuanceId: string | null;
  shareClassId?: string;
};

export type TransferSharesParams = {
  fromShareholderId: string;
  toShareholderId: string;
  shareClassId?: string;
  units: bigint;
  transferType?: string;
};

export type SyncFromChainParams = {
  totalIssuedUnits: bigint;
  blockNumber: string;
  shareholders: Array<{
    shareholderId: string;
    name: string;
    walletAddress: string | null;
    shareClassId: string;
    units: bigint;
  }>;
};

const DEFAULT_SHARE_CLASS = 'common';

export class CapTable extends AggregateRoot {
  private constructor(
    public readonly id: CapTableId,
    public readonly tenantId: TenantId,
    private _issuanceId: string | null,
    private _shareClassId: string,
    private _shareholders: ShareholderRecord[],
    private _transferLog: TransferLog[],
    private _totalIssuedUnits: bigint,
    private _syncedAt: string | null,
  ) {
    super();
  }

  static initialize(params: InitializeCapTableParams): CapTable {
    const capTable = new CapTable(
      CapTableId.create(),
      params.tenantId,
      params.issuanceId,
      params.shareClassId ?? DEFAULT_SHARE_CLASS,
      [],
      [],
      0n,
      null,
    );
    capTable.incrementVersion();
    return capTable;
  }

  addShareholder(record: ShareholderRecord): void {
    if (this._shareholders.some((s) => s.shareholderId === record.shareholderId && s.shareClassId === record.shareClassId)) {
      throw new Error(`Shareholder ${record.shareholderId} already exists for class ${record.shareClassId}`);
    }
    this._shareholders.push(record);
    this._totalIssuedUnits += record.unitsHeld;
    this.raise(new CapTableUpdated(this.id.value, this.tenantId.value, this.shareholderStates, this._totalIssuedUnits.toString()));
    this.incrementVersion();
  }

  transferShares(params: TransferSharesParams): TransferLog {
    if (params.units <= 0n) throw new Error('Transfer units must be positive');
    if (params.fromShareholderId === params.toShareholderId) throw new Error('Cannot transfer to the same shareholder');
    const shareClassId = params.shareClassId ?? this._shareClassId;

    const from = this._findShareholder(params.fromShareholderId, shareClassId);
    const to = this._shareholders.find(
      (s) => s.shareholderId === params.toShareholderId && s.shareClassId === shareClassId,
    );
    if (!to) throw new Error(`Recipient ${params.toShareholderId} is not a shareholder of class ${shareClassId}`);

    from.adjustUnits(-params.units);
    to.adjustUnits(params.units);

    const transfer: TransferLog = {
      id: randomUUID(),
      fromShareholderId: params.fromShareholderId,
      toShareholderId: params.toShareholderId,
      shareClassId,
      units: params.units,
      transferType: params.transferType ?? 'manual',
      recordedAt: new Date().toISOString(),
      chainTxHash: null,
    };
    this._transferLog.push(transfer);
    this.raise(
      new TransferRecorded(
        this.id.value,
        this.tenantId.value,
        transfer.id,
        transfer.fromShareholderId,
        transfer.toShareholderId,
        transfer.shareClassId,
        transfer.units.toString(),
        transfer.transferType,
      ),
    );
    this.incrementVersion();
    return transfer;
  }

  syncFromChain(params: SyncFromChainParams): void {
    this._shareholders = [];
    for (const row of params.shareholders) {
      this._shareholders.push(
        ShareholderRecord.create({
          shareholderId: row.shareholderId,
          name: row.name,
          shareholderType: 'investor',
          walletAddress: row.walletAddress,
          shareClassId: row.shareClassId,
          unitsHeld: row.units,
        }),
      );
    }
    this._totalIssuedUnits = params.totalIssuedUnits;
    this._syncedAt = new Date().toISOString();
    this.raise(
      new CapTableSynced(this.id.value, this.tenantId.value, this._totalIssuedUnits.toString(), params.blockNumber),
    );
    this.incrementVersion();
  }

  getShareholder(shareholderId: string, shareClassId?: string): ShareholderRecord {
    const classId = shareClassId ?? this._shareClassId;
    const record = this._shareholders.find((s) => s.shareholderId === shareholderId && s.shareClassId === classId);
    if (!record) throw new Error(`Shareholder not found: ${shareholderId} (class ${classId})`);
    return record;
  }

  get shareholders(): ShareholderRecord[] {
    return [...this._shareholders];
  }

  get shareholderStates(): ShareholderRecordState[] {
    return this._shareholders.map((s) => s.toState());
  }

  get transferLog(): TransferLog[] {
    return this._transferLog.map((t) => ({ ...t }));
  }

  get totalIssuedUnits(): bigint {
    return this._totalIssuedUnits;
  }

  get issuanceId(): string | null {
    return this._issuanceId;
  }

  get shareClassId(): string {
    return this._shareClassId;
  }

  get syncedAt(): string | null {
    return this._syncedAt;
  }

  private _findShareholder(shareholderId: string, shareClassId: string): ShareholderRecord {
    const record = this._shareholders.find((s) => s.shareholderId === shareholderId && s.shareClassId === shareClassId);
    if (!record) throw new Error(`Shareholder not found: ${shareholderId} (class ${shareClassId})`);
    return record;
  }

  static reconstruct(params: {
    id: CapTableId;
    tenantId: TenantId;
    issuanceId: string | null;
    shareClassId: string;
    shareholders: ShareholderRecord[];
    transferLog: TransferLog[];
    totalIssuedUnits: bigint;
    syncedAt: string | null;
    version: number;
  }): CapTable {
    const capTable = new CapTable(
      params.id,
      params.tenantId,
      params.issuanceId,
      params.shareClassId,
      params.shareholders,
      params.transferLog,
      params.totalIssuedUnits,
      params.syncedAt,
    );
    capTable._version = params.version;
    return capTable;
  }
}