import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InitializeCapTableCommand } from '../../../application/commands/initialize-cap-table.command';
import { SyncCapTableFromChainCommand } from '../../../application/commands/sync-cap-table-from-chain.command';
import { TransferSharesCommand } from '../../../application/commands/transfer-shares.command';
import {
  AddShareholderDto,
  InitializeCapTableDto,
  SyncCapTableDto,
  TransferSharesDto,
} from '../../../application/dto/cap-table.dto';
import { GetCapTableWaterfallViewQuery } from '../../../application/queries/get-cap-table-waterfall-view.query';
import { GetCapTableQuery } from '../../../application/queries/get-cap-table.query';
import { GetShareholderRecordQuery } from '../../../application/queries/get-shareholder-record.query';

@ApiTags('cap-tables')
@Controller('cap-tables')
export class CapTableController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Initialize a cap table' })
  initialize(@Body() dto: InitializeCapTableDto) {
    return this.commandBus.execute(new InitializeCapTableCommand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'List cap tables' })
  list(@Query('issuanceId') issuanceId?: string) {
    return this.queryBus.execute(new ListCapTablesQuery(issuanceId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cap table by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetCapTableQuery(id));
  }

  @Get(':id/shareholders/:shareholderId')
  @ApiOperation({ summary: 'Get a shareholder record' })
  getShareholder(
    @Param('id') id: string,
    @Param('shareholderId') shareholderId: string,
    @Query('shareClassId') shareClassId?: string,
  ) {
    return this.queryBus.execute(new GetShareholderRecordQuery(id, shareholderId, shareClassId));
  }

  @Get(':id/waterfall')
  @ApiOperation({ summary: 'Get the cap table waterfall view' })
  waterfall(@Param('id') id: string) {
    return this.queryBus.execute(new GetCapTableWaterfallViewQuery(id));
  }

  @Post(':id/shareholders')
  @ApiOperation({ summary: 'Add a shareholder to the cap table' })
  addShareholder(@Param('id') id: string, @Body() dto: AddShareholderDto) {
    return this.commandBus.execute(new AddShareholderCommand(id, dto));
  }

  @Post(':id/transfers')
  @ApiOperation({ summary: 'Record a share transfer' })
  transfer(@Param('id') id: string, @Body() dto: TransferSharesDto) {
    return this.commandBus.execute(new TransferSharesCommand(id, dto));
  }

  @Post(':id/sync-from-chain')
  @ApiOperation({ summary: 'Sync the cap table from chain state' })
  sync(@Param('id') id: string, @Body() dto: SyncCapTableDto) {
    return this.commandBus.execute(new SyncCapTableFromChainCommand(id, dto));
  }
}

import { ListCapTablesQuery } from '../../../application/queries/list-cap-tables.query';
import { AddShareholderCommand } from '../../../application/commands/add-shareholder.command';