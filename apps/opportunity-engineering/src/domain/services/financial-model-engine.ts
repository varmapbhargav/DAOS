import { FinancialModel, CashFlowPeriod, ExitModel, ReturnMetrics } from '../value-objects/financial-model.vo';
import { AssumptionSet } from '../value-objects/assumption.vo';
import { CalculationResult, CalculationProvenance, CalculationInputs, CalculationOutputs } from '../value-objects/calculation-result.vo';
import { Money, Decimal, Percentage } from '../value-objects/decimal.vo';

export class FinancialModelEngine {
  calculate(
    assumptions: AssumptionSet,
    holdPeriodMonths: number,
    opportunityId: string,
    scenarioId: string,
    calculatedBy: string,
  ): { model: FinancialModel; provenance: CalculationProvenance } {
    const startTime = Date.now();
    const modelVersion = '1.0.0';
    const formulaVersion = '1.0.0';

    const periods = this.projectCashFlows(assumptions, holdPeriodMonths);
    const exitModel = this.calculateExit(assumptions, periods[periods.length - 1], holdPeriodMonths);
    const returnMetrics = this.calculateReturns(periods, exitModel, assumptions);
    const assumptionSnapshot = this.snapshotAssumptions(assumptions);

    const model: FinancialModel = {
      periods,
      exitModel,
      returnMetrics,
      modelVersion,
      calculatedAt: new Date(),
      assumptionsSnapshot: assumptionSnapshot,
    };

    const inputs: CalculationInputs = {
      assumptionSnapshot,
      modelVersion,
      formulaVersion,
      holdPeriodMonths,
      scenarioId,
      opportunityId,
    };

    const outputs: CalculationOutputs = {
      cashFlows: periods,
      returnMetrics,
      exitModel,
      warnings: [],
      errors: [],
    };

    const provenance = CalculationResult.create(
      'financial_model',
      opportunityId,
      scenarioId,
      undefined,
      modelVersion,
      formulaVersion,
      assumptionSnapshot,
      inputs,
      outputs,
      calculatedBy,
      Date.now() - startTime,
      'success',
    );

    return { model, provenance };
  }

  private projectCashFlows(assumptions: AssumptionSet, holdPeriodMonths: number): CashFlowPeriod[] {
    const periods: CashFlowPeriod[] = [];
    const startDate = new Date();

    for (let i = 1; i <= holdPeriodMonths; i++) {
      const periodDate = new Date(startDate);
      periodDate.setMonth(startDate.getMonth() + i);

      const revenue = this.calculateRevenue(assumptions, i);
      const operatingExpenses = this.calculateOperatingExpenses(assumptions, i, revenue);
      const ebitda = revenue.subtract(operatingExpenses);
      const depreciation = this.calculateDepreciation(assumptions, i);
      const ebit = ebitda.subtract(depreciation);
      const interest = this.calculateInterest(assumptions, i);
      const ebt = ebit.subtract(interest);
      const taxes = this.calculateTaxes(ebt, assumptions);
      const netIncome = ebt.subtract(taxes);
      const capex = this.calculateCapex(assumptions, i);
      const workingCapitalChange = this.calculateWorkingCapitalChange(assumptions, i);
      const freeCashFlow = netIncome.subtract(capex).subtract(workingCapitalChange);
      const { debtDrawdown, principalRepayment } = this.calculateDebtService(assumptions, i);
      const leveredCashFlow = freeCashFlow.subtract(principalRepayment).add(debtDrawdown);
      const unleveredCashFlow = freeCashFlow;

      periods.push({
        period: i,
        date: periodDate,
        revenue,
        operatingExpenses,
        ebitda,
        depreciation,
        ebit,
        interest,
        ebt,
        taxes,
        netIncome,
        capex,
        workingCapitalChange,
        freeCashFlow,
        debtDrawdown,
        principalRepayment,
        leveredCashFlow,
        unleveredCashFlow,
      });
    }

    return periods;
  }

  private calculateRevenue(assumptions: AssumptionSet, period: number): Money {
    let totalAmount = 0;
    for (const stream of assumptions.revenue.streams) {
      const baseVolume = stream.volume.value.toNumber();
      const growthRate = stream.growthRate.value.toNumber();
      const price = stream.price.value.toNumber();
      const escalationRate = stream.escalationRate.value.toNumber();
      const occupancy = stream.occupancyRate.value.toNumber();
      const utilization = stream.utilizationRate.value.toNumber();

      const volume = baseVolume * Math.pow(1 + growthRate, period - 1);
      const adjustedPrice = price * Math.pow(1 + escalationRate, period - 1);
      const revenue = volume * adjustedPrice * occupancy * utilization;
      totalAmount += revenue;
    }
    return new Money(totalAmount, 'USD');
  }

  private calculateOperatingExpenses(assumptions: AssumptionSet, period: number, revenue: Money): Money {
    let totalAmount = 0;
    for (const line of assumptions.expense.lines) {
      let amount = line.amount.value.toNumber();
      if (line.percentageOfRevenue) {
        amount += revenue.getAmount().toNumber() * line.percentageOfRevenue.value.toNumber();
      }
      const growthRate = line.growthRate.value.toNumber();
      const inflationRate = line.inflationRate.value.toNumber();
      amount = amount * Math.pow(1 + growthRate + inflationRate, period - 1);
      totalAmount += amount;
    }
    return new Money(totalAmount, 'USD');
  }

  private calculateDepreciation(assumptions: AssumptionSet, period: number): Money {
    const initialCapex = assumptions.acquisition.initialCapex.value.toNumber();
    const usefulLifeMonths = 300;
    const monthlyDepreciation = initialCapex / usefulLifeMonths;
    return new Money(monthlyDepreciation, 'USD');
  }

  private calculateInterest(assumptions: AssumptionSet, period: number): Money {
    const loanAmount = assumptions.financing.loanAmount.value.toNumber();
    const interestRate = assumptions.financing.interestRate.value.toNumber();
    const monthlyRate = interestRate / 12;
    const amortizationMonths = assumptions.financing.amortizationMonths.value.toNumber();
    const outstandingBalance = loanAmount * Math.pow(1 - 1 / amortizationMonths, period - 1);
    return new Money(outstandingBalance * monthlyRate, 'USD');
  }

  private calculateTaxes(ebt: Money, assumptions: AssumptionSet): Money {
    const taxRate = 0.21;
    const taxableIncome = Math.max(0, ebt.getAmount().toNumber());
    return new Money(taxableIncome * taxRate, 'USD');
  }

  private calculateCapex(assumptions: AssumptionSet, period: number): Money {
    const maintenanceCapex = assumptions.operating.maintenanceCapexPerUnit.value.toNumber();
    return new Money(maintenanceCapex, 'USD');
  }

  private calculateWorkingCapitalChange(assumptions: AssumptionSet, period: number): Money {
    return Money.zero('USD');
  }

  private calculateDebtService(assumptions: AssumptionSet, period: number): { debtDrawdown: Money; principalRepayment: Money } {
    const loanAmount = assumptions.financing.loanAmount.value.toNumber();
    const amortizationMonths = assumptions.financing.amortizationMonths.value.toNumber();
    const monthlyPrincipal = loanAmount / amortizationMonths;
    return {
      debtDrawdown: period === 1 ? new Money(loanAmount, 'USD') : Money.zero('USD'),
      principalRepayment: new Money(monthlyPrincipal, 'USD'),
    };
  }

  private calculateExit(assumptions: AssumptionSet, finalPeriod: CashFlowPeriod, holdPeriodMonths: number): ExitModel {
    const exitMultiple = assumptions.exit.exitMultiple.value.toNumber();
    const exitCapRate = assumptions.exit.exitCapRate.value.toNumber();
    const exitCosts = assumptions.exit.exitCosts.value.toNumber();

    const exitValue = finalPeriod.ebitda.multiply(exitMultiple);
    const netExitProceeds = exitValue.subtract(new Money(exitCosts, 'USD'));

    return {
      exitDate: new Date(Date.now() + holdPeriodMonths * 30 * 24 * 60 * 60 * 1000),
      exitValue,
      netExitProceeds,
      exitMultiple: new Decimal(exitMultiple),
      exitCapRate: Percentage.fromNumber(exitCapRate),
    };
  }

  private calculateReturns(periods: CashFlowPeriod[], exitModel: ExitModel, assumptions: AssumptionSet): ReturnMetrics {
    const leveredCashFlows = periods.map(p => p.leveredCashFlow.getAmount().toNumber());
    const unleveredCashFlows = periods.map(p => p.unleveredCashFlow.getAmount().toNumber());
    const equityInvestment = assumptions.acquisition.purchasePrice.value.toNumber() +
      assumptions.acquisition.acquisitionCosts.value.toNumber() +
      assumptions.acquisition.closingCosts.value.toNumber() -
      assumptions.financing.loanAmount.value.toNumber();

    leveredCashFlows[leveredCashFlows.length - 1] += exitModel.netExitProceeds.getAmount().toNumber();
    unleveredCashFlows[unleveredCashFlows.length - 1] += exitModel.exitValue.getAmount().toNumber();

    const irrPercent = this.calculateIRR([-equityInvestment, ...leveredCashFlows]);
    const projectIrrPercent = this.calculateIRR([
      -(assumptions.acquisition.purchasePrice.value.toNumber() +
        assumptions.acquisition.acquisitionCosts.value.toNumber() +
        assumptions.acquisition.closingCosts.value.toNumber()),
      ...unleveredCashFlows,
    ]);
    const equityIrrPercent = irrPercent;
    const leveredIrrPercent = irrPercent;
    const unleveredIrrPercent = projectIrrPercent;

    const totalInflows = leveredCashFlows.reduce((a, b) => a + b, 0);
    const grossMoic = new Decimal(totalInflows / equityInvestment);
    const netMoic = grossMoic;

    const npv = this.calculateNPV(leveredCashFlows, assumptions.financing.interestRate.value.toNumber() / 12);

    return {
      irrPercent: Percentage.fromNumber(irrPercent),
      xirrPercent: Percentage.fromNumber(irrPercent),
      projectIrrPercent: Percentage.fromNumber(projectIrrPercent),
      equityIrrPercent: Percentage.fromNumber(equityIrrPercent),
      leveredIrrPercent: Percentage.fromNumber(leveredIrrPercent),
      unleveredIrrPercent: Percentage.fromNumber(unleveredIrrPercent),
      grossMoic,
      netMoic,
      npv: new Money(npv, 'USD'),
      cashYield: Percentage.fromNumber(leveredCashFlows[0] / equityInvestment),
      cashOnCash: Percentage.fromNumber(leveredCashFlows[0] / equityInvestment),
      paybackPeriodMonths: this.calculatePaybackPeriod(leveredCashFlows, equityInvestment),
      equityMultiple: grossMoic,
      dscr: this.calculateDSCR(periods),
      debtYield: Percentage.fromNumber(periods[0].ebitda.getAmount().toNumber() / assumptions.financing.loanAmount.value.toNumber()),
      ltv: Percentage.fromNumber(assumptions.financing.ltv.value.toNumber()),
    };
  }

  private calculateIRR(cashFlows: number[]): number {
    let low = -0.99;
    let high = 10;
    let guess = 0.1;

    for (let i = 0; i < 100; i++) {
      const npv = cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + guess, t), 0);
      if (Math.abs(npv) < 0.01) break;

      const npvLow = cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + low, t), 0);
      const npvHigh = cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + high, t), 0);

      if (npvLow * npv < 0) {
        high = guess;
      } else {
        low = guess;
      }
      guess = (low + high) / 2;
    }

    return guess;
  }

  private calculateNPV(cashFlows: number[], discountRate: number): number {
    return cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + discountRate, t), 0);
  }

  private calculatePaybackPeriod(cashFlows: number[], initialInvestment: number): number {
    let cumulative = -initialInvestment;
    for (let i = 0; i < cashFlows.length; i++) {
      cumulative += cashFlows[i];
      if (cumulative >= 0) return i + 1;
    }
    return cashFlows.length;
  }

  private calculateDSCR(periods: CashFlowPeriod[]): Decimal {
    const totalDebtService = periods.reduce(
      (sum, p) => sum + p.interest.getAmount().toNumber() + p.principalRepayment.getAmount().toNumber(),
      0,
    );
    const totalEbitda = periods.reduce((sum, p) => sum + p.ebitda.getAmount().toNumber(), 0);
    return new Decimal(totalEbitda / totalDebtService);
  }

  private snapshotAssumptions(assumptions: AssumptionSet): Record<string, unknown> {
    return {
      acquisition: {
        purchasePrice: assumptions.acquisition.purchasePrice.value.toNumber(),
        acquisitionCosts: assumptions.acquisition.acquisitionCosts.value.toNumber(),
        closingCosts: assumptions.acquisition.closingCosts.value.toNumber(),
        initialCapex: assumptions.acquisition.initialCapex.value.toNumber(),
      },
      financing: {
        loanAmount: assumptions.financing.loanAmount.value.toNumber(),
        interestRate: assumptions.financing.interestRate.value.toNumber(),
        loanTermMonths: assumptions.financing.loanTermMonths.value.toNumber(),
        amortizationMonths: assumptions.financing.amortizationMonths.value.toNumber(),
        ltv: assumptions.financing.ltv.value.toNumber(),
      },
      operating: {
        revenueGrowthRate: assumptions.operating.revenueGrowthRate.value.toNumber(),
        occupancyRate: assumptions.operating.occupancyRate.value.toNumber(),
        operatingExpenseRatio: assumptions.operating.operatingExpenseRatio.value.toNumber(),
        maintenanceCapexPerUnit: assumptions.operating.maintenanceCapexPerUnit.value.toNumber(),
        inflationRate: assumptions.operating.inflationRate.value.toNumber(),
      },
      revenue: {
        streams: assumptions.revenue.streams.map(s => ({
          type: s.type,
          volume: s.volume.value.toNumber(),
          price: s.price.value.toNumber(),
          growthRate: s.growthRate.value.toNumber(),
          escalationRate: s.escalationRate.value.toNumber(),
          occupancyRate: s.occupancyRate.value.toNumber(),
          utilizationRate: s.utilizationRate.value.toNumber(),
        })),
      },
      expense: {
        lines: assumptions.expense.lines.map(l => ({
          category: l.category,
          amount: l.amount.value.toNumber(),
          growthRate: l.growthRate.value.toNumber(),
        })),
      },
      exit: {
        exitMultiple: assumptions.exit.exitMultiple.value.toNumber(),
        exitCapRate: assumptions.exit.exitCapRate.value.toNumber(),
        exitCosts: assumptions.exit.exitCosts.value.toNumber(),
      },
    };
  }
}