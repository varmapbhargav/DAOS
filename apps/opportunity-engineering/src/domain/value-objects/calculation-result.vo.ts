import { Decimal, Money, Percentage } from './decimal.vo';
import { AssumptionSet } from './assumption.vo';

export type CalculationInputs = {
  assumptionSnapshot: Record<string, unknown>;
  modelVersion: string;
  formulaVersion: string;
  holdPeriodMonths: number;
  scenarioId: string;
  opportunityId: string;
};

export type CalculationOutputs = {
  cashFlows: any[];
  returnMetrics: any;
  exitModel: any;
  warnings: string[];
  errors: string[];
};

export type CalculationProvenance = {
  calculationId: string;
  calculationType: 'financial_model' | 'sensitivity' | 'monte_carlo' | 'optimization' | 'valuation';
  opportunityId: string;
  scenarioId: string;
  strategyId?: string;
  modelVersion: string;
  formulaVersion: string;
  assumptionSnapshot: Record<string, unknown>;
  inputs: CalculationInputs;
  outputs: CalculationOutputs;
  calculatedBy: string;
  calculatedAt: Date;
  durationMs: number;
  status: 'success' | 'partial' | 'failed';
};

export class CalculationResult {
  static create(
    calculationType: CalculationProvenance['calculationType'],
    opportunityId: string,
    scenarioId: string,
    strategyId: string | undefined,
    modelVersion: string,
    formulaVersion: string,
    assumptionSnapshot: Record<string, unknown>,
    inputs: CalculationInputs,
    outputs: CalculationOutputs,
    calculatedBy: string,
    durationMs: number,
    status: CalculationProvenance['status'] = 'success',
  ): CalculationProvenance {
    return {
      calculationId: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      calculationType,
      opportunityId,
      scenarioId,
      strategyId,
      modelVersion,
      formulaVersion,
      assumptionSnapshot,
      inputs,
      outputs,
      calculatedBy,
      calculatedAt: new Date(),
      durationMs,
      status,
    };
  }
}

export type AuditTrailEntry = {
  entryId: string;
  calculationId: string;
  action: 'created' | 'recalculated' | 'assumptions_changed' | 'model_updated' | 'version_created';
  performedBy: string;
  performedAt: Date;
  changes: Record<string, { old: unknown; new: unknown }>;
  reason?: string;
};

export class AuditTrail {
  private entries: AuditTrailEntry[] = [];

  addEntry(entry: Omit<AuditTrailEntry, 'entryId'>): AuditTrailEntry {
    const fullEntry: AuditTrailEntry = {
      ...entry,
      entryId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    this.entries.push(fullEntry);
    return fullEntry;
  }

  getEntries(calculationId: string): AuditTrailEntry[] {
    return this.entries.filter(e => e.calculationId === calculationId);
  }

  getAllEntries(): AuditTrailEntry[] {
    return [...this.entries];
  }
}