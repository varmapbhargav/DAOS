import { AggregateRoot, ApiKeyId, ApiKeyScope, ApiKeyStatus, TenantId } from '@daos/shared-kernel';

import { ApiKeyIssued } from '../events/api-key-issued.event';
import { ApiKeyRotated } from '../events/api-key-rotated.event';
import { ApiKeyRevoked } from '../events/api-key-revoked.event';

export type IssueApiKeyParams = {
  tenantId: TenantId;
  label: string;
  scope: ApiKeyScope;
  keyHash: string;
  prefix: string;
  expiresAt: string | null;
  createdAt: string;
};

export class ApiKey extends AggregateRoot {
  private constructor(
    public readonly id: ApiKeyId,
    public readonly tenantId: TenantId,
    private _label: string,
    private _keyHash: string,
    private _scope: ApiKeyScope,
    private _status: ApiKeyStatus,
    private _expiresAt: string | null,
    private _createdAt: string,
    private _lastUsedAt: string | null,
    private _prefix: string,
  ) {
    super();
  }

  static issue(params: IssueApiKeyParams): ApiKey {
    if (!params.label.trim()) throw new Error('API key label is required');
    const apiKey = new ApiKey(
      ApiKeyId.create(),
      params.tenantId,
      params.label.trim(),
      params.keyHash,
      params.scope,
      'active',
      params.expiresAt,
      params.createdAt,
      null,
      params.prefix,
    );
    apiKey.raise(new ApiKeyIssued(apiKey.id.value, params.tenantId.value, apiKey.id.value, params.scope));
    apiKey.incrementVersion();
    return apiKey;
  }

  rotate(keyHash: string, expiresAt: string | null): void {
    if (this._status !== 'active') throw new Error('Only active API keys can be rotated');
    this._keyHash = keyHash;
    this._expiresAt = expiresAt;
    this.raise(new ApiKeyRotated(this.id.value, this.tenantId.value, this.id.value, this._scope));
    this.incrementVersion();
  }

  revoke(): void {
    if (this._status !== 'active') throw new Error('API key already revoked');
    this._status = 'revoked';
    this.raise(new ApiKeyRevoked(this.id.value, this.tenantId.value, this.id.value));
    this.incrementVersion();
  }

  touch(now: string): void {
    this._lastUsedAt = now;
  }

  isExpired(now: string): boolean {
    return this._expiresAt !== null && this._expiresAt <= now;
  }

  get label(): string {
    return this._label;
  }

  get keyHash(): string {
    return this._keyHash;
  }

  get prefix(): string {
    return this._prefix;
  }

  get scope(): ApiKeyScope {
    return this._scope;
  }

  get status(): ApiKeyStatus {
    return this._status;
  }

  get expiresAt(): string | null {
    return this._expiresAt;
  }

  get createdAt(): string {
    return this._createdAt;
  }

  get lastUsedAt(): string | null {
    return this._lastUsedAt;
  }

  static reconstruct(params: {
    id: ApiKeyId;
    tenantId: TenantId;
    label: string;
    keyHash: string;
    scope: ApiKeyScope;
    status: ApiKeyStatus;
    expiresAt: string | null;
    createdAt: string;
    lastUsedAt: string | null;
    prefix: string;
    version: number;
  }): ApiKey {
    const apiKey = new ApiKey(
      params.id,
      params.tenantId,
      params.label,
      params.keyHash,
      params.scope,
      params.status,
      params.expiresAt,
      params.createdAt,
      params.lastUsedAt,
      params.prefix,
    );
    apiKey._version = params.version;
    return apiKey;
  }
}
