import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ConfirmSettlementCommand } from '../../../application/commands/confirm-settlement.command';
import { FailSettlementCommand } from '../../../application/commands/fail-settlement.command';
import { InitiateSettlementCommand } from '../../../application/commands/initiate-settlement.command';
import { MatchSettlementCommand } from '../../../application/commands/match-settlement.command';
import { FailSettlementDto, InitiateSettlementDto } from '../../../application/dto/settlement.dto';
import { GetSettlementInstructionQuery } from '../../../application/queries/get-settlement-instruction.query';
import { ListPendingSettlementsQuery } from '../../../application/queries/list-pending-settlements.query';

@ApiTags('settlement')
@Controller()
export class SettlementController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('settlements')
  @ApiOperation({ summary: 'Initiate a settlement instruction' })
  initiate(@Body() dto: InitiateSettlementDto) {
    return this.commandBus.execute(new InitiateSettlementCommand(dto));
  }

  @Get('settlements/pending')
  @ApiOperation({ summary: 'List pending settlement instructions' })
  pending() {
    return this.queryBus.execute(new ListPendingSettlementsQuery());
  }

  @Get('settlements/:id')
  @ApiOperation({ summary: 'Get a settlement instruction by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetSettlementInstructionQuery(id));
  }

  @Post('settlements/:id/match')
  @ApiOperation({ summary: 'Match a settlement instruction' })
  match(@Param('id') id: string) {
    return this.commandBus.execute(new MatchSettlementCommand(id));
  }

  @Post('settlements/:id/confirm')
  @ApiOperation({ summary: 'Confirm and settle a settlement instruction' })
  confirm(@Param('id') id: string) {
    return this.commandBus.execute(new ConfirmSettlementCommand(id));
  }

  @Post('settlements/:id/fail')
  @ApiOperation({ summary: 'Fail a settlement instruction' })
  fail(@Param('id') id: string, @Body() dto: FailSettlementDto) {
    return this.commandBus.execute(new FailSettlementCommand(id, dto));
  }
}
