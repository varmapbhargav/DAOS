export interface ShareholderRecordOrmRow {
  id: string;
  shareholderId: string;
  name: string;
  shareholderType: string;
  walletAddress: string | null;
  shareClassId: string;
  unitsHeld: string;
  version: number;
}

export interface TransferLogOrmRow {
  id: string;
  fromShareholderId: string;
  toShareholderId: string;
  shareClassId: string;
  units: string;
  transferType: string;
  recordedAt: string;
  chainTxHash: string | null;
}