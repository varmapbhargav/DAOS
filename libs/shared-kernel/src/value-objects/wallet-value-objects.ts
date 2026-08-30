// Wallet & Custody Value Objects
export type WalletType = 'selfCustody' | 'mpcManaged' | 'multiSig' | 'qualifiedCustodian';

export type WalletStatus = 'provisioning' | 'active' | 'frozen' | 'deprovisioned';

export type WalletPolicy = {
  tier: 'cold' | 'warm' | 'hot';
  signaturesRequired: number;
  dailyLimitUSD: Money;
};

export type RelayType = 'standard' | 'metaTransaction' | 'gasAbstracted';

export type RelayStatus = 'pending' | 'submitted' | 'confirmed' | 'failed';

export type CustodyType = 'omnibus' | 'segregated' | 'selfCustody' | 'qualifiedCustodian';

export type Holding = {
  issuanceId: string;
  quantity: number;
  lockedQuantity: number;
};
