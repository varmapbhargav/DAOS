import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { GetCorporateDocumentQuery } from '../../../application/queries/get-corporate-document.query';

@ApiTags('corporate-documents')
@Controller('documents')
export class CorporateDocumentController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a corporate document by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetCorporateDocumentQuery(id));
  }
}
