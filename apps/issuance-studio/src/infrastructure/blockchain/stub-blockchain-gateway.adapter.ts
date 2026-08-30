import { BlockchainGatewayPort, BlockchainNetwork } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StubBlockchainGatewayAdapter implements BlockchainGatewayPort {
  async mintTokens(params: {
    issuanceId: string;
    amount: bigint;
    toAddress: string;
    whitelist: string[];
    network: BlockchainNetwork;
  }): Promise<{ txHash: string; blockNumber: number }> {
    const txHash = `0x${(Date.now() + Math.floor(Math.random() * 100000)).toString(16)}mint`;
    return { txHash, blockNumber: Math.floor(Math.random() * 1_000_000) };
  }

  async addToWhitelist(issuanceId: string, walletAddress: string): Promise<void> {
    void issuanceId;
    void walletAddress;
  }

  async removeFromWhitelist(issuanceId: string, walletAddress: string): Promise<void> {
    void issuanceId;
    void walletAddress;
  }

  async getBalance(issuanceId: string, address: string): Promise<bigint> {
    void issuanceId;
    void address;
    return 0n;
  }

  async getTransaction(txHash: string): Promise<{ status: string; blockNumber: number }> {
    void txHash;
    return { status: 'confirmed', blockNumber: 1 };
  }
}