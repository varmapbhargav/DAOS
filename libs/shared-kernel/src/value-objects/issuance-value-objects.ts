// Issuance Value Objects
export type InstrumentType =
  | 'commonEquity'
  | 'preferredEquity'
  | 'REITShare'
  | 'LPInterest'
  | 'debtToken'
  | 'convertibleNote'
  | 'revenueShareToken'
  | 'fundUnit';

export type TokenStandard = 'ERC1400' | 'ERC3643' | 'ERC20Restricted' | 'nativeChain' | 'hyperledger';

export type BlockchainNetwork = 'ethereum' | 'polygon' | 'avalanche' | 'hyperledger' | 'stellar';

export type IssuanceStatus =
  | 'draft'
  | 'legalDocsSigned'
  | 'entityFormed'
  | 'mintPending'
  | 'minted'
  | 'whitelistOpen'
  | 'distributing'
  | 'complete';

export type MintStatus = 'pending' | 'submitted' | 'confirmed' | 'failed';

export type WhitelistEntry = {
  walletAddress: string;
  investorId: string;
  addedAt: string;
};

export type TokenTransferRestriction = {
  restrictionType: string;
  holdingPeriodDays: number;
  jurisdictionBlock: string;
};
