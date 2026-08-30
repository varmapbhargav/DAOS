import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AnnounceCorporateActionCommand } from '../../../application/commands/announce-corporate-action.command';
import { ApproveDistributionCommand } from '../../../application/commands/approve-distribution.command';
import { ApproveWaterfallModelCommand } from '../../../application/commands/approve-waterfall-model.command';
import { CalculateDistributionCommand } from '../../../application/commands/calculate-distribution.command';
import { CloseElectionCommand } from '../../../application/commands/close-election.command';
import { CreateWaterfallModelCommand } from '../../../application/commands/create-waterfall-model.command';
import { DeclareDistributionCommand } from '../../../application/commands/declare-distribution.command';
import { ExecuteCorporateActionCommand } from '../../../application/commands/execute-corporate-action.command';
import { PayDistributionCommand } from '../../../application/commands/pay-distribution.command';
import {
  AnnounceCorporateActionDto,
  CalculateDistributionDto,
  CloseElectionDto,
  CreateWaterfallModelDto,
  DeclareDistributionDto,
} from '../../../application/dto/waterfall.dto';
import { GetCorporateActionQuery } from '../../../application/queries/get-corporate-action.query';
import { GetDistributionQuery } from '../../../application/queries/get-distribution.query';
import { GetWaterfallModelQuery } from '../../../application/queries/get-waterfall-model.query';
import { ListDistributionsQuery } from '../../../application/queries/list-distributions.query';
import { ListWaterfallModelsQuery } from '../../../application/queries/list-waterfall-models.query';

@ApiTags('waterfall')
@Controller()
export class WaterfallController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('waterfall-models')
  @ApiOperation({ summary: 'Create a waterfall model' })
  createWaterfallModel(@Body() dto: CreateWaterfallModelDto) {
    return this.commandBus.execute(new CreateWaterfallModelCommand(dto));
  }

  @Get('waterfall-models')
  @ApiOperation({ summary: 'List waterfall models' })
  listWaterfallModels(@Query('productId') productId?: string) {
    return this.queryBus.execute(new ListWaterfallModelsQuery(productId));
  }

  @Get('waterfall-models/:id')
  @ApiOperation({ summary: 'Get a waterfall model by id' })
  getWaterfallModel(@Param('id') id: string) {
    return this.queryBus.execute(new GetWaterfallModelQuery(id));
  }

  @Post('waterfall-models/:id/approve')
  @ApiOperation({ summary: 'Approve a waterfall model' })
  approveWaterfallModel(@Param('id') id: string) {
    return this.commandBus.execute(new ApproveWaterfallModelCommand(id));
  }

  @Post('distributions')
  @ApiOperation({ summary: 'Declare a distribution' })
  declareDistribution(@Body() dto: DeclareDistributionDto) {
    return this.commandBus.execute(new DeclareDistributionCommand(dto));
  }

  @Get('distributions')
  @ApiOperation({ summary: 'List distributions' })
  listDistributions(@Query('productId') productId?: string, @Query('status') status?: string) {
    return this.queryBus.execute(new ListDistributionsQuery(productId, status));
  }

  @Get('distributions/:id')
  @ApiOperation({ summary: 'Get a distribution by id' })
  getDistribution(@Param('id') id: string) {
    return this.queryBus.execute(new GetDistributionQuery(id));
  }

  @Post('distributions/:id/calculate')
  @ApiOperation({ summary: 'Calculate a distribution against the approved waterfall' })
  calculateDistribution(@Param('id') id: string, @Body() dto: CalculateDistributionDto) {
    return this.commandBus.execute(new CalculateDistributionCommand(id, dto));
  }

  @Post('distributions/:id/approve')
  @ApiOperation({ summary: 'Approve a distribution' })
  approveDistribution(@Param('id') id: string) {
    return this.commandBus.execute(new ApproveDistributionCommand(id));
  }

  @Post('distributions/:id/pay')
  @ApiOperation({ summary: 'Pay a distribution' })
  payDistribution(@Param('id') id: string) {
    return this.commandBus.execute(new PayDistributionCommand(id));
  }

  @Post('corporate-actions')
  @ApiOperation({ summary: 'Announce a corporate action' })
  announceCorporateAction(@Body() dto: AnnounceCorporateActionDto) {
    return this.commandBus.execute(new AnnounceCorporateActionCommand(dto));
  }

  @Get('corporate-actions/:id')
  @ApiOperation({ summary: 'Get a corporate action by id' })
  getCorporateAction(@Param('id') id: string) {
    return this.queryBus.execute(new GetCorporateActionQuery(id));
  }

  @Post('corporate-actions/:id/close-election')
  @ApiOperation({ summary: 'Close the election for a corporate action' })
  closeElection(@Param('id') id: string, @Body() dto: CloseElectionDto) {
    return this.commandBus.execute(new CloseElectionCommand(id, dto));
  }

  @Post('corporate-actions/:id/execute')
  @ApiOperation({ summary: 'Execute a corporate action' })
  executeCorporateAction(@Param('id') id: string) {
    return this.commandBus.execute(new ExecuteCorporateActionCommand(id));
  }
}
