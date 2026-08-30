import { BlockchainSettlementPort, Money } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StubBlockchainSettlementAdapter implements BlockchainSettlementPort {
  async settleTrade(
    tradeReference: string,
    fromAccount: string,
    toAccount: string,
    quantity: bigint,
  ): Promise<{ txHash: string; status: string }> {
    void fromAccount;
    void toAccount;
    void quantity;
    return { txHash: `0x${tradeReference}-${Date.now()}`, status: 'settled' };
  }

  async getTradeStatus(txHash: string): Promise<{ status: string }> {
    void txHash;
    return { status: 'settled' };
  }

  async settleCash(tradeReference: string, amount: Money, toAddress: string): Promise<{ txHash: string; status: string }> {
    void amount;
    void toAddress;
    return { txHash: `0x${tradeReference}-cash-${Date.now()}`, status: 'settled' };
  }
}
