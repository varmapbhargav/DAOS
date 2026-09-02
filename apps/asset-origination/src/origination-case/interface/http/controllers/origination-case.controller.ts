import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  AssessEngineeringReadinessCommand,
  CompleteApprovalCommand,
  CompleteEngineeringReadinessCommand,
  RecordApprovalDecisionCommand,
  RecordEngineeringCheckCommand,
  StartApprovalCommand,
} from '../../../../approval/application/commands/approval-readiness.commands';
import {
  AssessEngineeringReadinessDto,
  CompleteApprovalDto,
  RecordApprovalDecisionDto,
  RecordEngineeringCheckDto,
  StartApprovalDto,
} from '../../../../approval/application/dto/approval-readiness.dto';
import {
  GetApprovalByCaseQuery,
  GetEngineeringReadinessByCaseQuery,
  ListApprovalDecisionsByCaseQuery,
} from '../../../../approval/application/queries/approval-readiness.query';
import {
  AddDdFindingCommand,
  CompleteDueDiligenceCommand,
  StartDueDiligenceCommand,
  UpdateDdFindingCommand,
} from '../../../../due-diligence/application/commands/due-diligence.commands';
import {
  AddDdFindingDto,
  CompleteDueDiligenceDto,
  StartDueDiligenceDto,
  UpdateDdFindingDto,
} from '../../../../due-diligence/application/dto/due-diligence.dto';
import {
  GetDueDiligenceByCaseQuery,
  ListDdFindingsByCaseQuery,
} from '../../../../due-diligence/application/queries/due-diligence.query';
import {
  AddRiskItemCommand,
  CompleteRiskAssessmentCommand,
  CreateRiskAssessmentCommand,
  UpdateRiskItemCommand,
} from '../../../../risk/application/commands/risk.commands';
import {
  AddRiskItemDto,
  CompleteRiskAssessmentDto,
  CreateRiskAssessmentDto,
  UpdateRiskItemDto,
} from '../../../../risk/application/dto/risk.dto';
import {
  GetRiskAssessmentByCaseQuery,
  ListRiskItemsByCaseQuery,
} from '../../../../risk/application/queries/risk.query';
import {
  AssignBlockerCommand,
  CalculateCompletenessCommand,
  RaiseBlockerCommand,
  ResolveBlockerCommand,
} from '../../../../screening-qualification/application/commands/completeness-blocker.commands';
import {
  OverrideScreeningCommand,
  RunQualificationCommand,
  RunScreeningCommand,
} from '../../../../screening-qualification/application/commands/screening-qualification.commands';
import {
  AssignBlockerDto,
  CalculateCompletenessDto,
  RaiseBlockerDto,
  ResolveBlockerDto,
} from '../../../../screening-qualification/application/dto/completeness-blocker.dto';
import {
  OverrideScreeningDto,
  RunQualificationDto,
  RunScreeningDto,
} from '../../../../screening-qualification/application/dto/screening-qualification.dto';
import {
  GetCompletenessByCaseQuery,
  ListBlockersByCaseQuery,
} from '../../../../screening-qualification/application/queries/completeness-blocker.query';
import {
  GetQualificationByCaseQuery,
  GetScreeningByCaseQuery,
} from '../../../../screening-qualification/application/queries/screening-qualification.query';
import {
  ApproveValuationCommand,
  AssignValuerCommand,
  RejectValuationCommand,
  RequestValuationCommand,
  RevalueCommand,
  SubmitValuationForReviewCommand,
  UploadValuationCommand,
} from '../../../../valuation/application/commands/valuation.commands';
import {
  AssignValuerDto,
  RequestValuationDto,
  RevalueDto,
  ReviewValuationDto,
  UploadValuationDto,
} from '../../../../valuation/application/dto/valuation.dto';
import {
  GetValuationByCaseQuery,
  ListValuationsByCaseQuery,
} from '../../../../valuation/application/queries/valuation.query';
import {
  CompleteIntakeCommand,
  CreateOriginationCaseCommand,
  PutCaseOnHoldCommand,
  RejectCaseCommand,
  ResumeCaseCommand,
  SubmitCaseCommand,
  TransitionCaseCommand,
  UpdateOriginationCaseCommand,
  WithdrawCaseCommand,
} from '../../../application/commands/origination-case.commands';
import {
  CreateOriginationCaseDto,
  RejectCaseDto,
  ResumeCaseDto,
  UpdateOriginationCaseDto,
} from '../../../application/dto/origination-case.dto';
import {
  GetOriginationCaseByNumberQuery,
  GetOriginationCaseQuery,
  ListOriginationCasesQuery,
} from '../../../application/queries/origination-case.query';

@ApiTags('origination-cases')
@Controller('origination-cases')
export class OriginationCaseController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new originator intake case' })
  create(@Body() dto: CreateOriginationCaseDto) {
    return this.commandBus.execute(new CreateOriginationCaseCommand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'List origination cases' })
  list() {
    return this.queryBus.execute(new ListOriginationCasesQuery());
  }

  @Get('by-number/:caseNumber')
  @ApiOperation({ summary: 'Get an origination case by case number' })
  getByNumber(@Param('caseNumber') caseNumber: string) {
    return this.queryBus.execute(new GetOriginationCaseByNumberQuery(caseNumber));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an origination case' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetOriginationCaseQuery(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an origination case (assignment, next action)' })
  update(@Param('id') id: string, @Body() dto: UpdateOriginationCaseDto) {
    return this.commandBus.execute(new UpdateOriginationCaseCommand(id, dto));
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit a case for intake' })
  submit(@Param('id') id: string) {
    return this.commandBus.execute(new SubmitCaseCommand(id));
  }

  @Post(':id/intake')
  @ApiOperation({ summary: 'Complete intake for a case' })
  completeIntake(@Param('id') id: string) {
    return this.commandBus.execute(new CompleteIntakeCommand(id));
  }

  @Post(':id/transition')
  @ApiOperation({ summary: 'Transition a case to a target stage' })
  transition(@Param('id') id: string, @Body('action') action: string) {
    return this.commandBus.execute(new TransitionCaseCommand(id, action));
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a case' })
  reject(@Param('id') id: string, @Body() dto: RejectCaseDto) {
    return this.commandBus.execute(new RejectCaseCommand(id, dto));
  }

  @Post(':id/hold')
  @ApiOperation({ summary: 'Put a case on hold' })
  putOnHold(@Param('id') id: string, @Body('reason') reason: string) {
    return this.commandBus.execute(new PutCaseOnHoldCommand(id, reason));
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume a case from hold' })
  resume(@Param('id') id: string, @Body() dto: ResumeCaseDto) {
    return this.commandBus.execute(new ResumeCaseCommand(id, dto));
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw a case' })
  withdraw(@Param('id') id: string, @Body('reason') reason: string) {
    return this.commandBus.execute(new WithdrawCaseCommand(id, reason));
  }

  @Post(':id/screen')
  @ApiOperation({ summary: 'Run policy-driven screening and record the result' })
  screen(@Param('id') id: string, @Body() dto: RunScreeningDto) {
    return this.commandBus.execute(new RunScreeningCommand(id, dto));
  }

  @Get(':id/screening')
  @ApiOperation({ summary: 'Get the screening result for a case' })
  getScreening(@Param('id') id: string) {
    return this.queryBus.execute(new GetScreeningByCaseQuery(id));
  }

  @Post(':id/screening/override')
  @ApiOperation({ summary: 'Override a screening decision' })
  overrideScreening(@Param('id') id: string, @Body() dto: OverrideScreeningDto) {
    return this.commandBus.execute(new OverrideScreeningCommand(id, dto));
  }

  @Post(':id/qualify')
  @ApiOperation({ summary: 'Run policy-driven qualification and record the result' })
  qualify(@Param('id') id: string, @Body() dto: RunQualificationDto) {
    return this.commandBus.execute(new RunQualificationCommand(id, dto));
  }

  @Get(':id/qualification')
  @ApiOperation({ summary: 'Get the qualification result for a case' })
  getQualification(@Param('id') id: string) {
    return this.queryBus.execute(new GetQualificationByCaseQuery(id));
  }

  @Post(':id/completeness')
  @ApiOperation({ summary: 'Calculate and record asset completeness for a case' })
  calculateCompleteness(@Param('id') id: string, @Body() dto: CalculateCompletenessDto) {
    return this.commandBus.execute(new CalculateCompletenessCommand(id, dto));
  }

  @Get(':id/completeness')
  @ApiOperation({ summary: 'Get the completeness result for a case' })
  getCompleteness(@Param('id') id: string) {
    return this.queryBus.execute(new GetCompletenessByCaseQuery(id));
  }

  @Post(':id/blockers')
  @ApiOperation({ summary: 'Raise a blocker against a case' })
  raiseBlocker(@Param('id') id: string, @Body() dto: RaiseBlockerDto) {
    return this.commandBus.execute(new RaiseBlockerCommand(id, dto));
  }

  @Get(':id/blockers')
  @ApiOperation({ summary: 'List blockers for a case' })
  listBlockers(@Param('id') id: string) {
    return this.queryBus.execute(new ListBlockersByCaseQuery(id));
  }

  @Patch('blockers/:blockerId')
  @ApiOperation({ summary: 'Assign a blocker (owner, due date, resolution action)' })
  assignBlocker(@Param('blockerId') blockerId: string, @Body() dto: AssignBlockerDto) {
    return this.commandBus.execute(new AssignBlockerCommand(blockerId, dto));
  }

  @Post('blockers/:blockerId/resolve')
  @ApiOperation({ summary: 'Resolve or waive a blocker' })
  resolveBlocker(@Param('blockerId') blockerId: string, @Body() dto: ResolveBlockerDto) {
    return this.commandBus.execute(new ResolveBlockerCommand(blockerId, dto));
  }

  @Post(':id/due-diligence')
  @ApiOperation({ summary: 'Start due diligence for a case' })
  startDueDiligence(@Param('id') id: string, @Body() dto: StartDueDiligenceDto) {
    return this.commandBus.execute(new StartDueDiligenceCommand(id, dto));
  }

  @Get(':id/due-diligence')
  @ApiOperation({ summary: 'Get the due diligence case for an origination case' })
  getDueDiligence(@Param('id') id: string) {
    return this.queryBus.execute(new GetDueDiligenceByCaseQuery(id));
  }

  @Post(':id/due-diligence/findings')
  @ApiOperation({ summary: 'Add a due diligence finding to a case' })
  addDdFinding(@Param('id') id: string, @Body() dto: AddDdFindingDto) {
    return this.commandBus.execute(new AddDdFindingCommand(id, dto));
  }

  @Get(':id/due-diligence/findings')
  @ApiOperation({ summary: 'List due diligence findings for a case' })
  listDdFindings(@Param('id') id: string) {
    return this.queryBus.execute(new ListDdFindingsByCaseQuery(id));
  }

  @Patch('due-diligence/findings/:findingId')
  @ApiOperation({ summary: 'Update a due diligence finding' })
  updateDdFinding(@Param('findingId') findingId: string, @Body() dto: UpdateDdFindingDto) {
    return this.commandBus.execute(new UpdateDdFindingCommand(findingId, dto));
  }

  @Post(':id/due-diligence/complete')
  @ApiOperation({ summary: 'Complete due diligence and advance the case to valuation' })
  completeDueDiligence(@Param('id') id: string, @Body() dto: CompleteDueDiligenceDto) {
    return this.commandBus.execute(new CompleteDueDiligenceCommand(id, dto));
  }

  @Post(':id/risk-assessment')
  @ApiOperation({ summary: 'Create an asset-level risk assessment for a case' })
  createRiskAssessment(@Param('id') id: string, @Body() dto: CreateRiskAssessmentDto) {
    return this.commandBus.execute(new CreateRiskAssessmentCommand(id, dto));
  }

  @Get(':id/risk-assessment')
  @ApiOperation({ summary: 'Get the asset-level risk assessment for a case' })
  getRiskAssessment(@Param('id') id: string) {
    return this.queryBus.execute(new GetRiskAssessmentByCaseQuery(id));
  }

  @Post(':id/risk-assessment/items')
  @ApiOperation({ summary: 'Add a risk item to an asset risk assessment' })
  addRiskItem(@Param('id') id: string, @Body() dto: AddRiskItemDto) {
    return this.commandBus.execute(new AddRiskItemCommand(id, dto));
  }

  @Get(':id/risk-assessment/items')
  @ApiOperation({ summary: 'List risk items for a case' })
  listRiskItems(@Param('id') id: string) {
    return this.queryBus.execute(new ListRiskItemsByCaseQuery(id));
  }

  @Patch('risk-assessment/items/:riskItemId')
  @ApiOperation({ summary: 'Update a risk item' })
  updateRiskItem(@Param('riskItemId') riskItemId: string, @Body() dto: UpdateRiskItemDto) {
    return this.commandBus.execute(new UpdateRiskItemCommand(riskItemId, dto));
  }

  @Post(':id/risk-assessment/complete')
  @ApiOperation({ summary: 'Complete the risk assessment and advance the case to ready for approval' })
  completeRiskAssessment(@Param('id') id: string, @Body() dto: CompleteRiskAssessmentDto) {
    return this.commandBus.execute(new CompleteRiskAssessmentCommand(id, dto));
  }

  @Post(':id/valuation')
  @ApiOperation({ summary: 'Request a valuation for a case' })
  requestValuation(@Param('id') id: string, @Body() dto: RequestValuationDto) {
    return this.commandBus.execute(new RequestValuationCommand(id, dto));
  }

  @Get(':id/valuation')
  @ApiOperation({ summary: 'Get the latest valuation for a case' })
  getValuation(@Param('id') id: string) {
    return this.queryBus.execute(new GetValuationByCaseQuery(id));
  }

  @Get(':id/valuations')
  @ApiOperation({ summary: 'List all valuations for a case (history)' })
  listValuations(@Param('id') id: string) {
    return this.queryBus.execute(new ListValuationsByCaseQuery(id));
  }

  @Post(':id/valuation/assign')
  @ApiOperation({ summary: 'Assign a valuer to the valuation' })
  assignValuer(@Param('id') id: string, @Body() dto: AssignValuerDto) {
    return this.commandBus.execute(new AssignValuerCommand(id, dto));
  }

  @Post(':id/valuation/upload')
  @ApiOperation({ summary: 'Upload valuation data' })
  uploadValuation(@Param('id') id: string, @Body() dto: UploadValuationDto) {
    return this.commandBus.execute(new UploadValuationCommand(id, dto));
  }

  @Post(':id/valuation/submit-review')
  @ApiOperation({ summary: 'Submit valuation for review' })
  submitValuationForReview(@Param('id') id: string) {
    return this.commandBus.execute(new SubmitValuationForReviewCommand(id));
  }

  @Post(':id/valuation/approve')
  @ApiOperation({ summary: 'Approve the valuation and advance to risk review' })
  approveValuation(@Param('id') id: string, @Body() dto: ReviewValuationDto) {
    return this.commandBus.execute(new ApproveValuationCommand(id, dto));
  }

  @Post(':id/valuation/reject')
  @ApiOperation({ summary: 'Reject the valuation' })
  rejectValuation(@Param('id') id: string, @Body() dto: ReviewValuationDto) {
    return this.commandBus.execute(new RejectValuationCommand(id, dto));
  }

  @Post(':id/valuation/revalue')
  @ApiOperation({ summary: 'Revalue after rejection' })
  revalue(@Param('id') id: string, @Body() dto: RevalueDto) {
    return this.commandBus.execute(new RevalueCommand(id, dto));
  }

  @Post(':id/approval')
  @ApiOperation({ summary: 'Start approval process for a case' })
  startApproval(@Param('id') id: string, @Body() dto: StartApprovalDto) {
    return this.commandBus.execute(new StartApprovalCommand(id, dto));
  }

  @Get(':id/approval')
  @ApiOperation({ summary: 'Get the approval case for an origination case' })
  getApproval(@Param('id') id: string) {
    return this.queryBus.execute(new GetApprovalByCaseQuery(id));
  }

  @Post(':id/approval/decisions')
  @ApiOperation({ summary: 'Record an approval decision' })
  recordApprovalDecision(@Param('id') id: string, @Body() dto: RecordApprovalDecisionDto) {
    return this.commandBus.execute(new RecordApprovalDecisionCommand(id, dto));
  }

  @Get(':id/approval/decisions')
  @ApiOperation({ summary: 'List approval decisions for a case' })
  listApprovalDecisions(@Param('id') id: string) {
    return this.queryBus.execute(new ListApprovalDecisionsByCaseQuery(id));
  }

  @Post(':id/approval/complete')
  @ApiOperation({ summary: 'Complete the approval process' })
  completeApproval(@Param('id') id: string, @Body() dto: CompleteApprovalDto) {
    return this.commandBus.execute(new CompleteApprovalCommand(id, dto));
  }

  @Post(':id/engineering-readiness')
  @ApiOperation({ summary: 'Create engineering readiness assessment for a case' })
  assessEngineeringReadiness(@Param('id') id: string, @Body() dto: AssessEngineeringReadinessDto) {
    return this.commandBus.execute(new AssessEngineeringReadinessCommand(id, dto));
  }

  @Get(':id/engineering-readiness')
  @ApiOperation({ summary: 'Get the engineering readiness assessment for a case' })
  getEngineeringReadiness(@Param('id') id: string) {
    return this.queryBus.execute(new GetEngineeringReadinessByCaseQuery(id));
  }

  @Post(':id/engineering-readiness/checks')
  @ApiOperation({ summary: 'Record an engineering readiness check result' })
  recordEngineeringCheck(@Param('id') id: string, @Body() dto: RecordEngineeringCheckDto) {
    return this.commandBus.execute(new RecordEngineeringCheckCommand(id, dto));
  }

  @Post(':id/engineering-readiness/complete')
  @ApiOperation({ summary: 'Complete engineering readiness and publish AssetEngineeringReady event' })
  completeEngineeringReadiness(@Param('id') id: string) {
    return this.commandBus.execute(new CompleteEngineeringReadinessCommand(id));
  }
}
