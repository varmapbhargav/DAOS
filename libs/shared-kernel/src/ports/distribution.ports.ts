// Distribution infrastructure ports.
// External-provider ports used by the distribution bounded context.
// Repository interfaces live in-app (see apps/distribution/src/domain/repositories).
import { Money } from '../index';

export interface PaymentGatewayPort {
  initiatePayment(
    investorId: string,
    amount: Money,
    reference: string,
  ): Promise<{ status: string; paymentRef: string }>;
  getPaymentStatus(paymentRef: string): Promise<{ status: string; amount: Money }>;
  refund(paymentRef: string, reason: string): Promise<void>;
}

export interface EscrowProvider {
  createAccount(tenantId: string): Promise<{ accountId: string; accountRef: string }>;
  fund(accountId: string, amount: Money): Promise<void>;
  release(accountId: string, toAddress: string, amount: Money): Promise<void>;
  getBalance(accountId: string): Promise<Money>;
}