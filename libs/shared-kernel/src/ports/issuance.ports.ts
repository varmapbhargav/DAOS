// Issuance Structuring infrastructure ports.
// External-provider ports used by the issuance-studio bounded context.
import { BlockchainNetwork, IssuanceStatus, TokenStandard, TokenTransferRestriction } from '../index';

export interface BlockchainGatewayPort {
  mintTokens(params: {
    issuanceId: string;
    amount: bigint;
    toAddress: string;
    whitelist: string[];
    network: BlockchainNetwork;
  }): Promise<{ txHash: string; blockNumber: number }>;
  addToWhitelist(issuanceId: string, walletAddress: string): Promise<void>;
  removeFromWhitelist(issuanceId: string, walletAddress: string): Promise<void>;
  getBalance(issuanceId: string, address: string): Promise<bigint>;
  getTransaction(txHash: string): Promise<{ status: string; blockNumber: number }>;
}

export interface TokenStandardProvider {
  encodeTransferRestrictions(restrictions: TokenTransferRestriction[]): string;
  decodeTransferRestrictions(encoded: string): TokenTransferRestriction[];
  verifyTransfer(wallet: string, amount: bigint, restrictions: TokenTransferRestriction[]): boolean;
  supportedStandard(network: BlockchainNetwork): TokenStandard;
  issuanceStatusFor(network: BlockchainNetwork): IssuanceStatus;
}
