import { Money } from '../index';

export interface BillingProviderPort {
  createPaymentMethod(token: string): Promise<{ last4: string; expiry: string }>;
  createInvoice(tenantId: string, amount: Money, description: string): Promise<{ invoiceId: string; dueDate: string }>;
  recordCharge(tenantId: string, amount: Money, description: string): Promise<{ chargeId: string }>;
}
