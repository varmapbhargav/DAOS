import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AssignRoleCommand } from '../../../application/commands/assign-role.command';
import { OnboardUserCommand } from '../../../application/commands/onboard-user.command';
import { RevokeRoleCommand } from '../../../application/commands/revoke-role.command';
import { SuspendUserCommand } from '../../../application/commands/suspend-user.command';
import { AssignRoleDto } from '../../../application/dto/assign-role.dto';
import { OnboardUserDto } from '../../../application/dto/onboard-user.dto';
import { GetMyProfileQuery } from '../../../application/queries/get-my-profile.query';
import { GetUserQuery } from '../../../application/queries/get-user.query';
import { ListUsersQuery } from '../../../application/queries/list-users.query';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermission('user:invite')
  @ApiOperation({ summary: 'Onboard a new user' })
  onboard(@Body() dto: OnboardUserDto) {
    return this.commandBus.execute(new OnboardUserCommand(dto));
  }

  @Get()
  @RequirePermission('user:read')
  @ApiOperation({ summary: 'List users in the current tenant' })
  list() {
    return this.queryBus.execute(new ListUsersQuery());
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user profile + tenant white-label' })
  me() {
    return this.queryBus.execute(new GetMyProfileQuery());
  }

  @Get(':id')
  @RequirePermission('user:read')
  @ApiOperation({ summary: 'Get a user by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Post(':id/roles')
  @RequirePermission('user:assign-role')
  @ApiOperation({ summary: 'Assign a role to a user' })
  assignRole(
    @Param('id') id: string,
    @Body() dto: AssignRoleDto,
  ) {
    return this.commandBus.execute(new AssignRoleCommand(id, dto));
  }

  @Delete(':id/roles/:roleId')
  @RequirePermission('user:assign-role')
  @ApiOperation({ summary: 'Revoke a role from a user' })
  revokeRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
  ) {
    return this.commandBus.execute(new RevokeRoleCommand(id, roleId));
  }

  @Post(':id/suspend')
  @RequirePermission('user:update')
  @ApiOperation({ summary: 'Suspend (disable) a user' })
  suspend(@Param('id') id: string) {
    return this.commandBus.execute(new SuspendUserCommand(id));
  }
}
