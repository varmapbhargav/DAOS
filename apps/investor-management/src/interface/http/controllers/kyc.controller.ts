import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { GetKycProfileQuery } from '../../../application/queries/get-kyc-profile.query';

@ApiTags('kyc')
@Controller('investors/:investorId/kyc')
export class KycController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get the KYC profile for an investor' })
  getProfile(@Param('investorId') investorId: string) {
    return this.queryBus.execute(new GetKycProfileQuery(investorId));
  }
}
