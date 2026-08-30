import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ListRolesQuery } from '../../../application/queries/list-roles.query';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @RequirePermission('role:read')
  @ApiOperation({ summary: 'List roles in the current tenant' })
  list() {
    return this.queryBus.execute(new ListRolesQuery());
  }
}
