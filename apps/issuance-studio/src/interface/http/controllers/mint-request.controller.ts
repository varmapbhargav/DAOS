import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { GetMintRequestQuery } from '../../../application/queries/get-mint-request.query';

@ApiTags('mint-requests')
@Controller('mint-requests')
export class MintRequestController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a mint request by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetMintRequestQuery(id));
  }
}