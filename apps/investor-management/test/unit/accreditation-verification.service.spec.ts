import { Email, InvestorProfile, KycProviderPort, TenantId } from '@daos/shared-kernel';

import { Investor } from '../../src/domain/aggregates/investor.aggregate';
import { AccreditationVerificationService } from '../../src/domain/services/accreditation-verification.service';

const tenantId = TenantId.create('tenant-1');
const profile: InvestorProfile = {
  legalName: 'Ada Lovelace',
  dateOfBirth: new Date('1985-06-01'),
  nationality: 'US',
  taxId: '123-45-6789',
};

function investor(): Investor {
  return Investor.invite({ tenantId, email: Email.create('ada@test.dev'), profile });
}

describe('AccreditationVerificationService', () => {
  it('verifies when provider returns a future expiry', async () => {
    const provider: KycProviderPort = {
      submitKyc: jest.fn() as never,
      getStatus: jest.fn() as never,
      verifyAccreditation: jest.fn().mockResolvedValue({
        verified: true,
        expiry: new Date(Date.now() + 365 * 86400000).toISOString(),
      }),
    };
    const svc = new AccreditationVerificationService(provider);
    const result = await svc.verify(investor(), 'accreditedInvestor', new Date());
    expect(result.verified).toBe(true);
    expect(result.expiresAt).toBeTruthy();
  });

  it('fails when provider returns an already-expired date', async () => {
    const provider: KycProviderPort = {
      submitKyc: jest.fn() as never,
      getStatus: jest.fn() as never,
      verifyAccreditation: jest.fn().mockResolvedValue({
        verified: true,
        expiry: new Date(Date.now() - 86400000).toISOString(),
      }),
    };
    const svc = new AccreditationVerificationService(provider);
    const result = await svc.verify(investor(), 'accreditedInvestor', new Date());
    expect(result.verified).toBe(false);
    expect(result.expiresAt).toBeNull();
  });

  it('fails when provider denies accreditation', async () => {
    const provider: KycProviderPort = {
      submitKyc: jest.fn() as never,
      getStatus: jest.fn() as never,
      verifyAccreditation: jest.fn().mockResolvedValue({ verified: false, expiry: null }),
    };
    const svc = new AccreditationVerificationService(provider);
    const result = await svc.verify(investor(), 'regA', new Date());
    expect(result.verified).toBe(false);
  });
});
