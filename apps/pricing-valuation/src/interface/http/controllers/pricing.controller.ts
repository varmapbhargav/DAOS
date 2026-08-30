import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApproveValuationCommand } from '../../../application/commands/approve-valuation.command';
import { MarkPriceStaleCommand } from '../../../application/commands/mark-price-stale.command';
import { PublishPriceCommand } from '../../../application/commands/publish-price.command';
import { RejectValuationCommand } from '../../../application/commands/reject-valuation.command';
import { RunValuationCommand } from '../../../application/commands/run-valuation.command';
import { PublishPriceDto, RejectValuationDto, RunValuationDto } from '../../../application/dto/pricing.dto';
import { GetPriceHistoryQuery } from '../../../application/queries/get-price-history.query';
import { GetPriceQuery } from '../../../application/queries/get-price.query';
import { GetValuationModelQuery } from '../../../application/queries/get-valuation-model.query';

@ApiTags('pricing')
@Controller()
export class PricingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('prices')
  @ApiOperation({ summary: 'Publish a price for an instrument (ISIN)' })
  publishPrice(@Body() dto: PublishPriceDto) {
    return this.commandBus.execute(new PublishPriceCommand(dto));
  }

  @Get('prices/:isin')
  @ApiOperation({ summary: 'Get the latest price for an ISIN' })
  getPrice(@Param('isin') isin: string) {
    return this.queryBus.execute(new GetPriceQuery(isin));
  }

  @Get('prices/:isin/history')
  @ApiOperation({ summary: 'Get price history (TimescaleDB) for an ISIN' })
  getPriceHistory(@Param('isin') isin: string, @Query('start') start?: string, @Query('end') end?: string) {
    return this.queryBus.execute(new GetPriceHistoryQuery(isin, start, end));
  }

  @Post('prices/:id/stale')
  @ApiOperation({ summary: 'Mark a published price as stale' })
  markPriceStale(@Param('id') id: string) {
    return this.commandBus.execute(new MarkPriceStaleCommand(id));
  }

  @Post('valuations')
  @ApiOperation({ summary: 'Initiate and run a valuation model' })
  runValuation(@Body() dto: RunValuationDto) {
    return this.commandBus.execute(new RunValuationCommand(dto));
  }

  @Get('valuations/:id')
  @ApiOperation({ summary: 'Get a valuation model by id' })
  getValuationModel(@Param('id') id: string) {
    return this.queryBus.execute(new GetValuationModelQuery(id));
  }

  @Post('valuations/:id/approve')
  @ApiOperation({ summary: 'Approve a valuation' })
  approveValuation(@Param('id') id: string) {
    return this.commandBus.execute(new ApproveValuationCommand(id));
  }

  @Post('valuations/:id/reject')
  @ApiOperation({ summary: 'Reject a valuation' })
  rejectValuation(@Param('id') id: string, @Body() dto: RejectValuationDto) {
    return this.commandBus.execute(new RejectValuationCommand(id, dto));
  }
}
