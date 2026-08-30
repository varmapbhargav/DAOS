import { ScenarioModelId, TenantId } from '@daos/shared-kernel';

import { ScenarioModel } from '../../src/domain/aggregates/scenario-model.aggregate';

const tenantId = TenantId.create('tenant-scenario');

function baseScenario(): ScenarioModel {
  return ScenarioModel.create({
    tenantId,
    opportunityId: 'opp-1',
    name: 'base',
    scenarioType: 'base',
    keyAssumptions: { exitCap: 4.5, rentGrowth: 3 },
  });
}

describe('ScenarioModel aggregate', () => {
  it('creates a draft scenario with no projection', () => {
    const model = baseScenario();
    expect(model.status).toBe('draft');
    expect(model.projectedIrrPercent).toBeNull();
    expect(model.keyAssumptions.rentGrowth).toBe(3);
    expect(model.opportunityId).toBe('opp-1');
  });

  it('applies a projection of IRR and multiple', () => {
    const model = baseScenario();
    model.applyProjection(16.5, 1.7);
    expect(model.projectedIrrPercent).toBe(16.5);
    expect(model.projectedMultiple).toBe(1.7);
  });

  it('approves only after a projection exists', () => {
    const model = baseScenario();
    expect(() => model.approve()).toThrow('must be projected before approval');
    model.applyProjection(16.5, 1.7);
    model.approve();
    expect(model.status).toBe('approved');
  });

  it('refuses to approve twice', () => {
    const model = baseScenario();
    model.applyProjection(16.5, 1.7);
    model.approve();
    expect(() => model.approve()).toThrow('already approved');
  });

  it('reconstructs from persisted state preserving version', () => {
    const original = baseScenario();
    original.applyProjection(16.5, 1.7);
    const clone = ScenarioModel.reconstruct({
      id: ScenarioModelId.create(original.id.value),
      tenantId: original.tenantId,
      opportunityId: original.opportunityId,
      name: original.name,
      scenarioType: original.scenarioType,
      status: original.status,
      keyAssumptions: original.keyAssumptions,
      projectedIrrPercent: original.projectedIrrPercent,
      projectedMultiple: original.projectedMultiple,
      version: original.version,
    });
    expect(clone.version).toBe(original.version);
    expect(clone.projectedIrrPercent).toBe(16.5);
  });
});
