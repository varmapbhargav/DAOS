import { MintRequestId, TenantId } from '@daos/shared-kernel';

import { MintRequest } from '../../src/domain/entities/mint-request.entity';

const tenantId = TenantId.create('tenant-issuance');

function requested(): MintRequest {
  return MintRequest.request({
    tenantId,
    issuanceId: 'issuance-1',
    amountMinorUnits: '1000000000000000000',
    toAddress: '0xAb58',
    requestedBy: 'user-1',
  });
}

describe('MintRequest entity', () => {
  it('requests in pending status', () => {
    const request = requested();
    expect(request.status).toBe('pending');
    expect(request.amountMinorUnits).toBe('1000000000000000000');
    expect(request.toAddress).toBe('0xAb58');
    expect(request.txHash).toBeNull();
    expect(request.confirmedAt).toBeNull();
    expect(request.version).toBe(1);
  });

  it('requires a destination address', () => {
    expect(() =>
      MintRequest.request({ tenantId, issuanceId: 'i-1', amountMinorUnits: '100', toAddress: '   ', requestedBy: 'u-1' }),
    ).toThrow('Mint destination address is required');
  });

  it('requires a positive amount', () => {
    expect(() =>
      MintRequest.request({ tenantId, issuanceId: 'i-1', amountMinorUnits: '0', toAddress: '0x1', requestedBy: 'u-1' }),
    ).toThrow('Mint amount must be positive');
  });

  it('confirms and refuses double confirmation', () => {
    const request = requested();
    request.confirm('0xmint');
    expect(request.status).toBe('confirmed');
    expect(request.txHash).toBe('0xmint');
    expect(request.confirmedAt).not.toBeNull();
    expect(() => request.confirm('0xmint2')).toThrow('already confirmed');
  });

  it('reconstructs from persisted state', () => {
    const original = requested();
    original.confirm('0xmint');
    const clone = MintRequest.reconstruct({
      id: MintRequestId.create(original.id.value),
      tenantId: original.tenantId,
      issuanceId: original.issuanceId,
      amountMinorUnits: original.amountMinorUnits,
      toAddress: original.toAddress,
      status: original.status,
      txHash: original.txHash,
      requestedBy: original.requestedBy,
      requestedAt: original.requestedAt,
      confirmedAt: original.confirmedAt,
      version: original.version,
    });
    expect(clone.version).toBe(original.version);
    expect(clone.status).toBe('confirmed');
  });
});