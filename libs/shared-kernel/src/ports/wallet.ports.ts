// Wallet & Custody ports
export interface WalletRepository {
  save(wallet: Wallet): Promise<void>;
  findById(id: string): Promise<Wallet | null>;
  listByInvestor(investorId: string): Promise<Wallet[]>;
}

export interface TransactionRelayRepository {
  save(relay: TransactionRelay): Promise<void>;
  findById(id: string): Promise<TransactionRelay | null>;
  listByWallet(walletId: string): Promise<TransactionRelay[]>;
}

export interface CustodyAccountRepository {
  save(account: CustodyAccount): Promise<void>;
  findById(id: string): Promise<CustodyAccount | null>;
  listByInvestor(investorId: string): Promise<CustodyAccount[]>;
}

export interface MpcProviderPort {
  signTransaction(
    walletId: string,
    txHash: string,
    shards: Record<string, string>,
  ): Promise<{ signedTx: string }>;
  getWalletStatus(walletId: string): Promise<{ status: string; address: string }>;
}

export interface HsmPort {
  generateKeyPair(keyId: string): Promise<{ publicKey: string; keyRef: string }>;
  sign(message: string, keyRef: string): Promise<{ signature: string }>;
  encrypt(data: string, keyRef: string): Promise<{ encrypted: string }>;
}

export interface BlockchainNodePort {
  sendRawTransaction(tx: string): Promise<{ txHash: string }>;
  getBalance(address: string): Promise<bigint>;
  getTransactionReceipt(txHash: string): Promise<{ status: string; blockNumber: number }>;
}
