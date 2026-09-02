import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TargetReturnProfileDto {
  @ApiProperty({ example: 18 })
  @IsNumber()
  targetIrrPercent!: number;

  @ApiProperty({ example: 1.8 })
  @IsNumber()
  targetMultiple!: number;

  @ApiProperty({ example: 36 })
  @IsNumber()
  expectedHoldPeriodMonths!: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  upsidePotentialPercent!: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  downsideRiskPercent!: number;
}

export class SensitivityFactorDto {
  @ApiProperty({ example: 'rentGrowth' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 3 })
  @IsNumber()
  baseValue!: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  p10!: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  p90!: number;
}

export class EngineerOpportunityDto {
  @ApiProperty({ example: 'asset-uuid' })
  @IsString()
  assetId!: string;

  @ApiProperty({ example: 'Aurora Logistics Opportunity' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: 'Investment opportunity in logistics asset' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'sponsor-uuid' })
  @IsString()
  sponsorId!: string;

  @ApiPropertyOptional({ type: TargetReturnProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TargetReturnProfileDto)
  targetReturn?: TargetReturnProfileDto;

  @ApiPropertyOptional({ type: [SensitivityFactorDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SensitivityFactorDto)
  sensitivityFactors?: SensitivityFactorDto[];
}

export class AddScenarioDto {
  @ApiProperty({ example: 'Bull case' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: ['base', 'bull', 'bear', 'stress', 'conservative', 'aggressive'] })
  @IsString()
  scenarioType!: string;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  holdPeriodMonths?: number;
}

export class AssumptionDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsNumber()
  value!: number;

  @ApiProperty()
  @IsString()
  unit!: string;

  @ApiProperty()
  @IsString()
  currency!: string;

  @ApiProperty()
  @IsString()
  period!: string;

  @ApiProperty()
  @IsString()
  source!: string;

  @ApiProperty()
  @IsString()
  sourceDate!: string;

  @ApiProperty()
  @IsNumber()
  confidence!: number;

  @ApiProperty()
  @IsString()
  scenarioId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  min?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  max?: number;

  @ApiPropertyOptional({ enum: ['normal', 'lognormal', 'uniform', 'triangular', 'beta', 'custom'] })
  @IsOptional()
  @IsString()
  distribution?: 'normal' | 'lognormal' | 'uniform' | 'triangular' | 'beta' | 'custom';

  @ApiProperty()
  @IsBoolean()
  overridden!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  overrideReason?: string;

  @ApiProperty()
  @IsNumber()
  version!: number;
}

export class AcquisitionAssumptionsDto {
  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  purchasePrice!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  acquisitionCosts!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  closingCosts!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  initialCapex!: AssumptionDto;
}

export class FinancingAssumptionsDto {
  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  loanAmount!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  interestRate!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  loanTermMonths!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  amortizationMonths!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  ltv!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  originationFee!: AssumptionDto;
}

export class OperatingAssumptionsDto {
  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  revenueGrowthRate!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  occupancyRate!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  operatingExpenseRatio!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  maintenanceCapexPerUnit!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  inflationRate!: AssumptionDto;
}

export class RevenueStreamAssumptionDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty({ enum: ['rental', 'interest', 'subscription', 'transaction_fee', 'royalty', 'energy', 'service', 'other'] })
  @IsString()
  type!: 'rental' | 'interest' | 'subscription' | 'transaction_fee' | 'royalty' | 'energy' | 'service' | 'other';

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  volume!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  unit!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  price!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  growthRate!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  escalationRate!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  occupancyRate!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  utilizationRate!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  seasonalityFactor!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  startDate!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  endDate!: AssumptionDto;
}

export class RevenueAssumptionsDto {
  @ApiProperty({ type: [RevenueStreamAssumptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RevenueStreamAssumptionDto)
  streams!: RevenueStreamAssumptionDto[];
}

export class ExpenseLineAssumptionDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  category!: string;

  @ApiProperty({ enum: ['fixed', 'variable', 'semi_variable'] })
  @IsString()
  fixedVariable!: 'fixed' | 'variable' | 'semi_variable';

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  amount!: AssumptionDto;

  @ApiPropertyOptional({ type: AssumptionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AssumptionDto)
  percentageOfRevenue?: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  growthRate!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  inflationRate!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  perUnit!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  period!: AssumptionDto;
}

export class ExpenseAssumptionsDto {
  @ApiProperty({ type: [ExpenseLineAssumptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseLineAssumptionDto)
  lines!: ExpenseLineAssumptionDto[];
}

export class ExitAssumptionsDto {
  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  exitDate!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  exitValuationMethod!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  exitMultiple!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  exitCapRate!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  exitCosts!: AssumptionDto;
}

export class RiskAssumptionsDto {
  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  marketVolatility!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  assetVolatility!: AssumptionDto;

  @ApiProperty({ type: AssumptionDto })
  @ValidateNested()
  @Type(() => AssumptionDto)
  correlationMatrix!: AssumptionDto;
}

export class AssumptionSetDto {
  @ApiProperty({ type: AcquisitionAssumptionsDto })
  @ValidateNested()
  @Type(() => AcquisitionAssumptionsDto)
  acquisition!: AcquisitionAssumptionsDto;

  @ApiProperty({ type: FinancingAssumptionsDto })
  @ValidateNested()
  @Type(() => FinancingAssumptionsDto)
  financing!: FinancingAssumptionsDto;

  @ApiProperty({ type: OperatingAssumptionsDto })
  @ValidateNested()
  @Type(() => OperatingAssumptionsDto)
  operating!: OperatingAssumptionsDto;

  @ApiProperty({ type: RevenueAssumptionsDto })
  @ValidateNested()
  @Type(() => RevenueAssumptionsDto)
  revenue!: RevenueAssumptionsDto;

  @ApiProperty({ type: ExpenseAssumptionsDto })
  @ValidateNested()
  @Type(() => ExpenseAssumptionsDto)
  expense!: ExpenseAssumptionsDto;

  @ApiProperty({ type: ExitAssumptionsDto })
  @ValidateNested()
  @Type(() => ExitAssumptionsDto)
  exit!: ExitAssumptionsDto;

  @ApiProperty({ type: RiskAssumptionsDto })
  @ValidateNested()
  @Type(() => RiskAssumptionsDto)
  risk!: RiskAssumptionsDto;
}

export class SetScenarioAssumptionsDto {
  @ApiProperty({ type: AssumptionSetDto })
  @ValidateNested()
  @Type(() => AssumptionSetDto)
  assumptions!: AssumptionSetDto;
}

export class AssumptionDistributionDto {
  @ApiProperty()
  @IsString()
  assumptionCode!: string;

  @ApiProperty({ enum: ['normal', 'lognormal', 'uniform', 'triangular', 'beta', 'custom'] })
  @IsString()
  distribution!: 'normal' | 'lognormal' | 'uniform' | 'triangular' | 'beta' | 'custom';

  @ApiProperty()
  @IsNumber()
  mean!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stdDev?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  min?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  max?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mode?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  alpha?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  beta?: number;
}

export class MonteCarloConfigDto {
  @ApiProperty({ example: 2000 })
  @IsNumber()
  iterations!: number;

  @ApiProperty({ type: [AssumptionDistributionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssumptionDistributionDto)
  distributions!: AssumptionDistributionDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  seed?: number;
}

export class RunMonteCarloDto {
  @ApiProperty({ type: MonteCarloConfigDto })
  @ValidateNested()
  @Type(() => MonteCarloConfigDto)
  config!: MonteCarloConfigDto;
}

export class ExitStrategyDto {
  @ApiProperty({ enum: ['sale', 'refinancing', 'ipo', 'secondary_sale', 'redemption', 'maturity', 'recapitalization'] })
  @IsString()
  type!: 'sale' | 'refinancing' | 'ipo' | 'secondary_sale' | 'redemption' | 'maturity' | 'recapitalization';

  @ApiProperty()
  @IsString()
  targetDate!: string;

  @ApiProperty()
  @IsNumber()
  targetValue!: number;

  @ApiProperty({ type: Object })
  @IsObject()
  assumptions!: Record<string, unknown>;

  @ApiProperty()
  @IsNumber()
  probability!: number;
}

export class InvestmentThesisDto {
  @ApiProperty()
  @IsString()
  thesisStatement!: string;

  @ApiProperty()
  @IsString()
  executiveSummary!: string;

  @ApiProperty()
  @IsString()
  investmentRationale!: string;

  @ApiProperty()
  @IsString()
  marketOpportunity!: string;

  @ApiProperty()
  @IsString()
  assetRationale!: string;

  @ApiProperty()
  @IsString()
  problem!: string;

  @ApiProperty()
  @IsString()
  solution!: string;

  @ApiProperty()
  @IsString()
  competitiveAdvantage!: string;

  @ApiProperty()
  @IsString()
  valueCreationThesis!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  keyCatalysts!: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  keyRisks!: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  riskMitigation!: string[];

  @ApiProperty()
  @IsNumber()
  investmentHorizonMonths!: number;

  @ApiProperty()
  @IsString()
  entryThesis!: string;

  @ApiProperty({ type: ExitStrategyDto })
  @ValidateNested()
  @Type(() => ExitStrategyDto)
  exitStrategy!: ExitStrategyDto;

  @ApiProperty()
  @IsNumber()
  expectedReturn!: number;

  @ApiProperty()
  @IsNumber()
  targetYield!: number;

  @ApiProperty()
  @IsNumber()
  confidenceScore!: number;
}

export class StrategyConstraintDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty({ enum: ['max_leverage', 'min_irr', 'min_moic', 'max_hold_period', 'max_downside', 'min_liquidity', 'jurisdiction_restriction', 'investment_amount', 'risk_tolerance'] })
  @IsString()
  type!: 'max_leverage' | 'min_irr' | 'min_moic' | 'max_hold_period' | 'max_downside' | 'min_liquidity' | 'jurisdiction_restriction' | 'investment_amount' | 'risk_tolerance';

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsNumber()
  value!: number;

  @ApiProperty()
  @IsString()
  unit!: string;

  @ApiProperty()
  @IsString()
  description!: string;
}

export class StrategyEntryDto {
  @ApiProperty()
  @IsString()
  approach!: string;

  @ApiProperty()
  @IsNumber()
  targetPrice!: number;

  @ApiProperty()
  @IsString()
  timing!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  conditions!: string[];
}

export class StrategyOperatingDto {
  @ApiProperty()
  @IsString()
  valueCreationPlan!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  operationalImprovements!: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  managementChanges!: string[];

  @ApiProperty()
  @IsNumber()
  capexPlan!: number;
}

export class StrategyFinancingDto {
  @ApiProperty()
  @IsString()
  structure!: string;

  @ApiProperty()
  @IsNumber()
  leverageTarget!: number;

  @ApiProperty()
  @IsString()
  debtType!: string;

  @ApiProperty()
  @IsString()
  equityStructure!: string;

  @ApiProperty()
  @IsNumber()
  preferredReturn!: number;
}

export class StrategyValueCreationDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  drivers!: string[];

  @ApiProperty()
  @IsNumber()
  expectedUplift!: number;

  @ApiProperty()
  @IsNumber()
  timelineMonths!: number;

  @ApiProperty()
  @IsNumber()
  investmentRequired!: number;
}

export class StrategyExitDto {
  @ApiProperty({ enum: ['sale', 'refinancing', 'ipo', 'secondary_sale', 'recapitalization'] })
  @IsString()
  type!: 'sale' | 'refinancing' | 'ipo' | 'secondary_sale' | 'recapitalization';

  @ApiProperty()
  @IsString()
  targetTiming!: string;

  @ApiProperty()
  @IsNumber()
  targetMultiple!: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  conditions!: string[];
}

export class TargetReturnsDto {
  @ApiProperty()
  @IsNumber()
  targetIrr!: number;

  @ApiProperty()
  @IsNumber()
  targetMoic!: number;

  @ApiProperty()
  @IsNumber()
  targetCashYield!: number;
}

export class InvestmentStrategyDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ enum: ['buy_and_hold', 'value_add', 'development', 'redevelopment', 'turnaround', 'income', 'growth', 'refinancing', 'arbitrage', 'structured_financing'] })
  @IsString()
  strategyType!: 'buy_and_hold' | 'value_add' | 'development' | 'redevelopment' | 'turnaround' | 'income' | 'growth' | 'refinancing' | 'arbitrage' | 'structured_financing';

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty({ type: StrategyEntryDto })
  @ValidateNested()
  @Type(() => StrategyEntryDto)
  entry!: StrategyEntryDto;

  @ApiProperty({ type: StrategyOperatingDto })
  @ValidateNested()
  @Type(() => StrategyOperatingDto)
  operating!: StrategyOperatingDto;

  @ApiProperty({ type: StrategyFinancingDto })
  @ValidateNested()
  @Type(() => StrategyFinancingDto)
  financing!: StrategyFinancingDto;

  @ApiProperty({ type: StrategyValueCreationDto })
  @ValidateNested()
  @Type(() => StrategyValueCreationDto)
  valueCreation!: StrategyValueCreationDto;

  @ApiProperty({ type: StrategyExitDto })
  @ValidateNested()
  @Type(() => StrategyExitDto)
  exit!: StrategyExitDto;

  @ApiProperty()
  @IsNumber()
  investmentHorizonMonths!: number;

  @ApiProperty({ type: [StrategyConstraintDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StrategyConstraintDto)
  constraints!: StrategyConstraintDto[];

  @ApiProperty({ type: TargetReturnsDto })
  @ValidateNested()
  @Type(() => TargetReturnsDto)
  targetReturns!: TargetReturnsDto;

  @ApiProperty()
  @IsNumber()
  riskTolerance!: number;
}

export class SensitivityVariableDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsNumber()
  baseValue!: number;

  @ApiProperty()
  @IsString()
  unit!: string;

  @ApiProperty()
  @IsString()
  currency!: string;

  @ApiProperty()
  @IsNumber()
  minValue!: number;

  @ApiProperty()
  @IsNumber()
  maxValue!: number;

  @ApiProperty()
  @IsNumber()
  steps!: number;
}

export class SensitivityPointDto {
  @ApiProperty()
  @IsNumber()
  value!: number;

  @ApiProperty()
  @IsNumber()
  irr!: number;

  @ApiProperty()
  @IsNumber()
  moic!: number;

  @ApiProperty()
  @IsNumber()
  npv!: number;
}

export class SensitivityResultDto {
  @ApiProperty()
  @IsString()
  variableCode!: string;

  @ApiProperty()
  @IsString()
  variableName!: string;

  @ApiProperty()
  @IsNumber()
  baseValue!: number;

  @ApiProperty({ type: [SensitivityPointDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SensitivityPointDto)
  results!: SensitivityPointDto[];

  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  irrImpact!: number[];

  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  moicImpact!: number[];

  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  npvImpact!: number[];
}

export class TwoVariableSensitivityResultDto {
  @ApiProperty({ type: SensitivityVariableDto })
  @ValidateNested()
  @Type(() => SensitivityVariableDto)
  xVariable!: SensitivityVariableDto;

  @ApiProperty({ type: SensitivityVariableDto })
  @ValidateNested()
  @Type(() => SensitivityVariableDto)
  yVariable!: SensitivityVariableDto;

  @ApiProperty()
  @IsArray()
  matrix!: any[][];
}

export class SensitivityAnalysisDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  scenarioId!: string;

  @ApiProperty()
  @IsString()
  opportunityId!: string;

  @ApiProperty({ type: [SensitivityVariableDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SensitivityVariableDto)
  variables!: SensitivityVariableDto[];

  @ApiProperty({ type: [SensitivityResultDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SensitivityResultDto)
  singleVariableResults!: SensitivityResultDto[];

  @ApiProperty({ type: [TwoVariableSensitivityResultDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TwoVariableSensitivityResultDto)
  twoVariableResults!: TwoVariableSensitivityResultDto[];

  @ApiProperty()
  @IsString()
  calculatedAt!: string;

  @ApiProperty()
  @IsString()
  calculatedBy!: string;

  @ApiProperty()
  @IsString()
  modelVersion!: string;
}

export class DimensionScoreDto {
  @ApiProperty()
  @IsString()
  dimension!: string;

  @ApiProperty()
  @IsNumber()
  score!: number;

  @ApiProperty()
  @IsNumber()
  weight!: number;

  @ApiProperty()
  @IsNumber()
  weightedScore!: number;

  @ApiProperty()
  @IsString()
  rationale!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  evidence!: string[];
}

export class OpportunityScoreDto {
  @ApiProperty()
  @IsNumber()
  overall!: number;

  @ApiProperty({ type: [DimensionScoreDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DimensionScoreDto)
  dimensions!: DimensionScoreDto[];

  @ApiProperty()
  @IsString()
  scoringModelVersion!: string;

  @ApiProperty()
  @IsString()
  calculatedAt!: string;

  @ApiProperty()
  @IsString()
  calculatedBy!: string;
}