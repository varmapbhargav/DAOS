import { Money, PaymentGatewayPort } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

/**
 * Stub payment gateway used in non-production environments.
 * Does not contact a real PSP; always approves the payment.
 */
@Injectable()
export class StubPaymentGatewayAdapter implements PaymentGatewayPort {
  async initiatePayment(
    investorId: string,
    amount: Money,
    reference: string,
  ): Promise<{ status: string; paymentRef: string }> {
    void investorId;
    void amount;
    void reference;
    return { status: 'approved', paymentRef: `pgw-${randomUUID()}` };
  }

  async getPaymentStatus(paymentRef: string): Promise<{ status: string; amount: Money }> {
    throw new Error(`Payment status lookup not implemented for stub gateway: ${paymentRef}`);
  }

  async refund(paymentRef: string, reason: string): Promise<void> {
    void paymentRef;
    void reason;
    return;
  }
}
