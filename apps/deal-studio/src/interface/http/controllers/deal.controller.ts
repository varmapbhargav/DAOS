import { Body, Controller, Get, Param, Post, Put, Query, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CorrelationId } from '@daos/shared-kernel';

import { ApproveDealCommand } from '../../../application/commands/approve-deal.command';
import { CancelDealCommand } from '../../../application/commands/cancel-deal.command';
import { CloseDealCommand } from '../../../application/commands/close-deal.command';
import { FinalizeTermSheetCommand } from '../../../application/commands/finalize-term-sheet.command';
import { MeetClosingConditionCommand } from '../../../application/commands/meet-closing-condition.command';
import { StartStructuringCommand } from '../../../application/commands/start-structuring.command';
import { StructureDealCommand } from '../../../application/commands/structure-deal.command';
import { UpdateCapitalStackCommand } from '../../../application/commands/update-capital-stack.command';
import { UpdateDealCommand } from '../../../application/commands/update-deal.command';
import { SubmitForLegalReviewCommand } from '../../../application/commands/submit-for-legal-review.command';
import { SubmitForApprovalCommand } from '../../../application/commands/submit-for-approval.command';
import { CloseConditionsSubmitCommand } from '../../../application/commands/close-conditions-submit.command';
import { CloseConditionsVerifyCommand } from '../../../application/commands/close-conditions-verify.command';
import { CloseConditionsWaiveCommand } from '../../../application/commands/close-conditions-waive.command';
import { CloseStartCommand } from '../../../application/commands/close-start.command';
import { PutOnHoldCommand } from '../../../application/commands/put-on-hold.command';
import { ResumeCommand } from '../../../application/commands/resume.command';
import {
  ApproveDealDto,
  CancelDealDto,
  CloseDealDto,
  FinalizeTermSheetDto,
  MeetClosingConditionDto,
  UpdateCapitalStackDto,
  UpdateDealDto,
} from '../../../application/dto/deal-action.dto';
import { StructureDealDto } from '../../../application/dto/structure-deal.dto';
import { GetDealQuery } from '../../../application/queries/get-deal.query';
import { GetTermSheetQuery } from '../../../application/queries/get-term-sheet.query';
import { ListDealsQuery } from '../../../application/queries/list-deals.query';
import { CreateDealDto } from '../../../application/dto/create-deal.dto';
import { GetDealSummaryQuery } from '../../../application/queries/get-deal-summary.query';
import { GetDealTimelineQuery } from '../../../application/queries/get-deal-timeline.query';
import { GetDealParticipantsQuery } from '../../../application/queries/get-deal-participants.query';
import { GetDealCapitalStackQuery } from '../../../application/queries/get-deal-capital-stack.query';
import { GetDealEconomicsQuery } from '../../../application/queries/get-deal-economics.query';
import { GetDealWaterfallQuery } from '../../../application/queries/get-deal-waterfall.query';
import { GetTermSheetVersionsQuery } from '../../../application/queries/get-term-sheet-versions.query';
import { GetDealClosingConditionsQuery } from '../../../application/queries/get-deal-closing-conditions.query';
import { GetDealDocumentsQuery } from '../../../application/queries/get-deal-documents.query';
import { GetDealStatusHistoryQuery } from '../../../application/queries/get-deal-status-history.query';
import { PipelineDealsQuery } from '../../../application/queries/pipeline-deals.query';

@ApiTags('deals')
@Controller('deals')
private readonly logger = new Logger(DealController.name);

export class DealController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new deal' })
  create(@Body() dto: CreateDealDto) {
    const correlationId = CorrelationId.create();
    this.logger.log(`Deal create started | correlationId=${correlationId.value} | actor=${TenantContextHolder.get().userId}`);
    return this.commandBus.execute(new StructureDealCommand(dto));
  }

  @Post()
  @ApiOperation({ summary: 'Structure a new deal' })
  structure(@Body() dto: StructureDealDto) {
    const correlationId = CorrelationId.create();
    this.logger.log(`Deal structure started | correlationId=${correlationId.value} | actor=${TenantContextHolder.get().userId}`);
    return this.commandBus.execute(new StructureDealCommand(dto));
  }

  @Post(':id/structuring/start')
  @ApiOperation({ summary: 'Start structuring a deal' })
  startStructuring(@Param('id') id: string, @Body() /* no body needed */) {
    return this.commandBus.execute(new StartStructuringCommand(id, 'actor-uuid'));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a deal' })
  update(@Param('id') id: string, @Body() dto: UpdateDealDto) {
    const correlationId = CorrelationId.create();
    this.logger.log(`Deal update started | correlationId=${correlationId.value} | dealId=${id} | actor=${TenantContextHolder.get().userId}`);
    return this.commandBus.execute(new UpdateDealCommand(id, dto));
  }

  @Post(':id/term-sheet')
  @ApiOperation({ summary: 'Submit term sheet for a deal' })
  submitTermSheet(@Param('id') id: string, @Body() /* no body needed */) {
    return this.commandBus.execute(new FinalizeTermSheetCommand(id, 'actor-uuid'));
  }

  @Post(':id/term-sheet/finalize')
  @ApiOperation({ summary: 'Finalize the term sheet of a deal' })
  finalizeTermSheet(@Param('id') id: string, @Body() /* no body needed */) {
    return this.commandBus.execute(new FinalizeTermSheetCommand(id, 'actor-uuid'));
  }

  @Post(':id/legal-review/submit')
  @ApiOperation({ summary: 'Submit deal for legal review' })
  submitForLegalReview(@Param('id') id: string, @Body() /* no body needed */) {
    return this.commandBus.execute(new SubmitForLegalReviewCommand(id, 'actor-uuid'));
  }

  @Post(':id/approval/submit')
  @ApiOperation({ summary: 'Submit deal for approval' })
  submitForApproval(@Param('id') id: string, @Body() /* no body needed */) {
    return this.commandBus.execute(new SubmitForApprovalCommand(id, 'actor-uuid', 'workflow-uuid'));
  }

  @Post(':id/closing-conditions')
  @ApiOperation({ summary: 'Mark a closing condition as met' })
  meetClosingCondition(@Param('id') id: string, @Body() dto: MeetClosingConditionDto) {
    return this.commandBus.execute(new MeetClosingConditionCommand(id, dto));
  }

  @Post(':id/closing-conditions/submit')
  @ApiOperation({ summary: 'Submit a closing condition' })
  closeConditionSubmit(@Param('id') id: string, @Body() dto: CloseConditionsSubmitDto) {
    return this.commandBus.execute(new CloseConditionsSubmitCommand(id, dto.conditionId, dto.actorId, dto.evidenceRef));
  }

  @Post(':id/closing-conditions/{conditionId}/verify')
  @ApiOperation({ summary: 'Verify a closing condition' })
  closeConditionVerify(@Param('id') id: string, @Param('conditionId') conditionId: string, @Body() dto: CloseConditionsVerifyDto) {
    return this.commandBus.execute(new CloseConditionsVerifyCommand(id, conditionId, dto.verifiedBy, dto.evidenceRef));
  }

  @Post(':id/closing-conditions/{conditionId}/waive')
  @ApiOperation({ summary: 'Waive a closing condition' })
  closeConditionWaive(@Param('id') id: string, @Param('conditionId') conditionId: string, @Body() dto: CloseConditionsWaiveDto) {
    return this.commandBus.execute(new CloseConditionsWaiveCommand(id, conditionId, dto.waivedBy, dto.reason));
  }

  @Post(':id/closing/start')
  @ApiOperation({ summary: 'Start the closing process' })
  closeStart(@Param('id') id: string, @Body() /* no body needed */) {
    const correlationId = CorrelationId.create();
    this.logger.log(`Deal close start | correlationId=${correlationId.value} | dealId=${id} | actor=${TenantContextHolder.get().userId}`);
    return this.commandBus.execute(new CloseStartCommand(id, 'actor-uuid'));
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close a deal' })
  close(@Param('id') id: string, @Body() dto: CloseDealDto) {
    const correlationId = CorrelationId.create();
    this.logger.log(`Deal close | correlationId=${correlationId.value} | dealId=${id} | actor=${TenantContextHolder.get().userId}`);
    return this.commandBus.execute(new CloseDealCommand(id, dto));
  }

  @Post(':id/hold')
  @ApiOperation({ summary: 'Put a deal on hold' })
  hold(@Param('id') id: string, @Body() dto: PutOnHoldDto) {
    const correlationId = CorrelationId.create();
    this.logger.log(`Deal put on hold | correlationId=${correlationId.value} | dealId=${id} | actor=${dto.actorId}`);
    return this.commandBus.execute(new PutOnHoldCommand(id, dto.actorId, dto.holdReason));
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume a deal from hold' })
  resume(@Param('id') id: string, @Body() /* no body needed */) {
    const correlationId = CorrelationId.create();
    this.logger.log(`Deal resume | correlationId=${correlationId.value} | dealId=${id} | actor=${TenantContextHolder.get().userId}`);
    return this.commandBus.execute(new ResumeCommand(id, 'actor-uuid'));
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a deal' })
  cancel(@Param('id') id: string, @Body() dto: CancelDealDto) {
    const correlationId = CorrelationId.create();
    this.logger.log(`Deal cancel | correlationId=${correlationId.value} | dealId=${id} | actor=${dto.actorId}`);
    return this.commandBus.execute(new CancelDealCommand(id, dto));
  }

  // Query endpoints

  @Get()
  @ApiOperation({ summary: 'List deals (optionally by status)' })
  list(@Query('status') status?: string) {
    return this.queryBus.execute(new ListDealsQuery(status));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a deal by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetDealQuery(id));
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get deal summary' })
  summary(@Param('id') id: string) {
    return this.queryBus.execute(new GetDealSummaryQuery(id));
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get deal timeline' })
  timeline(@Param('id') id: string) {
    return this.queryBus.execute(new GetDealTimelineQuery(id));
  }

  @Get(':id/participants')
  @ApiOperation({ summary: 'Get deal participants' })
  participants(@Param('id') id: string) {
    return this.queryBus.execute(new GetDealParticipantsQuery(id));
  }

  @Get(':id/capital-stack')
  @ApiOperation({ summary: 'Get deal capital stack' })
  capitalStack(@Param('id') id: string) {
    return this.queryBus.execute(new GetDealCapitalStackQuery(id));
  }

  @Get(':id/economics')
  @ApiOperation({ summary: 'Get deal economics' })
  economics(@Param('id') id: string) {
    return this.queryBus.execute(new GetDealEconomicsQuery(id));
  }

  @Get(':id/waterfall')
  @ApiOperation({ summary: 'Get deal waterfall' })
  waterfall(@Param('id') id: string) {
    return this.queryBus.execute(new GetDealWaterfallQuery(id));
  }

  @Get(':id/term-sheet')
  @ApiOperation({ summary: 'Get the term sheet for a deal' })
  termSheet(@Param('id') id: string) {
    return this.queryBus.execute(new GetTermSheetQuery(id));
  }

  @Get(':id/term-sheet/versions')
  @ApiOperation({ summary: 'Get term sheet versions' })
  termSheetVersions(@Param('id') id: string) {
    return this.queryBus.execute(new GetTermSheetVersionsQuery(id));
  }

  @Get(':id/closing-conditions')
  @ApiOperation({ summary: 'Get deal closing conditions' })
  closingConditions(@Param('id') id: string) {
    return this.queryBus.execute(new GetDealClosingConditionsQuery(id));
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Get deal documents' })
  documents(@Param('id') id: string) {
    return this.queryBus.execute(new GetDealDocumentsQuery(id));
  }

  @Get(':id/status-history')
  @ApiOperation({ summary: 'Get deal status history' })
  statusHistory(@Param('id') id: string) {
    return this.queryBus.execute(new GetDealStatusHistoryQuery(id));
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Get deal pipeline distribution' })
  pipeline() {
    return this.queryBus.execute(new PipelineDealsQuery());
  }
}
