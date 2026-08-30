import { BillingProviderPort, Money } from '@daos/shared-kernel';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class StubBillingProvider implements BillingProviderPort {
  private readonly logger = new Logger(StubBillingProvider.name);

  async createPaymentMethod(token: string): Promise<{ last4: string; expiry: string }> {
    const last4 = token.slice(-4);
    const year = String(new Date().getFullYear() + 3).slice(-2);
    this.logger.log(`[billing-stub] payment method tokenized: ****${last4} exp 12/${year}`);
    return { last4, expiry: `12/${year}` };
  }

  async createInvoice(tenantId: string, amount: Money, description: string): Promise<{ invoiceId: string; dueDate: string }> {
    const invoiceId = `inv_${Math.random().toString(36).slice(2, 10)}`;
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    this.logger.log(`[billing-stub] invoice ${invoiceId} for ${tenantId}: ${amount.amount} ${amount.currency} (${description})`);
    return { invoiceId, dueDate };
  }

  async recordCharge(tenantId: string, amount: Money, description: string): Promise<{ chargeId: string }> {
    const chargeId = `ch_${Math.random().toString(36).slice(2, 10)}`;
    this.logger.log(`[billing-stub] charge ${chargeId} for ${tenantId}: ${amount.amount} ${amount.currency} (${description})`);
    return { chargeId };
  }
}
