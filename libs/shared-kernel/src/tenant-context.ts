import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContextValue {
  tenantId: string | null;
  userId: string | null;
  roleIds: string[];
  permissions: string[];
  isPlatform: boolean;
}

const EMPTY: TenantContextValue = {
  tenantId: null,
  userId: null,
  roleIds: [],
  permissions: [],
  isPlatform: false,
};

export class TenantContextHolder {
  private static readonly storage = new AsyncLocalStorage<TenantContextValue>();

  static run<T>(value: TenantContextValue, fn: () => T): T {
    return this.storage.run(value, fn);
  }

  static enterWith(value: TenantContextValue): void {
    this.storage.enterWith(value);
  }

  static get(): TenantContextValue {
    return this.storage.getStore() ?? EMPTY;
  }

  static requireTenantId(): string {
    const ctx = this.get();
    if (!ctx.tenantId) throw new Error('No tenant in context');
    return ctx.tenantId;
  }
}
