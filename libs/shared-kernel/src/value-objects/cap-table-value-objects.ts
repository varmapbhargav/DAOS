// Cap Table Value Objects
export type ShareholderType = 'investor' | 'sponsor' | 'founder' | 'employee' | 'other';

export type ShareholderRecordState = {
  shareholderId: string;
  name: string;
  shareholderType: ShareholderType;
  walletAddress: string | null;
  shareClassId: string;
  unitsHeld: bigint;
  votes: number;
};

export type TransferLog = {
  id: string;
  fromShareholderId: string;
  toShareholderId: string;
  shareClassId: string;
  units: bigint;
  transferType: string;
  recordedAt: string;
  chainTxHash: string | null;
};
