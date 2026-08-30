// Pricing & Valuation external-provider ports.
// Repository interfaces live in-app (see apps/pricing-valuation/src/domain/repositories).
import { Money } from '../index';
import { ValuationModelType } from '../value-objects/pricing-value-objects';

export interface PricingVendorPort {
  getRealtimePrice(isin: string): Promise<{ price: Money; source: string }>;
  getHistoricalPrices(
    isin: string,
    startDate: string,
    endDate: string,
  ): Promise<{ date: string; price: Money }[]>;
}

export interface ValuationAgentPort {
  initiateValuation(assetId: string, methodology: ValuationModelType): Promise<{ reportId: string }>;
  getValuationReport(reportId: string): Promise<{ amount: Money; status: string }>;
}
