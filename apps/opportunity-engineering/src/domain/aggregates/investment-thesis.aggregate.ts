import { AggregateRoot } from '@daos/shared-kernel';
import { 
  InvestmentThesis, 
  InvestmentThesisStatus, 
  InvestmentThesisVersion, 
  ValueCreationDriver, 
  ExitStrategy 
} from '../value-objects/investment-thesis.vo';

// Re-export types for external use
export type { 
  InvestmentThesis, 
  InvestmentThesisStatus, 
  InvestmentThesisVersion, 
  ValueCreationDriver, 
  ExitStrategy 
};

export class InvestmentThesisAggregate extends AggregateRoot {
  private constructor(
    public readonly id: string,
    public readonly opportunityId: string,
    private _thesisStatement: string,
    private _executiveSummary: string,
    private _investmentRationale: string,
    private _marketOpportunity: string,
    private _assetRationale: string,
    private _problem: string,
    private _solution: string,
    private _competitiveAdvantage: string,
    private _valueCreationThesis: string,
    private _keyCatalysts: string[],
    private _keyRisks: string[],
    private _riskMitigation: string[],
    private _investmentHorizonMonths: number,
    private _entryThesis: string,
    private _exitStrategy: ExitStrategy,
    private _expectedReturn: any, // Percentage
    private _targetYield: any, // Percentage
    private _confidenceScore: any, // Percentage
    private _status: InvestmentThesisStatus,
    private _createdBy: string,
    private _approvedBy: string | null,
    private _versions: InvestmentThesisVersion[],
  ) {
    super();
  }

  static create(params: {
    id: string;
    opportunityId: string;
    thesisStatement: string;
    executiveSummary: string;
    investmentRationale: string;
    marketOpportunity: string;
    assetRationale: string;
    problem: string;
    solution: string;
    competitiveAdvantage: string;
    valueCreationThesis: string;
    keyCatalysts: string[];
    keyRisks: string[];
    riskMitigation: string[];
    investmentHorizonMonths: number;
    entryThesis: string;
    exitStrategy: ExitStrategy;
    expectedReturn: any; // Percentage
    targetYield: any; // Percentage
    confidenceScore: any; // Percentage
    createdBy: string;
  }): InvestmentThesisAggregate {
    const thesis = new InvestmentThesisAggregate(
      params.id,
      params.opportunityId,
      params.thesisStatement,
      params.executiveSummary,
      params.investmentRationale,
      params.marketOpportunity,
      params.assetRationale,
      params.problem,
      params.solution,
      params.competitiveAdvantage,
      params.valueCreationThesis,
      params.keyCatalysts,
      params.keyRisks,
      params.riskMitigation,
      params.investmentHorizonMonths,
      params.entryThesis,
      params.exitStrategy,
      params.expectedReturn,
      params.targetYield,
      params.confidenceScore,
      'draft',
      params.createdBy,
      null,
      [],
    );
    thesis.createVersion(params.createdBy, 'Initial creation');
    return thesis;
  }

  static reconstruct(params: {
    id: string;
    opportunityId: string;
    thesisStatement: string;
    executiveSummary: string;
    investmentRationale: string;
    marketOpportunity: string;
    assetRationale: string;
    problem: string;
    solution: string;
    competitiveAdvantage: string;
    valueCreationThesis: string;
    keyCatalysts: string[];
    keyRisks: string[];
    riskMitigation: string[];
    investmentHorizonMonths: number;
    entryThesis: string;
    exitStrategy: ExitStrategy;
    expectedReturn: any;
    targetYield: any;
    confidenceScore: any;
    status: InvestmentThesisStatus;
    version: number;
    createdBy: string;
    approvedBy: string | null;
    versions: InvestmentThesisVersion[];
  }): InvestmentThesisAggregate {
    const thesis = new InvestmentThesisAggregate(
      params.id,
      params.opportunityId,
      params.thesisStatement,
      params.executiveSummary,
      params.investmentRationale,
      params.marketOpportunity,
      params.assetRationale,
      params.problem,
      params.solution,
      params.competitiveAdvantage,
      params.valueCreationThesis,
      params.keyCatalysts,
      params.keyRisks,
      params.riskMitigation,
      params.investmentHorizonMonths,
      params.entryThesis,
      params.exitStrategy,
      params.expectedReturn,
      params.targetYield,
      params.confidenceScore,
      params.status,
      params.createdBy,
      params.approvedBy,
      params.versions ?? [],
    );
    (thesis as any)._version = params.version;
    return thesis;
  }

  // Getters
  get thesisStatement(): string { return this._thesisStatement; }
  get executiveSummary(): string { return this._executiveSummary; }
  get investmentRationale(): string { return this._investmentRationale; }
  get marketOpportunity(): string { return this._marketOpportunity; }
  get assetRationale(): string { return this._assetRationale; }
  get problem(): string { return this._problem; }
  get solution(): string { return this._solution; }
  get competitiveAdvantage(): string { return this._competitiveAdvantage; }
  get valueCreationThesis(): string { return this._valueCreationThesis; }
  get keyCatalysts(): string[] { return [...this._keyCatalysts]; }
  get keyRisks(): string[] { return [...this._keyRisks]; }
  get riskMitigation(): string[] { return [...this._riskMitigation]; }
  get investmentHorizonMonths(): number { return this._investmentHorizonMonths; }
  get entryThesis(): string { return this._entryThesis; }
  get exitStrategy(): ExitStrategy { return { ...this._exitStrategy }; }
  get expectedReturn(): any { return this._expectedReturn; }
  get targetYield(): any { return this._targetYield; }
  get confidenceScore(): any { return this._confidenceScore; }
  get status(): InvestmentThesisStatus { return this._status; }
  get version(): number { return this._version; }
  get createdBy(): string { return this._createdBy; }
  get approvedBy(): string | null { return this._approvedBy; }
  get versions(): InvestmentThesisVersion[] { return [...this._versions]; }

  private createVersion(createdBy: string, changeReason: string): void {
    const version: InvestmentThesisVersion = {
      version: this._version,
      thesisStatement: this._thesisStatement,
      executiveSummary: this._executiveSummary,
      investmentRationale: this._investmentRationale,
      marketOpportunity: this._marketOpportunity,
      assetRationale: this._assetRationale,
      problem: this._problem,
      solution: this._solution,
      competitiveAdvantage: this._competitiveAdvantage,
      valueCreationThesis: this._valueCreationThesis,
      keyCatalysts: [...this._keyCatalysts],
      keyRisks: [...this._keyRisks],
      riskMitigation: [...this._riskMitigation],
      investmentHorizonMonths: this._investmentHorizonMonths,
      entryThesis: this._entryThesis,
      exitStrategy: { ...this._exitStrategy },
      expectedReturn: this._expectedReturn,
      targetYield: this._targetYield,
      confidenceScore: this._confidenceScore,
      status: this._status,
      createdAt: new Date(),
      createdBy,
      changeReason,
    };
    this._versions.push(version);
  }

  updateThesisStatement(statement: string, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update thesis in draft status');
    this._thesisStatement = statement;
    this.incrementVersion();
    this.createVersion(createdBy, 'Thesis statement updated');
  }

  updateExecutiveSummary(summary: string, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update in draft status');
    this._executiveSummary = summary;
    this.incrementVersion();
    this.createVersion(createdBy, 'Executive summary updated');
  }

  updateInvestmentRationale(rationale: string, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update in draft status');
    this._investmentRationale = rationale;
    this.incrementVersion();
    this.createVersion(createdBy, 'Investment rationale updated');
  }

  updateMarketOpportunity(opportunity: string, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update in draft status');
    this._marketOpportunity = opportunity;
    this.incrementVersion();
    this.createVersion(createdBy, 'Market opportunity updated');
  }

  updateAssetRationale(rationale: string, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update in draft status');
    this._assetRationale = rationale;
    this.incrementVersion();
    this.createVersion(createdBy, 'Asset rationale updated');
  }

  updateProblemSolution(problem: string, solution: string, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update in draft status');
    this._problem = problem;
    this._solution = solution;
    this.incrementVersion();
    this.createVersion(createdBy, 'Problem/solution updated');
  }

  updateCompetitiveAdvantage(advantage: string, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update in draft status');
    this._competitiveAdvantage = advantage;
    this.incrementVersion();
    this.createVersion(createdBy, 'Competitive advantage updated');
  }

  updateValueCreationThesis(thesis: string, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update in draft status');
    this._valueCreationThesis = thesis;
    this.incrementVersion();
    this.createVersion(createdBy, 'Value creation thesis updated');
  }

  updateKeyCatalysts(catalysts: string[], createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update in draft status');
    this._keyCatalysts = catalysts;
    this.incrementVersion();
    this.createVersion(createdBy, 'Key catalysts updated');
  }

  updateKeyRisks(risks: string[], createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update in draft status');
    this._keyRisks = risks;
    this.incrementVersion();
    this.createVersion(createdBy, 'Key risks updated');
  }

  updateRiskMitigation(mitigation: string[], createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update in draft status');
    this._riskMitigation = mitigation;
    this.incrementVersion();
    this.createVersion(createdBy, 'Risk mitigation updated');
  }

  updateInvestmentHorizon(months: number, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update in draft status');
    this._investmentHorizonMonths = months;
    this.incrementVersion();
    this.createVersion(createdBy, 'Investment horizon updated');
  }

  updateEntryThesis(thesis: string, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update in draft status');
    this._entryThesis = thesis;
    this.incrementVersion();
    this.createVersion(createdBy, 'Entry thesis updated');
  }

  updateExitStrategy(strategy: ExitStrategy, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update in draft status');
    this._exitStrategy = strategy;
    this.incrementVersion();
    this.createVersion(createdBy, 'Exit strategy updated');
  }

  updateExpectedReturn(returnRate: any, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update in draft status');
    this._expectedReturn = returnRate;
    this.incrementVersion();
    this.createVersion(createdBy, 'Expected return updated');
  }

  updateTargetYield(yieldRate: any, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update in draft status');
    this._targetYield = yieldRate;
    this.incrementVersion();
    this.createVersion(createdBy, 'Target yield updated');
  }

  updateConfidenceScore(score: any, createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only update in draft status');
    this._confidenceScore = score;
    this.incrementVersion();
    this.createVersion(createdBy, 'Confidence score updated');
  }

  finalize(createdBy: string): void {
    if (this._status !== 'draft') throw new Error('Can only finalize from draft status');
    this._status = 'final';
    this.incrementVersion();
    this.createVersion(createdBy, 'Thesis finalized');
  }

  approve(approvedBy: string): void {
    if (this._status !== 'final') throw new Error('Can only approve finalized thesis');
    this._status = 'approved';
    this._approvedBy = approvedBy;
    this.incrementVersion();
    this.createVersion(approvedBy, 'Thesis approved');
  }

  archive(createdBy: string): void {
    this._status = 'archived';
    this.incrementVersion();
    this.createVersion(createdBy, 'Thesis archived');
  }

  getVersion(versionNumber: number): InvestmentThesisVersion | null {
    return this._versions.find(v => v.version === versionNumber) ?? null;
  }

  compareVersions(v1: number, v2: number): Record<string, { old: unknown; new: unknown }> {
    const ver1 = this.getVersion(v1);
    const ver2 = this.getVersion(v2);
    if (!ver1 || !ver2) throw new Error('Version not found');

    const changes: Record<string, { old: unknown; new: unknown }> = {};
    const allKeys = new Set([
      ...Object.keys(ver1),
      ...Object.keys(ver2),
    ]);

    for (const key of allKeys) {
      const oldVal = (ver1 as any)[key];
      const newVal = (ver2 as any)[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes[key] = { old: oldVal, new: newVal };
      }
    }

    return changes;
  }
}