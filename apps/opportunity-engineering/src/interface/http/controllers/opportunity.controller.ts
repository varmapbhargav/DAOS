import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AddScenarioCommand } from '../../../application/commands/add-scenario.command';
import { ApproveOpportunityCommand } from '../../../application/commands/approve-opportunity.command';
import { ApproveScenarioCommand } from '../../../application/commands/approve-scenario.command';
import { CalculateScenarioCommand } from '../../../application/commands/calculate-scenario.command';
import { EngineerOpportunityCommand } from '../../../application/commands/engineer-opportunity.command';
import { RejectOpportunityCommand } from '../../../application/commands/reject-opportunity.command';
import { RunMonteCarloCommand } from '../../../application/commands/run-monte-carlo.command';
import { ScoreOpportunityCommand } from '../../../application/commands/score-opportunity.command';
import { SetScenarioAssumptionsCommand } from '../../../application/commands/set-scenario-assumptions.command';
import { GetOpportunityQuery } from '../../../application/queries/get-opportunity.query';
import { GetScenarioModelQuery } from '../../../application/queries/get-scenario-model.query';
import { ListOpportunitiesQuery } from '../../../application/queries/list-opportunities.query';
import { AddScenarioDto, EngineerOpportunityDto, SetScenarioAssumptionsDto, RunMonteCarloDto } from '../../../application/dto/engineer-opportunity.dto';
import {
  ApproveOpportunityDto,
  RejectOpportunityDto,
  ScoreOpportunityDto,
} from '../../../application/dto/opportunity-action.dto';

@ApiTags('opportunities')
@Controller('opportunities')
export class OpportunityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Engineer a new opportunity from an asset' })
  engineer(@Body() dto: EngineerOpportunityDto) {
    return this.commandBus.execute(new EngineerOpportunityCommand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'List opportunities (optionally by asset)' })
  list(@Query('assetId') assetId?: string) {
    return this.queryBus.execute(new ListOpportunitiesQuery(assetId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an opportunity by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetOpportunityQuery(id));
  }

  @Post(':id/scenarios')
  @ApiOperation({ summary: 'Add a scenario model to an opportunity' })
  addScenario(@Param('id') id: string, @Body() dto: AddScenarioDto) {
    return this.commandBus.execute(new AddScenarioCommand(id, dto));
  }

  @Post(':id/scenarios/:scenarioId/assumptions')
  @ApiOperation({ summary: 'Set assumptions for a scenario' })
  setScenarioAssumptions(@Param('id') id: string, @Param('scenarioId') scenarioId: string, @Body() dto: SetScenarioAssumptionsDto) {
    return this.commandBus.execute(new SetScenarioAssumptionsCommand(id, scenarioId, dto.assumptions));
  }

  @Post(':id/scenarios/:scenarioId/calculate')
  @ApiOperation({ summary: 'Calculate financial model for a scenario' })
  calculateScenario(@Param('id') id: string, @Param('scenarioId') scenarioId: string) {
    return this.commandBus.execute(new CalculateScenarioCommand(id, scenarioId));
  }

  @Post(':id/scenarios/:scenarioId/monte-carlo')
  @ApiOperation({ summary: 'Run Monte Carlo simulation for a scenario' })
  runMonteCarlo(@Param('id') id: string, @Param('scenarioId') scenarioId: string, @Body() dto: RunMonteCarloDto) {
    return this.commandBus.execute(new RunMonteCarloCommand(id, scenarioId, dto.config));
  }

  @Get(':id/scenarios/:scenarioId')
  @ApiOperation({ summary: 'Get a scenario model by id' })
  getScenario(@Param('id') id: string, @Param('scenarioId') scenarioId: string) {
    return this.queryBus.execute(new GetScenarioModelQuery(scenarioId));
  }

  @Post(':id/scenarios/:scenarioId/approve')
  @ApiOperation({ summary: 'Approve a scenario model for an opportunity' })
  approveScenario(@Param('id') id: string, @Param('scenarioId') scenarioId: string) {
    return this.commandBus.execute(new ApproveScenarioCommand(id, scenarioId));
  }

  @Post(':id/score')
  @ApiOperation({ summary: 'Record a score for an opportunity' })
  score(@Param('id') id: string, @Body() dto: ScoreOpportunityDto) {
    return this.commandBus.execute(new ScoreOpportunityCommand(id, dto));
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve an opportunity' })
  approve(@Param('id') id: string, @Body() dto: ApproveOpportunityDto) {
    return this.commandBus.execute(new ApproveOpportunityCommand(id, dto.approvedBy));
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject an opportunity' })
  reject(@Param('id') id: string, @Body() dto: RejectOpportunityDto) {
    return this.commandBus.execute(new RejectOpportunityCommand(id, dto.reason));
  }
}
