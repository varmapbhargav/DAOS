import { EscrowProvider, Money } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

/**
 * Stub escrow provider used in non-production environments.
 * Accounts do not hold real balances; operations are no-ops.
 */
@Injectable()
export class StubEscrowProviderAdapter implements EscrowProvider {
  async createAccount(tenantId: string): Promise<{ accountId: string; accountRef: string }> {
    void tenantId;
    return { accountId: `esc-${randomUUID()}`, accountRef: `escrow-ref-${randomUUID()}` };
  }

  async fund(accountId: string, amount: Money): Promise<void> {
    void accountId;
    void amount;
    return;
  }

  async release(accountId: string, toAddress: string, amount: Money): Promise<void> {
    void accountId;
    void toAddress;
    void amount;
    return;
  }

  async getBalance(accountId: string): Promise<Money> {
    void accountId;
    return Money.zero('USD');
  }
}
