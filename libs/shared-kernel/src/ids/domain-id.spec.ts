import { RoleId,TenantId, UserId } from './domain-id';

describe('Domain IDs', () => {
  it('generates a uuid when none given', () => {
    expect(TenantId.create().value).toMatch(/^[0-9a-f-]{36}$/);
  });
  it('wraps an existing value', () => {
    expect(TenantId.create('abc').value).toBe('abc');
  });
  it('rejects empty values', () => {
    expect(() => UserId.create('')).toThrow('cannot be empty');
  });
  it('equals only same type and value', () => {
    expect(RoleId.create('x').equals(RoleId.create('x'))).toBe(true);
    expect(RoleId.create('x').equals(RoleId.create('y'))).toBe(false);
    expect(TenantId.create('x').equals(UserId.create('x') as unknown as TenantId)).toBe(false);
  });
});
