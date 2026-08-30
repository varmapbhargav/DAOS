// Valuation Engine infrastructure port.
// The concrete valuation adapter lives behind this port in the
// asset-origination bounded context's infrastructure layer.
export interface ValuationInput {
  assetId: string;
  cashFlows: {
    period: number;
    amount: string; // ISO currency amount
    currency: string;
  }[];
  discountRatePercent: number;
  methodology: string;
}

export interface ValuationResult {
  fairValueMinorUnits: string;
  currency: string;
  methodology: string;
  terminalValueMinorUnits: string | null;
  confidenceHigh: string;
  confidenceLow: string;
}

export interface ValuationEnginePort {
  value(input: ValuationInput): Promise<ValuationResult>;
}
