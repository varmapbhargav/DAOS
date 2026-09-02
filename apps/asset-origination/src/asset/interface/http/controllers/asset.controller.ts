import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApproveAssetCommand } from '../../../application/commands/approve-asset.command';
import { CompleteDueDiligenceCommand } from '../../../application/commands/complete-due-diligence.command';
import { CompleteRiskReviewCommand } from '../../../application/commands/complete-risk-review.command';
import { CompleteScreeningCommand } from '../../../application/commands/complete-screening.command';
import { CompleteValuationCommand } from '../../../application/commands/complete-valuation.command';
import { CreateAssetDraftCommand } from '../../../application/commands/create-asset-draft.command';
import { HandoffToDealStudioCommand } from '../../../application/commands/handoff-to-deal-studio.command';
import { OriginateAssetCommand } from '../../../application/commands/originate-asset.command';
import { PutAssetOnHoldCommand } from '../../../application/commands/put-asset-on-hold.command';
import { QualifyAssetCommand } from '../../../application/commands/qualify-asset.command';
import { RejectAssetCommand } from '../../../application/commands/reject-asset.command';
import { ResumeAssetCommand } from '../../../application/commands/resume-asset.command';
import { StartDueDiligenceCommand } from '../../../application/commands/start-due-diligence.command';
import { StartRiskReviewCommand } from '../../../application/commands/start-risk-review.command';
import { StartScreeningCommand } from '../../../application/commands/start-screening.command';
import { StartValuationCommand } from '../../../application/commands/start-valuation.command';
import { SubmitDueDiligenceCommand } from '../../../application/commands/submit-due-diligence.command';
import { UpdateValuationCommand } from '../../../application/commands/update-valuation.command';
import { WithdrawAssetCommand } from '../../../application/commands/withdraw-asset.command';
import {
  ApproveAssetDto,
  CompleteDueDiligenceDto,
  CompleteRiskReviewDto,
  CompleteValuationDto,
  CreateAssetDraftDto,
  PutAssetOnHoldDto,
  RejectAssetDto,
  UpdateValuationDto,
  WithdrawAssetDto,
} from '../../../application/dto/asset-action.dto';
import { OriginateAssetDto } from '../../../application/dto/originate-asset.dto';
import { GetAssetQuery } from '../../../application/queries/get-asset.query';
import { GetAssetLifecycleHistoryQuery } from '../../../application/queries/get-asset-lifecycle-history.query';
import { GetAssetPipelineMetricsQuery } from '../../../application/queries/get-asset-pipeline-metrics.query';
import { ListAssetsQuery } from '../../../application/queries/list-assets.query';

@ApiTags('assets')
@Controller('assets')
export class AssetController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Originate a new asset' })
  originate(@Body() dto: OriginateAssetDto) {
    return this.commandBus.execute(new OriginateAssetCommand(dto));
  }

  @Post('draft')
  @ApiOperation({ summary: 'Create a new asset in DRAFT status' })
  createDraft(@Body() dto: CreateAssetDraftDto) {
    return this.commandBus.execute(new CreateAssetDraftCommand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'List assets (filterable by class, status, jurisdiction, text search)' })
  list(
    @Query('assetClass') assetClass?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('jurisdiction') jurisdiction?: string,
  ) {
    return this.queryBus.execute(new ListAssetsQuery(assetClass, search, status, jurisdiction));
  }

  @Get('pipeline/metrics')
  @ApiOperation({ summary: 'Get asset pipeline funnel metrics' })
  pipelineMetrics() {
    return this.queryBus.execute(new GetAssetPipelineMetricsQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an asset by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetAssetQuery(id));
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get the lifecycle timeline of an asset' })
  timeline(@Param('id') id: string) {
    return this.queryBus.execute(new GetAssetLifecycleHistoryQuery(id));
  }

  @Post(':id/screening/start')
  @ApiOperation({ summary: 'Start screening for an asset' })
  startScreening(@Param('id') id: string) {
    return this.commandBus.execute(new StartScreeningCommand(id));
  }

  @Post(':id/screening/complete')
  @ApiOperation({ summary: 'Complete screening and qualify an asset' })
  completeScreening(@Param('id') id: string) {
    return this.commandBus.execute(new CompleteScreeningCommand(id));
  }

  @Post(':id/qualify')
  @ApiOperation({ summary: 'Qualify an asset' })
  qualify(@Param('id') id: string) {
    return this.commandBus.execute(new QualifyAssetCommand(id));
  }

  @Post(':id/due-diligence/start')
  @ApiOperation({ summary: 'Start due diligence for an asset' })
  startDueDiligence(@Param('id') id: string) {
    return this.commandBus.execute(new StartDueDiligenceCommand(id));
  }

  @Post(':id/due-diligence/submit')
  @ApiOperation({ summary: 'Submit due diligence for an asset' })
  submitDueDiligence(@Param('id') id: string) {
    return this.commandBus.execute(new SubmitDueDiligenceCommand(id));
  }

  @Post(':id/due-diligence/complete')
  @ApiOperation({ summary: 'Complete due diligence with a rating' })
  completeDueDiligence(@Param('id') id: string, @Body() dto: CompleteDueDiligenceDto) {
    return this.commandBus.execute(new CompleteDueDiligenceCommand(id, dto));
  }

  @Post(':id/valuation/start')
  @ApiOperation({ summary: 'Start valuation for an asset' })
  startValuation(@Param('id') id: string) {
    return this.commandBus.execute(new StartValuationCommand(id));
  }

  @Post(':id/valuation/complete')
  @ApiOperation({ summary: 'Complete valuation for an asset' })
  completeValuation(@Param('id') id: string, @Body() dto: CompleteValuationDto) {
    return this.commandBus.execute(new CompleteValuationCommand(id, dto));
  }

  @Put(':id/valuation')
  @ApiOperation({ summary: 'Update the valuation for an asset' })
  updateValuation(@Param('id') id: string, @Body() dto: UpdateValuationDto) {
    return this.commandBus.execute(new UpdateValuationCommand(id, dto));
  }

  @Post(':id/risk-review/start')
  @ApiOperation({ summary: 'Start risk review for an asset' })
  startRiskReview(@Param('id') id: string) {
    return this.commandBus.execute(new StartRiskReviewCommand(id));
  }

  @Post(':id/risk-review/complete')
  @ApiOperation({ summary: 'Complete risk review for an asset' })
  completeRiskReview(@Param('id') id: string, @Body() dto: CompleteRiskReviewDto) {
    return this.commandBus.execute(new CompleteRiskReviewCommand(id, dto));
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve an asset for issuance' })
  approve(@Param('id') id: string, @Body() dto: ApproveAssetDto) {
    return this.commandBus.execute(new ApproveAssetCommand(id, dto.approvedBy));
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject an asset' })
  reject(@Param('id') id: string, @Body() dto: RejectAssetDto) {
    return this.commandBus.execute(new RejectAssetCommand(id, dto.reason));
  }

  @Post(':id/hold')
  @ApiOperation({ summary: 'Put an asset on hold' })
  putOnHold(@Param('id') id: string, @Body() dto: PutAssetOnHoldDto) {
    return this.commandBus.execute(new PutAssetOnHoldCommand(id, dto.reason));
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume an asset from hold' })
  resume(@Param('id') id: string) {
    return this.commandBus.execute(new ResumeAssetCommand(id));
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw an asset' })
  withdraw(@Param('id') id: string, @Body() dto: WithdrawAssetDto) {
    return this.commandBus.execute(new WithdrawAssetCommand(id, dto.reason));
  }

  @Post(':id/handoff')
  @ApiOperation({ summary: 'Hand off an asset to Deal Studio' })
  handoffToDealStudio(@Param('id') id: string) {
    return this.commandBus.execute(new HandoffToDealStudioCommand(id));
  }
}