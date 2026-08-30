import { Money, ValuationAgentPort } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StubValuationAgent implements ValuationAgentPort {
  private readonly reports: Record<string, Money> = {};

  async initiateValuation(assetId: string): Promise<{ reportId: string }> {
    const reportId = `report-${assetId}-${Date.now()}`;
    this.reports[reportId] = Money.of(1_200_000n, 'USD');
    return { reportId };
  }

  async getValuationReport(reportId: string): Promise<{ amount: Money; status: string }> {
    const amount = this.reports[reportId] ?? Money.of(1_200_000n, 'USD');
    return { amount, status: 'ready' };
  }
}
