// Settlement & Clearing infrastructure ports.
// External-provider ports used by the settlement bounded context.
// Repository interfaces live in-app (see apps/settlement/src/domain/repositories).
import { Money } from '../index';

export interface CustodianBankPort {
  acknowledgeSettlement(reference: string, settlementDate: string): Promise<{ status: string; reference: string }>;
  confirmSettlement(reference: string): Promise<{ status: string }>;
  failSettlement(reference: string, reason: string): Promise<{ status: string }>;
  getBalance(accountRef: string): Promise<Money>;
}

export interface BlockchainSettlementPort {
  settleTrade(tradeReference: string, fromAccount: string, toAccount: string, quantity: bigint): Promise<{ txHash: string; status: string }>;
  getTradeStatus(txHash: string): Promise<{ status: string }>;
  settleCash(tradeReference: string, amount: Money, toAddress: string): Promise<{ txHash: string; status: string }>;
}
