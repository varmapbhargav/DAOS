import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreditHoldingCommand } from '../../../application/commands/credit-holding.command';
import { OpenCustodyAccountCommand } from '../../../application/commands/open-custody-account.command';
import { CreditHoldingDto, OpenCustodyAccountDto } from '../../../application/dto/settlement.dto';
import { GetCustodyAccountQuery } from '../../../application/queries/get-custody-account.query';

@ApiTags('custody')
@Controller()
export class CustodyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('custody/accounts')
  @ApiOperation({ summary: 'Open a custody account' })
  open(@Body() dto: OpenCustodyAccountDto) {
    return this.commandBus.execute(new OpenCustodyAccountCommand(dto));
  }

  @Get('custody/accounts/:id')
  @ApiOperation({ summary: 'Get a custody account by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetCustodyAccountQuery(id));
  }

  @Post('custody/accounts/:id/holdings/credit')
  @ApiOperation({ summary: 'Credit a holding to a custody account' })
  credit(@Param('id') id: string, @Body() dto: CreditHoldingDto) {
    return this.commandBus.execute(new CreditHoldingCommand(id, dto));
  }
}
