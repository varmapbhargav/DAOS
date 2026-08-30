import { User } from '../aggregates/user.aggregate';
import { Role } from '../entities/role.entity';
import { Permission } from '../value-objects/permission';

export class RbacEvaluator {
  hasPermission(user: User, roles: Role[], permission: Permission): boolean {
    const userRoles = roles.filter((role) => user.roleIds.some((id) => id.equals(role.id)));
    return userRoles.some((role) => role.hasPermission(permission));
  }
}
