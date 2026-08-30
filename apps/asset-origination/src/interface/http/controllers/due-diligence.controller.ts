import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { GetDueDiligenceReportQuery } from '../../../application/queries/get-due-diligence-report.query';

@ApiTags('due-diligence')
@Controller('assets/:assetId/due-diligence')
export class DueDiligenceController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get the due diligence report for an asset' })
  getReport(@Param('assetId') assetId: string) {
    return this.queryBus.execute(new GetDueDiligenceReportQuery(assetId));
  }
}
