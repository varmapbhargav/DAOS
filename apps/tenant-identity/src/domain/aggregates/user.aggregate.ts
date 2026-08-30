import { AggregateRoot, Email, RoleId, TenantId, UserId } from '@daos/shared-kernel';

import { RoleAssigned } from '../events/role-assigned.event';
import { RoleRevoked } from '../events/role-revoked.event';
import { UserOnboarded } from '../events/user-onboarded.event';
import { UserStatus } from '../value-objects/status';

export class User extends AggregateRoot {
  private constructor(
    public readonly id: UserId,
    public readonly tenantId: TenantId,
    public readonly email: Email,
    private _status: UserStatus,
    private _passwordHash: string,
    private _roleIds: RoleId[],
  ) {
    super();
  }

  static onboard(params: { tenantId: TenantId; email: Email; passwordHash: string; roleIds: RoleId[] }): User {
    if (params.roleIds.length === 0) throw new Error('User must have at least one role');
    const user = new User(
      UserId.create(),
      params.tenantId,
      params.email,
      UserStatus.Active,
      params.passwordHash,
      [...params.roleIds],
    );
    user.raise(new UserOnboarded(user.id.value, user.tenantId.value, user.email.value));
    return user;
  }

  static reconstruct(params: {
    id: UserId;
    tenantId: TenantId;
    email: Email;
    status: UserStatus;
    passwordHash: string;
    roleIds: RoleId[];
    version: number;
  }): User {
    const user = new User(
      params.id,
      params.tenantId,
      params.email,
      params.status,
      params.passwordHash,
      [...params.roleIds],
    );
    user._version = params.version;
    return user;
  }

  get status(): UserStatus {
    return this._status;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get roleIds(): RoleId[] {
    return [...this._roleIds];
  }

  hasRole(roleId: RoleId): boolean {
    return this._roleIds.some((r) => r.equals(roleId));
  }

  assignRole(roleId: RoleId): void {
    if (this.hasRole(roleId)) return;
    this._roleIds.push(roleId);
    this.raise(new RoleAssigned(this.id.value, this.tenantId.value, roleId.value));
    this.incrementVersion();
  }

  revokeRole(roleId: RoleId): void {
    if (!this.hasRole(roleId)) throw new Error('User does not have role');
    if (this._roleIds.length === 1) throw new Error('User must have at least one role');
    this._roleIds = this._roleIds.filter((r) => !r.equals(roleId));
    this.raise(new RoleRevoked(this.id.value, this.tenantId.value, roleId.value));
    this.incrementVersion();
  }

  disable(): void {
    if (this._status === UserStatus.Disabled) throw new Error('Already disabled');
    this._status = UserStatus.Disabled;
    this.incrementVersion();
  }
}
