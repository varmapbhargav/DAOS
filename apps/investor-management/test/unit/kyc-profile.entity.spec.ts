import { TenantId } from '@daos/shared-kernel';

import { KycProfile } from '../../src/domain/entities/kyc-profile.entity';

const tenantId = TenantId.create('tenant-1');

describe('KycProfile entity', () => {
  it('creates in notStarted status', () => {
    const kyc = KycProfile.create({ tenantId, investorId: 'inv-1' });
    expect(kyc.status).toBe('notStarted');
    expect(kyc.documents).toEqual([]);
  });

  it('submits and transitions to submitted', () => {
    const kyc = KycProfile.create({ tenantId, investorId: 'inv-1' });
    kyc.submit('ref-1', new Date().toISOString());
    expect(kyc.status).toBe('submitted');
    expect(kyc.providerRef).toBe('ref-1');
  });

  it('approves only from submitted/underReview', () => {
    const kyc = KycProfile.create({ tenantId, investorId: 'inv-1' });
    kyc.submit('ref-1', new Date().toISOString());
    kyc.approve(new Date().toISOString());
    expect(kyc.status).toBe('approved');
  });

  it('guards invalid transitions', () => {
    const kyc = KycProfile.create({ tenantId, investorId: 'inv-1' });
    expect(() => kyc.approve(new Date().toISOString())).toThrow(/can be approved/);
    expect(() => kyc.reject(new Date().toISOString())).toThrow(/can be rejected/);
  });

  it('rejects and attaches a failed report', () => {
    const kyc = KycProfile.create({ tenantId, investorId: 'inv-1' });
    kyc.submit('ref-1', new Date().toISOString());
    kyc.reject(new Date().toISOString());
    expect(kyc.status).toBe('rejected');
    expect(kyc.report?.passed).toBe(false);
  });

  it('holds documents', () => {
    const kyc = KycProfile.create({ tenantId, investorId: 'inv-1' });
    expect(kyc.documents).toBeInstanceOf(Array);
  });
});
