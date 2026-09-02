import { Decimal, Percentage } from '../value-objects/decimal.vo';
import { AssumptionSet } from '../value-objects/assumption.vo';
import { FinancialModelEngine } from './financial-model-engine';
import { 
  SensitivityVariable, 
  SensitivityResult, 
  SensitivityPoint, 
  TwoVariableSensitivityResult, 
  SensitivityMatrixCell,
  SensitivityAnalysis 
} from '../value-objects/sensitivity.vo';

export class SensitivityEngine {
  private financialModelEngine: FinancialModelEngine;

  constructor() {
    this.financialModelEngine = new FinancialModelEngine();
  }

  async analyze(
    baseAssumptions: AssumptionSet,
    variables: SensitivityVariable[],
    holdPeriodMonths: number,
    opportunityId: string,
    scenarioId: string,
    calculatedBy: string,
  ): Promise<SensitivityAnalysis> {
    const singleVariableResults = await this.runSingleVariableSensitivity(
      baseAssumptions,
      variables,
      holdPeriodMonths,
    );

    const twoVariableResults = await this.runTwoVariableSensitivity(
      baseAssumptions,
      variables,
      holdPeriodMonths,
    );

    return {
      id: `sens_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      scenarioId,
      opportunityId,
      variables,
      singleVariableResults,
      twoVariableResults,
      calculatedAt: new Date(),
      calculatedBy,
      modelVersion: '1.0.0',
    };
  }

  private async runSingleVariableSensitivity(
    baseAssumptions: AssumptionSet,
    variables: SensitivityVariable[],
    holdPeriodMonths: number,
  ): Promise<SensitivityResult[]> {
    const results: SensitivityResult[] = [];

    for (const variable of variables) {
      const points: SensitivityPoint[] = [];
      const stepSize = variable.maxValue.toNumber() - variable.minValue.toNumber();
      const step = stepSize / variable.steps;

      for (let i = 0; i <= variable.steps; i++) {
        const value = new Decimal(variable.minValue.toNumber() + i * step);
        const modifiedAssumptions = this.applyVariableValue(baseAssumptions, variable.code, value);
        const result = this.financialModelEngine.calculate(modifiedAssumptions, holdPeriodMonths, '', '', 'sensitivity');
        const model = result.model;

        points.push({
          value,
          irr: model.returnMetrics.irrPercent,
          moic: model.returnMetrics.grossMoic,
          npv: model.returnMetrics.npv.getAmount(),
        });
      }

      const irrImpact = points.map(p => p.irr);
      const moicImpact = points.map(p => p.moic);
      const npvImpact = points.map(p => p.npv);

      results.push({
        variableCode: variable.code,
        variableName: variable.name,
        baseValue: variable.baseValue,
        results: points,
        irrImpact,
        moicImpact,
        npvImpact,
      });
    }

    return results;
  }

  private async runTwoVariableSensitivity(
    baseAssumptions: AssumptionSet,
    variables: SensitivityVariable[],
    holdPeriodMonths: number,
  ): Promise<TwoVariableSensitivityResult[]> {
    const results: TwoVariableSensitivityResult[] = [];

    for (let i = 0; i < variables.length; i++) {
      for (let j = i + 1; j < variables.length; j++) {
        const xVar = variables[i];
        const yVar = variables[j];

        const matrix: SensitivityMatrixCell[][] = [];

        for (let xi = 0; xi <= xVar.steps; xi++) {
          const xValue = new Decimal(xVar.minValue.toNumber() + (xi * (xVar.maxValue.toNumber() - xVar.minValue.toNumber()) / xVar.steps));
          const row: SensitivityMatrixCell[] = [];

          for (let yi = 0; yi <= yVar.steps; yi++) {
            const yValue = new Decimal(yVar.minValue.toNumber() + (yi * (yVar.maxValue.toNumber() - yVar.minValue.toNumber()) / yVar.steps));
            
            const modifiedAssumptions = this.applyTwoVariableValues(baseAssumptions, xVar.code, xValue, yVar.code, yValue);
            const result = this.financialModelEngine.calculate(modifiedAssumptions, holdPeriodMonths, '', '', 'sensitivity');
            const model = result.model;

            row.push({
              xValue,
              yValue,
              irr: model.returnMetrics.irrPercent,
              moic: model.returnMetrics.grossMoic,
              npv: model.returnMetrics.npv.getAmount(),
            });
          }

          matrix.push(row);
        }

        results.push({
          xVariable: xVar,
          yVariable: yVar,
          matrix,
        });
      }
    }

    return results;
  }

  private applyVariableValue(assumptions: AssumptionSet, variableCode: string, value: Decimal): AssumptionSet {
    const cloned = JSON.parse(JSON.stringify(assumptions)) as AssumptionSet;

    const applyValue = (assumption: any, code: string): any => {
      if (assumption.code === code || code.includes(assumption.code)) {
        return { ...assumption, value };
      }
      return assumption;
    };

    cloned.acquisition = {
      purchasePrice: applyValue(cloned.acquisition.purchasePrice, variableCode),
      acquisitionCosts: applyValue(cloned.acquisition.acquisitionCosts, variableCode),
      closingCosts: applyValue(cloned.acquisition.closingCosts, variableCode),
      initialCapex: applyValue(cloned.acquisition.initialCapex, variableCode),
    };

    cloned.financing = {
      loanAmount: applyValue(cloned.financing.loanAmount, variableCode),
      interestRate: applyValue(cloned.financing.interestRate, variableCode),
      loanTermMonths: applyValue(cloned.financing.loanTermMonths, variableCode),
      amortizationMonths: applyValue(cloned.financing.amortizationMonths, variableCode),
      ltv: applyValue(cloned.financing.ltv, variableCode),
      originationFee: applyValue(cloned.financing.originationFee, variableCode),
    };

    cloned.operating = {
      revenueGrowthRate: applyValue(cloned.operating.revenueGrowthRate, variableCode),
      occupancyRate: applyValue(cloned.operating.occupancyRate, variableCode),
      operatingExpenseRatio: applyValue(cloned.operating.operatingExpenseRatio, variableCode),
      maintenanceCapexPerUnit: applyValue(cloned.operating.maintenanceCapexPerUnit, variableCode),
      inflationRate: applyValue(cloned.operating.inflationRate, variableCode),
    };

    cloned.revenue = {
      streams: cloned.revenue.streams.map(stream => ({
        ...stream,
        volume: applyValue(stream.volume, variableCode),
        price: applyValue(stream.price, variableCode),
        growthRate: applyValue(stream.growthRate, variableCode),
        escalationRate: applyValue(stream.escalationRate, variableCode),
        occupancyRate: applyValue(stream.occupancyRate, variableCode),
        utilizationRate: applyValue(stream.utilizationRate, variableCode),
      })),
    };

    cloned.expense = {
      lines: cloned.expense.lines.map(line => ({
        ...line,
        amount: applyValue(line.amount, variableCode),
        growthRate: applyValue(line.growthRate, variableCode),
      })),
    };

    cloned.exit = {
      exitDate: applyValue(cloned.exit.exitDate, variableCode),
      exitValuationMethod: applyValue(cloned.exit.exitValuationMethod, variableCode),
      exitMultiple: applyValue(cloned.exit.exitMultiple, variableCode),
      exitCapRate: applyValue(cloned.exit.exitCapRate, variableCode),
      exitCosts: applyValue(cloned.exit.exitCosts, variableCode),
    };

    return cloned;
  }

  private applyTwoVariableValues(
    assumptions: AssumptionSet, 
    xCode: string, xValue: Decimal, 
    yCode: string, yValue: Decimal
  ): AssumptionSet {
    let modified = this.applyVariableValue(assumptions, xCode, xValue);
    modified = this.applyVariableValue(modified, yCode, yValue);
    return modified;
  }
}