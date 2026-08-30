import { Email } from './email';

describe('Email', () => {
  it('normalizes to lowercase', () => {
    expect(Email.create('  Foo@Bar.COM ').value).toBe('foo@bar.com');
  });
  it('rejects malformed addresses', () => {
    expect(() => Email.create('not-an-email')).toThrow('Invalid email');
    expect(() => Email.create('a@b')).toThrow('Invalid email');
  });
  it('supports equality', () => {
    expect(Email.create('a@b.co').equals(Email.create('A@B.CO'))).toBe(true);
  });
});
