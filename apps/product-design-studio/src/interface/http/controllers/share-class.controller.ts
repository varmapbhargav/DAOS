import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { GetShareClassQuery } from '../../../application/queries/get-share-class.query';

@ApiTags('share-classes')
@Controller('share-classes')
export class ShareClassController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a share class by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetShareClassQuery(id));
  }
}
