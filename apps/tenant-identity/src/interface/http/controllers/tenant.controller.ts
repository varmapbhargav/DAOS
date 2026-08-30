import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ProvisionTenantCommand } from '../../../application/commands/provision-tenant.command';
import { UpdateWhiteLabelCommand } from '../../../application/commands/update-white-label.command';
import { ProvisionTenantDto } from '../../../application/dto/provision-tenant.dto';
import { UpdateWhiteLabelDto } from '../../../application/dto/update-white-label.dto';
import { GetTenantQuery } from '../../../application/queries/get-tenant.query';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';

@ApiTags('tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('tenants')
export class TenantController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermission('tenant:provision')
  @ApiOperation({ summary: 'Provision a new tenant (platform admin only)' })
  provision(@Body() dto: ProvisionTenantDto) {
    return this.commandBus.execute(new ProvisionTenantCommand(dto));
  }

  @Get('me')
  @RequirePermission('tenant:read')
  @ApiOperation({ summary: 'Get the current tenant including white-label config' })
  getMe() {
    return this.queryBus.execute(new GetTenantQuery());
  }

  @Patch('me/white-label')
  @RequirePermission('tenant:update')
  @ApiOperation({ summary: 'Update white-label configuration' })
  updateWhiteLabel(@Body() dto: UpdateWhiteLabelDto) {
    return this.commandBus.execute(new UpdateWhiteLabelCommand(dto));
  }
}
