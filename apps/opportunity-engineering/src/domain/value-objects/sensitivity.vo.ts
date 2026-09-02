import { Decimal, Percentage } from './decimal.vo';

export type SensitivityVariable = {
  id: string;
  code: string;
  name: string;
  baseValue: Decimal;
  unit: string;
  currency: string;
  minValue: Decimal;
  maxValue: Decimal;
  steps: number;
};

export type SensitivityResult = {
  variableCode: string;
  variableName: string;
  baseValue: Decimal;
  results: SensitivityPoint[];
  irrImpact: Percentage[];
  moicImpact: Decimal[];
  npvImpact: Decimal[];
};

export type SensitivityPoint = {
  value: Decimal;
  irr: Percentage;
  moic: Decimal;
  npv: Decimal;
};

export type TwoVariableSensitivityResult = {
  xVariable: SensitivityVariable;
  yVariable: SensitivityVariable;
  matrix: SensitivityMatrixCell[][];
};

export type SensitivityMatrixCell = {
  xValue: Decimal;
  yValue: Decimal;
  irr: Percentage;
  moic: Decimal;
  npv: Decimal;
};

export type SensitivityAnalysis = {
  id: string;
  scenarioId: string;
  opportunityId: string;
  variables: SensitivityVariable[];
  singleVariableResults: SensitivityResult[];
  twoVariableResults: TwoVariableSensitivityResult[];
  calculatedAt: Date;
  calculatedBy: string;
  modelVersion: string;
};