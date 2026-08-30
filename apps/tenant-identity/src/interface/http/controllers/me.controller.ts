import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { GetMyProfileQuery } from '../../../application/queries/get-my-profile.query';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RbacGuard } from '../guards/rbac.guard';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('me')
export class MeController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Authenticated user profile + tenant + white-label' })
  getMe() {
    return this.queryBus.execute(new GetMyProfileQuery());
  }
}
