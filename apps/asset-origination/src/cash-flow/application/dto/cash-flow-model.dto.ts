export class CreateCashFlowModelDto {
  name!: string;
  termPeriods!: number;
  discountRatePercent!: number;
  cashFlows?: Array<{
    period: number;
    amountMinorUnits: string;
    currency: string;
  }>;
}

export class UpdateCashFlowModelDto {
  name?: string;
  termPeriods?: number;
  discountRatePercent?: number;
}

export class AddCashFlowDto {
  period!: number;
  amountMinorUnits!: string;
  currency!: string;
}

export class SetDiscountRateDto {
  discountRatePercent!: number;
}
