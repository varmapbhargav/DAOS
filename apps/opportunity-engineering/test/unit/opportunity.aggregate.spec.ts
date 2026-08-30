import { OpportunityId, OpportunityScore, SensitivityFactor, TargetReturnProfile, TenantId } from '@daos/shared-kernel';

import { Opportunity } from '../../src/domain/aggregates/opportunity.aggregate';
import { ScenarioModel } from '../../src/domain/aggregates/scenario-model.aggregate';

const tenantId = TenantId.create('tenant-opp');
const assetId = 'asset-1';
const sponsorId = 'sponsor-1';

const targetReturn: TargetReturnProfile = {
  targetIrrPercent: 18,
  targetMultiple: 1.8,
  expectedHoldPeriodMonths: 60,
  upsidePotentialPercent: 25,
  downsideRiskPercent: 12,
};

const sensitivity: SensitivityFactor = {
  name: 'exitCap',
  baseValue: 4.5,
  p10: 3.5,
  p90: 6,
};

const score: OpportunityScore = {
  overall: 72,
  components: { irr: 80, risk: 70, upside: 60, complexity: 50 },
};

function engineered(): Opportunity {
  return Opportunity.engineer({
    tenantId,
    assetId,
    name: 'Highland Opportunity',
    sponsorId,
    targetReturn,
    sensitivityFactors: [sensitivity],
  });
}

function scenarioFor(opp: Opportunity): ScenarioModel {
  return ScenarioModel.create({
    tenantId,
    opportunityId: opp.id.value,
    name: 'base',
    scenarioType: 'base',
    keyAssumptions: { exitCap: 4.5 },
  });
}

describe('Opportunity aggregate', () => {
  it('engineers a new opportunity with an engineered event', () => {
    const opp = engineered();
    expect(opp.status).toBe('engineered');
    expect(opp.assetId).toBe(assetId);
    expect(opp.targetReturn?.targetIrrPercent).toBe(18);
    expect(opp.sensitivityFactors).toHaveLength(1);
    expect(opp.pullEvents().map((e) => e.eventType)).toContain('opportunity.engineered.v1');
  });

  it('requires a non-empty name', () => {
    expect(() => Opportunity.engineer({ tenantId, assetId, name: '', sponsorId })).toThrow(
      'Opportunity name is required',
    );
  });

  it('attaches a scenario model', () => {
    const opp = engineered();
    opp.addScenario('scenario-1');
    expect(opp.scenarioModelIds).toEqual(['scenario-1']);
  });

  it('approves a scenario and records a scenario approved event', () => {
    const opp = engineered();
    opp.addScenario('scenario-1');
    opp.approveScenario('scenario-1');
    expect(opp.status).toBe('scenarioApproved');
    expect(opp.approvedScenarioId).toBe('scenario-1');
    expect(opp.pullEvents().map((e) => e.eventType)).toContain('opportunity.scenario.approved.v1');
  });

  it('refuses to approve a scenario that is not attached', () => {
    const opp = engineered();
    expect(() => opp.approveScenario('scenario-9')).toThrow('Scenario not attached');
  });

  it('records a score and moves to scored', () => {
    const opp = engineered();
    opp.scoreOpportunity(score);
    expect(opp.status).toBe('scored');
    expect(opp.score?.overall).toBe(72);
  });

  it('approves only when scored and a scenario is approved', () => {
    const opp = engineered();
    expect(() => opp.approve('user-1')).toThrow('before it has been scored');

    opp.scoreOpportunity(score);
    expect(() => opp.approve('user-1')).toThrow('without an approved scenario');

    opp.addScenario('scenario-1');
    opp.approveScenario('scenario-1');
    opp.approve('user-1');
    expect(opp.status).toBe('approved');
    expect(opp.approvedBy).toBe('user-1');
    expect(opp.pullEvents().map((e) => e.eventType)).toContain('opportunity.approved.v1');
  });

  it('rejects and records an opportunity rejected event, refusing double reject', () => {
    const opp = engineered();
    opp.reject('insufficient return');
    expect(opp.status).toBe('rejected');
    expect(opp.rejectionReason).toBe('insufficient return');
    expect(opp.pullEvents().map((e) => e.eventType)).toContain('opportunity.rejected.v1');
    expect(() => opp.reject('again')).toThrow('Opportunity already rejected');
  });

  it('optimizes structure for an attached scenario', () => {
    const opp = engineered();
    opp.addScenario('scenario-1');
    opp.optimizeStructure('scenario-1', 20.5);
    expect(opp.pullEvents().map((e) => e.eventType)).toContain('opportunity.structure.optimized.v1');
  });

  it('reconstructs from persisted state preserving version', () => {
    const original = engineered();
    original.addScenario('scenario-1');
    original.approveScenario('scenario-1');
    const clone = Opportunity.reconstruct({
      id: OpportunityId.create(original.id.value),
      tenantId: original.tenantId,
      assetId: original.assetId,
      name: original.name,
      sponsorId: original.sponsorId,
      status: original.status,
      targetReturn: original.targetReturn,
      score: original.score,
      sensitivityFactors: original.sensitivityFactors,
      scenarioModelIds: original.scenarioModelIds,
      approvedScenarioId: original.approvedScenarioId,
      approvedBy: original.approvedBy,
      rejectionReason: original.rejectionReason,
      version: original.version,
    });
    expect(clone.version).toBe(original.version);
    expect(clone.status).toBe('scenarioApproved');
  });
});
