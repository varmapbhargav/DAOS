import { MeResponseDto, TenantDetailDto } from '@daos/identity-api';
import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { IdentityHttpClient } from '../proxy/identity-http.client';

@ApiTags('me')
@ApiBearerAuth()
@Controller('me')
export class MeController {
  constructor(private readonly client: IdentityHttpClient) {}

  @Get()
  @ApiOperation({ summary: 'Compose user profile + tenant white-label from the identity service' })
  async getMe(@Req() req: Request): Promise<MeResponseDto> {
    const auth = typeof req.headers.authorization === 'string' ? req.headers.authorization : undefined;
    const me = await this.client.getJson<MeResponseDto>('/users/me', auth);
    const tenantDetail = await this.client.getJson<TenantDetailDto>('/tenants/me', auth);
    return { user: me.user, tenant: me.tenant, whiteLabel: tenantDetail.whiteLabel };
  }
}
