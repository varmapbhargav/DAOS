import { Email, InvestorProfile, TenantId } from '@daos/shared-kernel';

import { Investor } from '../../src/domain/aggregates/investor.aggregate';
import { SuitabilityAssessor } from '../../src/domain/services/suitability-assessor';

const tenantId = TenantId.create('tenant-1');
const profile: InvestorProfile = {
  legalName: 'Ada Lovelace',
  dateOfBirth: new Date('1985-06-01'),
  nationality: 'US',
  taxId: '123-45-6789',
};

function investorWithRisk(risk: { riskTolerance: 'low' | 'medium' | 'high'; investmentHorizon: number; liquidityNeeds: 'low' | 'medium' | 'high' }): Investor {
  const inv = Investor.invite({ tenantId, email: Email.create('ada@test.dev'), profile });
  inv.updateRiskProfile(risk);
  return inv;
}

describe('SuitabilityAssessor', () => {
  it('returns unsuitable when no risk profile on file', () => {
    const inv = Investor.invite({ tenantId, email: Email.create('ada@test.dev'), profile });
    const result = new SuitabilityAssessor().assess(inv, 24);
    expect(result.suitable).toBe(false);
    expect(result.reasons).toContain('Investor has no risk profile on file');
  });

  it('declares a medium-risk, long-horizon investor suitable', () => {
    const inv = investorWithRisk({ riskTolerance: 'medium', investmentHorizon: 36, liquidityNeeds: 'medium' });
    const result = new SuitabilityAssessor().assess(inv, 24);
    expect(result.suitable).toBe(true);
  });

  it('flags low risk tolerance as unsuitable', () => {
    const inv = investorWithRisk({ riskTolerance: 'low', investmentHorizon: 36, liquidityNeeds: 'medium' });
    const result = new SuitabilityAssessor().assess(inv, 24);
    expect(result.suitable).toBe(false);
    expect(result.reasons).toContain('Investor risk tolerance is too low for the vehicle');
  });

  it('flags a too-short horizon as unsuitable', () => {
    const inv = investorWithRisk({ riskTolerance: 'high', investmentHorizon: 6, liquidityNeeds: 'medium' });
    const result = new SuitabilityAssessor().assess(inv, 24);
    expect(result.suitable).toBe(false);
    expect(result.reasons).toContain('Investment horizon is shorter than the vehicle lock-up');
  });

  it('flags high liquidity needs as unsuitable', () => {
    const inv = investorWithRisk({ riskTolerance: 'high', investmentHorizon: 36, liquidityNeeds: 'high' });
    const result = new SuitabilityAssessor().assess(inv, 24);
    expect(result.suitable).toBe(false);
    expect(result.reasons).toContain('Investor liquidity needs are too high for an illiquid vehicle');
  });
});
