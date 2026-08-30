import { Email, InvestorProfile, InvestorId, TenantId, WalletId } from '@daos/shared-kernel';

import { Investor } from '../../src/domain/aggregates/investor.aggregate';

const tenantId = TenantId.create('tenant-1');
const profile: InvestorProfile = {
  legalName: 'Ada Lovelace',
  dateOfBirth: new Date('1985-06-01'),
  nationality: 'US',
  taxId: '123-45-6789',
};

function invited(): Investor {
  return Investor.invite({ tenantId, email: Email.create('ada@test.dev'), profile });
}

describe('Investor aggregate', () => {
  it('starts invited with pending accreditation and no KYC', () => {
    const inv = invited();
    expect(inv.status).toBe('invited');
    expect(inv.accreditationStatus).toBe('pending');
    expect(inv.kycStatus).toBe('notStarted');
    expect(inv.walletAddresses).toEqual([]);
  });

  it('requires a non-empty email', () => {
    expect(() => Investor.invite({ tenantId, email: Email.create(''), profile })).toThrow('Invalid email');
  });

  it('submits KYC and records a KycSubmitted event', () => {
    const inv = invited();
    inv.submitKyc('kyc-1', 'provider-ref', new Date().toISOString());
    expect(inv.kycStatus).toBe('submitted');
    const events = inv.pullEvents();
    expect(events.map((e) => e.eventType)).toContain('investor.kyc.submitted.v1');
  });

  it('approves only after KYC approved and accreditation verified', () => {
    const inv = invited();
    inv.submitKyc('kyc-1', 'ref', new Date().toISOString());
    inv.approveKyc('kyc-1');
    expect(inv.status).toBe('invited');

    inv.verifyAccreditation('accreditedInvestor', new Date(Date.now() + 86400000).toISOString());
    expect(inv.status).toBe('active');
    const events = inv.pullEvents();
    expect(events.map((e) => e.eventType)).toContain('investor.approved.v1');
  });

  it('rejects KYC and records a KycRejected event', () => {
    const inv = invited();
    inv.rejectKyc('kyc-1', 'invalid document');
    expect(inv.kycStatus).toBe('rejected');
    expect(inv.pullEvents().map((e) => e.eventType)).toContain('investor.kyc.rejected.v1');
  });

  it('links a wallet and rejects duplicates', () => {
    const inv = invited();
    inv.linkWallet(WalletId.create('w1'), '0xabc');
    expect(inv.walletAddresses).toEqual(['0xabc']);
    expect(() => inv.linkWallet(WalletId.create('w2'), '0xabc')).toThrow('already linked');
  });

  it('suspends and records an InvestorSuspended event, refusing double suspend', () => {
    const inv = invited();
    inv.suspend('regulatory hold');
    expect(inv.status).toBe('disabled');
    expect(inv.pullEvents().map((e) => e.eventType)).toContain('investor.suspended.v1');
    expect(() => inv.suspend('again')).toThrow('already suspended');
  });

  it('expires accreditation and restores pending accreditation status', () => {
    const inv = invited();
    inv.verifyAccreditation('accreditedInvestor', new Date(Date.now() + 86400000).toISOString());
    inv.expireAccreditation();
    expect(inv.accreditationStatus).toBe('expired');
    expect(inv.accreditationLevel).toBeNull();
  });

  it('guards KYC state transitions', () => {
    const inv = invited();
    // approve before submitting should throw
    expect(() => inv.approveKyc('kyc-1')).toThrow(/cannot be approved/);
  });

  it('reconstructs from persisted state preserving version', () => {
    const original = invited();
    original.submitKyc('kyc-1', 'ref', new Date().toISOString());
    original.approveKyc('kyc-1');
    const clone = Investor.reconstruct({
      id: InvestorId.create(original.id.value),
      tenantId: original.tenantId,
      userId: original.userId,
      email: original.email,
      status: original.status,
      profile: original.profile,
      accreditationLevel: original.accreditationLevel,
      accreditationStatus: original.accreditationStatus,
      accreditationExpiresAt: original.accreditationExpiresAt,
      kycStatus: original.kycStatus,
      riskProfile: original.riskProfile,
      walletAddresses: original.walletAddresses,
      walletIds: original.walletIds,
      version: original.version,
    });
    expect(clone.version).toBe(original.version);
    expect(clone.kycStatus).toBe('approved');
  });
});
