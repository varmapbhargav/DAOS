import { CustodianBankPort, Money } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StubCustodianBankAdapter implements CustodianBankPort {
  async acknowledgeSettlement(reference: string, settlementDate: string): Promise<{ status: string; reference: string }> {
    void settlementDate;
    return { status: 'acknowledged', reference };
  }

  async confirmSettlement(reference: string): Promise<{ status: string }> {
    void reference;
    return { status: 'confirmed' };
  }

  async failSettlement(reference: string, reason: string): Promise<{ status: string }> {
    void reference;
    void reason;
    return { status: 'failed' };
  }

  async getBalance(accountRef: string): Promise<Money> {
    void accountRef;
    return Money.of(0n, 'USD');
  }
}
