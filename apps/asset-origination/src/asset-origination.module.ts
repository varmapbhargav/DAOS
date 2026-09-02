import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  AssessEngineeringReadinessHandler,
  CompleteApprovalHandler,
  CompleteEngineeringReadinessHandler,
  RecordApprovalDecisionHandler,
  RecordEngineeringCheckHandler,
  StartApprovalHandler,
} from './approval/application/commands/approval-readiness.commands';
import {
  GetApprovalByCaseHandler,
  GetEngineeringReadinessByCaseHandler,
  ListApprovalDecisionsByCaseHandler,
} from './approval/application/queries/approval-readiness.query';
import { ApprovalCaseOrmEntity } from './approval/infrastructure/persistence/entities/approval-case.orm-entity';
import { ApprovalDecisionOrmEntity } from './approval/infrastructure/persistence/entities/approval-decision.orm-entity';
import { EngineeringReadinessOrmEntity } from './approval/infrastructure/persistence/entities/engineering-readiness.orm-entity';
import { PostgresApprovalCaseRepository } from './approval/infrastructure/persistence/postgres-approval-case.repository';
import { PostgresApprovalDecisionRepository } from './approval/infrastructure/persistence/postgres-approval-decision.repository';
import { PostgresEngineeringReadinessRepository } from './approval/infrastructure/persistence/postgres-engineering-readiness.repository';
import { ApproveAssetHandler } from './asset/application/commands/approve-asset.command';
import { CompleteDueDiligenceHandler } from './asset/application/commands/complete-due-diligence.command';
import { CompleteRiskReviewHandler } from './asset/application/commands/complete-risk-review.command';
import { CompleteScreeningHandler } from './asset/application/commands/complete-screening.command';
import { CompleteValuationHandler } from './asset/application/commands/complete-valuation.command';
import { CreateAssetDraftHandler } from './asset/application/commands/create-asset-draft.command';
import { HandoffToDealStudioHandler } from './asset/application/commands/handoff-to-deal-studio.command';
import { OriginateAssetHandler } from './asset/application/commands/originate-asset.command';
import { PutAssetOnHoldHandler } from './asset/application/commands/put-asset-on-hold.command';
import { QualifyAssetHandler } from './asset/application/commands/qualify-asset.command';
import { RejectAssetHandler } from './asset/application/commands/reject-asset.command';
import { ResumeAssetHandler } from './asset/application/commands/resume-asset.command';
import { StartDueDiligenceHandler } from './asset/application/commands/start-due-diligence.command';
import { StartRiskReviewHandler } from './asset/application/commands/start-risk-review.command';
import { StartScreeningHandler } from './asset/application/commands/start-screening.command';
import { StartValuationHandler } from './asset/application/commands/start-valuation.command';
import { SubmitDueDiligenceHandler } from './asset/application/commands/submit-due-diligence.command';
import { SubmitForApprovalHandler } from './asset/application/commands/submit-for-approval.command';
import { UpdateValuationHandler } from './asset/application/commands/update-valuation.command';
import { WithdrawAssetHandler } from './asset/application/commands/withdraw-asset.command';
import { GetAssetHandler } from './asset/application/queries/get-asset.query';
import { GetAssetLifecycleHistoryHandler } from './asset/application/queries/get-asset-lifecycle-history.query';
import { GetAssetPipelineMetricsHandler } from './asset/application/queries/get-asset-pipeline-metrics.query';
import { GetDueDiligenceReportHandler } from './asset/application/queries/get-due-diligence-report.query';
import { ListAssetsHandler } from './asset/application/queries/list-assets.query';
import { AssetOrmEntity } from './asset/infrastructure/persistence/entities/asset.orm-entity';
import { AssetLifecycleHistoryOrmEntity } from './asset/infrastructure/persistence/entities/asset-lifecycle-history.orm-entity';
import { SponsorReferenceOrmEntity } from './asset/infrastructure/persistence/entities/sponsor-reference.orm-entity';
import { PostgresAssetRepository } from './asset/infrastructure/persistence/postgres-asset.repository';
import { PostgresAssetLifecycleHistoryRepository } from './asset/infrastructure/persistence/postgres-asset-lifecycle-history.repository';
import { PostgresSponsorReferenceRepository } from './asset/infrastructure/persistence/postgres-sponsor-reference.repository';
import { AssetController } from './asset/interface/http/controllers/asset.controller';
import { DueDiligenceController } from './asset/interface/http/controllers/due-diligence.controller';
import {
  AddAssetToPoolHandler,
  ChangePoolStatusHandler,
  CheckEligibilityHandler,
  CreateAssetPoolHandler,
  MergePoolsHandler,
  RebalancePoolHandler,
  RemoveAssetFromPoolHandler,
  SetParentPoolHandler,
  SplitPoolHandler,
  UpdateAssetAllocationHandler,
  UpdateAssetPoolHandler,
  UpdateConcentrationRulesHandler,
  UpdateEligibilityPolicyHandler,
} from './asset-pool/application/commands/asset-pool.commands';
import {
  GetAssetPoolByNameHandler,
  GetAssetPoolHandler,
  GetPoolAssetByAssetHandler,
  ListAssetPoolsHandler,
  ListPoolAssetsHandler,
} from './asset-pool/application/queries/asset-pool.query';
import { AssetPoolOrmEntity } from './asset-pool/infrastructure/persistence/entities/asset-pool.orm-entity';
import { PoolAssetOrmEntity } from './asset-pool/infrastructure/persistence/entities/pool-asset.orm-entity';
import { PostgresAssetPoolRepository } from './asset-pool/infrastructure/persistence/postgres-asset-pool.repository';
import { PostgresPoolAssetRepository } from './asset-pool/infrastructure/persistence/postgres-pool-asset.repository';
import { AssetPoolController } from './asset-pool/interface/http/controllers/asset-pool.controller';
import {
  CompleteTransferabilityAssessmentHandler,
  CreateClaimHandler,
  CreateCounterpartyHandler,
  CreateDataRequestHandler,
  CreateEncumbranceHandler,
  CreateEvidenceHandler,
  CreateOwnershipHandler,
  CreateProvenanceEventHandler,
  CreateRightsHandler,
  CreateTransferabilityHandler,
  RejectClaimHandler,
  ReleaseEncumbranceHandler,
  RespondToDataRequestHandler,
  VerifyClaimHandler,
  VerifyCounterpartyHandler,
  VerifyOwnershipHandler,
} from './asset-profile/application/commands/asset-profile.commands';
import {
  GetTransferabilityByAssetHandler,
  ListClaimsByAssetHandler,
  ListCounterpartiesByAssetHandler,
  ListDataRequestsByCaseHandler,
  ListEncumbrancesByAssetHandler,
  ListEvidenceByAssetHandler,
  ListEvidenceByCaseHandler,
  ListOwnershipByAssetHandler,
  ListProvenanceByAssetHandler,
  ListRightsByAssetHandler,
} from './asset-profile/application/queries/asset-profile.query';
import { AssetClaimOrmEntity } from './asset-profile/infrastructure/persistence/entities/asset-claim.orm-entity';
import { AssetCounterpartyOrmEntity } from './asset-profile/infrastructure/persistence/entities/asset-counterparty.orm-entity';
import { AssetEncumbranceOrmEntity } from './asset-profile/infrastructure/persistence/entities/asset-encumbrance.orm-entity';
import { AssetProvenanceOrmEntity } from './asset-profile/infrastructure/persistence/entities/asset-provenance.orm-entity';
import { AssetRightsOrmEntity } from './asset-profile/infrastructure/persistence/entities/asset-rights.orm-entity';
import { AssetTransferabilityOrmEntity } from './asset-profile/infrastructure/persistence/entities/asset-transferability.orm-entity';
import { DataRequestOrmEntity } from './asset-profile/infrastructure/persistence/entities/data-request.orm-entity';
import { EvidenceOrmEntity } from './asset-profile/infrastructure/persistence/entities/evidence.orm-entity';
import { OwnershipOrmEntity } from './asset-profile/infrastructure/persistence/entities/ownership.orm-entity';
import { PostgresAssetClaimRepository } from './asset-profile/infrastructure/persistence/postgres-asset-claim.repository';
import { PostgresAssetCounterpartyRepository } from './asset-profile/infrastructure/persistence/postgres-asset-counterparty.repository';
import { PostgresAssetEncumbranceRepository } from './asset-profile/infrastructure/persistence/postgres-asset-encumbrance.repository';
import { PostgresAssetProvenanceRepository } from './asset-profile/infrastructure/persistence/postgres-asset-provenance.repository';
import { PostgresAssetRightsRepository } from './asset-profile/infrastructure/persistence/postgres-asset-rights.repository';
import { PostgresAssetTransferabilityRepository } from './asset-profile/infrastructure/persistence/postgres-asset-transferability.repository';
import { PostgresDataRequestRepository } from './asset-profile/infrastructure/persistence/postgres-data-request.repository';
import { PostgresEvidenceRepository } from './asset-profile/infrastructure/persistence/postgres-evidence.repository';
import { PostgresOwnershipRepository } from './asset-profile/infrastructure/persistence/postgres-ownership.repository';
import {
  AssetProfileController,
  CaseDataRequestController,
} from './asset-profile/interface/http/controllers/asset-profile.controller';
import { AddCashFlowHandler } from './cash-flow/application/commands/add-cash-flow.command';
import { CreateCashFlowModelHandler } from './cash-flow/application/commands/create-cash-flow-model.command';
import {
  DeleteCashFlowModelHandler,
  SetDiscountRateHandler,
  UpdateCashFlowModelHandler,
} from './cash-flow/application/commands/update-delete-cash-flow-model.commands';
import { GetCashFlowModelHandler, ListCashFlowModelsByAssetHandler } from './cash-flow/application/queries/cash-flow-model.query';
import { CashFlowModelOrmEntity } from './cash-flow/infrastructure/persistence/entities/cash-flow-model.orm-entity';
import { PostgresCashFlowModelRepository } from './cash-flow/infrastructure/persistence/postgres-cash-flow-model.repository';
import { CashFlowController } from './cash-flow/interface/http/controllers/cash-flow.controller';
import {
  APPROVAL_CASE_REPOSITORY,
  APPROVAL_DECISION_REPOSITORY,
  ASSET_CLAIM_REPOSITORY,
  ASSET_COUNTERPARTY_REPOSITORY,
  ASSET_ENCUMBRANCE_REPOSITORY,
  ASSET_LIFECYCLE_HISTORY_REPOSITORY,
ASSET_POOL_REPOSITORY,
  ASSET_PROVENANCE_REPOSITORY,
  ASSET_REPOSITORY,
  ASSET_RIGHTS_REPOSITORY,
  ASSET_RISK_ASSESSMENT_REPOSITORY,
  ASSET_TRANSFERABILITY_REPOSITORY,
  BLOCKER_REPOSITORY,
  CASH_FLOW_MODEL_REPOSITORY,
  COMPLETENESS_RESULT_REPOSITORY,
  DATA_REQUEST_REPOSITORY,
  DD_FINDING_REPOSITORY,
  DUE_DILIGENCE_CASE_REPOSITORY,
  DUE_DILIGENCE_REPORT_REPOSITORY,
  ENGINEERING_READINESS_REPOSITORY,
  EVIDENCE_REPOSITORY,
  INTERACTION_REPOSITORY,
  ORIGINATION_CASE_REPOSITORY,
  OUTBOX_PUBLISHER,
  OWNERSHIP_REPOSITORY,
  POOL_ASSET_REPOSITORY,
  QUALIFICATION_RESULT_REPOSITORY,
  RISK_ITEM_REPOSITORY,
  SCREENING_RESULT_REPOSITORY,
  SPONSOR_REFERENCE_REPOSITORY,
  SUBMISSION_REPOSITORY,
  TASK_REPOSITORY,
  VALUATION_ENGINE,
  VALUATION_REPOSITORY,
} from './domain/repositories/repository.tokens';
import {
  AddDdFindingHandler,
  CompleteDueDiligenceHandler as DdCaseCompleteDueDiligenceHandler,
  StartDueDiligenceHandler as DdCaseStartDueDiligenceHandler,
  UpdateDdFindingHandler,
} from './due-diligence/application/commands/due-diligence.commands';
import {
  GetDueDiligenceByCaseHandler,
  ListDdFindingsByCaseHandler,
} from './due-diligence/application/queries/due-diligence.query';
import { DdFindingOrmEntity } from './due-diligence/infrastructure/persistence/entities/dd-finding.orm-entity';
import { DueDiligenceCaseOrmEntity } from './due-diligence/infrastructure/persistence/entities/due-diligence-case.orm-entity';
import { DueDiligenceReportOrmEntity } from './due-diligence/infrastructure/persistence/entities/due-diligence-report.orm-entity';
import { PostgresDdFindingRepository } from './due-diligence/infrastructure/persistence/postgres-dd-finding.repository';
import { PostgresDueDiligenceCaseRepository } from './due-diligence/infrastructure/persistence/postgres-due-diligence-case.repository';
import { PostgresDueDiligenceReportRepository } from './due-diligence/infrastructure/persistence/postgres-due-diligence-report.repository';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import {
  AddTaskDependencyHandler,
  AssignTaskHandler,
  CancelTaskHandler,
  CompleteTaskHandler,
  CreateTaskHandler,
  EscalateTaskHandler,
  RecordInteractionHandler,
  UpdateTaskHandler,
} from './interaction/application/commands/interaction-task.commands';
import {
  GetInteractionHandler,
  GetTaskHandler,
  ListInteractionsHandler,
  ListTasksHandler,
} from './interaction/application/queries/interaction-task.query';
import { InteractionOrmEntity } from './interaction/infrastructure/persistence/entities/interaction.orm-entity';
import { TaskOrmEntity } from './interaction/infrastructure/persistence/entities/task.orm-entity';
import { PostgresInteractionRepository } from './interaction/infrastructure/persistence/postgres-interaction.repository';
import { PostgresTaskRepository } from './interaction/infrastructure/persistence/postgres-task.repository';
import { InteractionController } from './interaction/interface/http/controllers/interaction-task.controller';
import { TaskController } from './interaction/interface/http/controllers/interaction-task.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';
import {
  CompleteIntakeHandler,
  CreateOriginationCaseHandler,
  PutCaseOnHoldHandler,
  RejectCaseHandler,
  ResumeCaseHandler,
  SubmitCaseHandler,
  TransitionCaseHandler,
  UpdateOriginationCaseHandler,
  WithdrawCaseHandler,
} from './origination-case/application/commands/origination-case.commands';
import {
  GetOriginationCaseByNumberHandler,
  GetOriginationCaseHandler,
  ListOriginationCasesHandler,
} from './origination-case/application/queries/origination-case.query';
import { OriginationCaseOrmEntity } from './origination-case/infrastructure/persistence/entities/origination-case.orm-entity';
import { SubmissionOrmEntity } from './origination-case/infrastructure/persistence/entities/submission.orm-entity';
import { PostgresOriginationCaseRepository } from './origination-case/infrastructure/persistence/postgres-origination-case.repository';
import { PostgresSubmissionRepository } from './origination-case/infrastructure/persistence/postgres-submission.repository';
import { OriginationCaseController } from './origination-case/interface/http/controllers/origination-case.controller';
import {
  AddRiskItemHandler,
  CompleteRiskAssessmentHandler,
  CreateRiskAssessmentHandler,
  UpdateRiskItemHandler,
} from './risk/application/commands/risk.commands';
import {
  GetRiskAssessmentByCaseHandler,
  ListRiskItemsByCaseHandler,
} from './risk/application/queries/risk.query';
import { AssetRiskAssessmentOrmEntity } from './risk/infrastructure/persistence/entities/asset-risk-assessment.orm-entity';
import { RiskItemOrmEntity } from './risk/infrastructure/persistence/entities/risk-item.orm-entity';
import { PostgresAssetRiskAssessmentRepository } from './risk/infrastructure/persistence/postgres-asset-risk-assessment.repository';
import { PostgresRiskItemRepository } from './risk/infrastructure/persistence/postgres-risk-item.repository';
import {
  AssignBlockerHandler,
  CalculateCompletenessHandler,
  RaiseBlockerHandler,
  ResolveBlockerHandler,
} from './screening-qualification/application/commands/completeness-blocker.commands';
import {
  OverrideScreeningHandler,
  RunQualificationHandler,
  RunScreeningHandler,
} from './screening-qualification/application/commands/screening-qualification.commands';
import {
  GetCompletenessByCaseHandler,
  ListBlockersByCaseHandler,
} from './screening-qualification/application/queries/completeness-blocker.query';
import {
  GetQualificationByCaseHandler,
  GetScreeningByCaseHandler,
} from './screening-qualification/application/queries/screening-qualification.query';
import { BlockerOrmEntity } from './screening-qualification/infrastructure/persistence/entities/blocker.orm-entity';
import { CompletenessResultOrmEntity } from './screening-qualification/infrastructure/persistence/entities/completeness-result.orm-entity';
import { QualificationResultOrmEntity } from './screening-qualification/infrastructure/persistence/entities/qualification-result.orm-entity';
import { ScreeningResultOrmEntity } from './screening-qualification/infrastructure/persistence/entities/screening-result.orm-entity';
import { PostgresBlockerRepository } from './screening-qualification/infrastructure/persistence/postgres-blocker.repository';
import { PostgresCompletenessResultRepository } from './screening-qualification/infrastructure/persistence/postgres-completeness-result.repository';
import { PostgresQualificationResultRepository } from './screening-qualification/infrastructure/persistence/postgres-qualification-result.repository';
import { PostgresScreeningResultRepository } from './screening-qualification/infrastructure/persistence/postgres-screening-result.repository';
import { CaseWorkflowActivitiesService } from './temporal/activities/case-workflow-activities.service';
import { TemporalModule } from './temporal/temporal.module';
import { TemporalWorkerService } from './temporal/worker/temporal-worker.service';
import { OriginationCaseWorkflowStarter } from './temporal/workflow-starter.service';
import {
  ApproveValuationHandler,
  AssignValuerHandler,
  RejectValuationHandler,
  RequestValuationHandler,
  RevalueHandler,
  SubmitValuationForReviewHandler,
  UploadValuationHandler,
} from './valuation/application/commands/valuation.commands';
import {
  GetValuationByCaseHandler,
  ListValuationsByCaseHandler,
} from './valuation/application/queries/valuation.query';
import { ValuationOrmEntity } from './valuation/infrastructure/persistence/entities/valuation.orm-entity';
import { PostgresValuationRepository } from './valuation/infrastructure/persistence/postgres-valuation.repository';
import { StubValuationAdapter } from './valuation/infrastructure/valuation/stub-valuation.adapter';

const commandHandlers = [
  OriginateAssetHandler,
  CreateAssetDraftHandler,
  StartScreeningHandler,
  CompleteScreeningHandler,
  QualifyAssetHandler,
  StartDueDiligenceHandler,
  SubmitDueDiligenceHandler,
  CompleteDueDiligenceHandler,
  StartValuationHandler,
  CompleteValuationHandler,
  UpdateValuationHandler,
  StartRiskReviewHandler,
  CompleteRiskReviewHandler,
  SubmitForApprovalHandler,
  ApproveAssetHandler,
  RejectAssetHandler,
  PutAssetOnHoldHandler,
  ResumeAssetHandler,
  WithdrawAssetHandler,
  HandoffToDealStudioHandler,
  CreateCashFlowModelHandler,
  AddCashFlowHandler,
  UpdateCashFlowModelHandler,
  SetDiscountRateHandler,
  DeleteCashFlowModelHandler,
  CreateOriginationCaseHandler,
  SubmitCaseHandler,
  CompleteIntakeHandler,
  TransitionCaseHandler,
  RejectCaseHandler,
  PutCaseOnHoldHandler,
  ResumeCaseHandler,
  UpdateOriginationCaseHandler,
  WithdrawCaseHandler,
  CreateCounterpartyHandler,
  VerifyCounterpartyHandler,
  CreateOwnershipHandler,
  VerifyOwnershipHandler,
  CreateRightsHandler,
  CreateEncumbranceHandler,
  ReleaseEncumbranceHandler,
  CreateTransferabilityHandler,
  CompleteTransferabilityAssessmentHandler,
  CreateProvenanceEventHandler,
  CreateEvidenceHandler,
  CreateClaimHandler,
  VerifyClaimHandler,
  RejectClaimHandler,
  CreateDataRequestHandler,
  RespondToDataRequestHandler,
  RunScreeningHandler,
  OverrideScreeningHandler,
  RunQualificationHandler,
  CalculateCompletenessHandler,
  RaiseBlockerHandler,
  ResolveBlockerHandler,
  AssignBlockerHandler,
  DdCaseStartDueDiligenceHandler,
  AddDdFindingHandler,
  UpdateDdFindingHandler,
  DdCaseCompleteDueDiligenceHandler,
  CreateRiskAssessmentHandler,
  AddRiskItemHandler,
  UpdateRiskItemHandler,
  CompleteRiskAssessmentHandler,
  RequestValuationHandler,
  AssignValuerHandler,
  UploadValuationHandler,
  SubmitValuationForReviewHandler,
  ApproveValuationHandler,
  RejectValuationHandler,
  RevalueHandler,
  StartApprovalHandler,
  RecordApprovalDecisionHandler,
  CompleteApprovalHandler,
  AssessEngineeringReadinessHandler,
  RecordEngineeringCheckHandler,
  CompleteEngineeringReadinessHandler,
  CreateAssetPoolHandler,
  UpdateAssetPoolHandler,
  ChangePoolStatusHandler,
  AddAssetToPoolHandler,
  UpdateAssetAllocationHandler,
  RemoveAssetFromPoolHandler,
  RebalancePoolHandler,
  SplitPoolHandler,
  MergePoolsHandler,
  UpdateConcentrationRulesHandler,
  UpdateEligibilityPolicyHandler,
  CheckEligibilityHandler,
  SetParentPoolHandler,
  RecordInteractionHandler,
  CreateTaskHandler,
  UpdateTaskHandler,
  AssignTaskHandler,
  AddTaskDependencyHandler,
  EscalateTaskHandler,
  CompleteTaskHandler,
  CancelTaskHandler,
];

const queryHandlers = [
  GetAssetHandler,
  ListAssetsHandler,
  GetAssetPipelineMetricsHandler,
  GetDueDiligenceReportHandler,
  GetAssetLifecycleHistoryHandler,
  GetCashFlowModelHandler,
  ListCashFlowModelsByAssetHandler,
  GetOriginationCaseHandler,
  ListOriginationCasesHandler,
  GetOriginationCaseByNumberHandler,
  ListCounterpartiesByAssetHandler,
  ListOwnershipByAssetHandler,
  ListRightsByAssetHandler,
  ListEncumbrancesByAssetHandler,
  GetTransferabilityByAssetHandler,
  ListProvenanceByAssetHandler,
  ListEvidenceByAssetHandler,
  ListEvidenceByCaseHandler,
  ListClaimsByAssetHandler,
  ListDataRequestsByCaseHandler,
  GetScreeningByCaseHandler,
  GetQualificationByCaseHandler,
  GetCompletenessByCaseHandler,
  ListBlockersByCaseHandler,
  GetDueDiligenceByCaseHandler,
  ListDdFindingsByCaseHandler,
  GetRiskAssessmentByCaseHandler,
  ListRiskItemsByCaseHandler,
  GetValuationByCaseHandler,
  ListValuationsByCaseHandler,
  GetApprovalByCaseHandler,
  ListApprovalDecisionsByCaseHandler,
  GetEngineeringReadinessByCaseHandler,
  GetAssetPoolHandler,
  GetAssetPoolByNameHandler,
  ListAssetPoolsHandler,
  ListPoolAssetsHandler,
  GetPoolAssetByAssetHandler,
  GetInteractionHandler,
  GetTaskHandler,
  ListInteractionsHandler,
  ListTasksHandler,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 5432),
        username: config.get('DB_USER', 'daos'),
        password: config.get('DB_PASSWORD', 'daos_dev_password'),
        database: config.get('DB_NAME', 'daos_asset_origination'),

        entities: [
          AssetOrmEntity,
          DueDiligenceReportOrmEntity,
          CashFlowModelOrmEntity,
          AssetLifecycleHistoryOrmEntity,
          SponsorReferenceOrmEntity,
          OriginationCaseOrmEntity,
          SubmissionOrmEntity,
          AssetCounterpartyOrmEntity,
          OwnershipOrmEntity,
          AssetRightsOrmEntity,
          AssetEncumbranceOrmEntity,
          AssetTransferabilityOrmEntity,
          AssetProvenanceOrmEntity,
          EvidenceOrmEntity,
          AssetClaimOrmEntity,
          DataRequestOrmEntity,
          ScreeningResultOrmEntity,
          QualificationResultOrmEntity,
          CompletenessResultOrmEntity,
          BlockerOrmEntity,
          DueDiligenceCaseOrmEntity,
          DdFindingOrmEntity,
          AssetRiskAssessmentOrmEntity,
          RiskItemOrmEntity,
          ValuationOrmEntity,
          ApprovalCaseOrmEntity,
          ApprovalDecisionOrmEntity,
          EngineeringReadinessOrmEntity,
          AssetPoolOrmEntity,
          PoolAssetOrmEntity,
          InteractionOrmEntity,
          TaskOrmEntity,
        ],
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        autoLoadEntities: true,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
    TemporalModule,
  ],
  controllers: [
    AssetController,
    AssetPoolController,
    DueDiligenceController,
    InteractionController,
    OriginationCaseController,
    TaskController,
    AssetProfileController,
    CaseDataRequestController,
    CashFlowController,
  ],
  providers: [
    { provide: ASSET_REPOSITORY, useClass: PostgresAssetRepository },
    { provide: DUE_DILIGENCE_REPORT_REPOSITORY, useClass: PostgresDueDiligenceReportRepository },
    { provide: CASH_FLOW_MODEL_REPOSITORY, useClass: PostgresCashFlowModelRepository },
    { provide: ASSET_LIFECYCLE_HISTORY_REPOSITORY, useClass: PostgresAssetLifecycleHistoryRepository },
    { provide: SPONSOR_REFERENCE_REPOSITORY, useClass: PostgresSponsorReferenceRepository },
    { provide: ORIGINATION_CASE_REPOSITORY, useClass: PostgresOriginationCaseRepository },
    { provide: SUBMISSION_REPOSITORY, useClass: PostgresSubmissionRepository },
    { provide: ASSET_COUNTERPARTY_REPOSITORY, useClass: PostgresAssetCounterpartyRepository },
    { provide: OWNERSHIP_REPOSITORY, useClass: PostgresOwnershipRepository },
    { provide: ASSET_RIGHTS_REPOSITORY, useClass: PostgresAssetRightsRepository },
    { provide: ASSET_ENCUMBRANCE_REPOSITORY, useClass: PostgresAssetEncumbranceRepository },
    { provide: ASSET_TRANSFERABILITY_REPOSITORY, useClass: PostgresAssetTransferabilityRepository },
    { provide: ASSET_PROVENANCE_REPOSITORY, useClass: PostgresAssetProvenanceRepository },
    { provide: EVIDENCE_REPOSITORY, useClass: PostgresEvidenceRepository },
    { provide: ASSET_CLAIM_REPOSITORY, useClass: PostgresAssetClaimRepository },
    { provide: DATA_REQUEST_REPOSITORY, useClass: PostgresDataRequestRepository },
    { provide: SCREENING_RESULT_REPOSITORY, useClass: PostgresScreeningResultRepository },
    { provide: QUALIFICATION_RESULT_REPOSITORY, useClass: PostgresQualificationResultRepository },
    { provide: COMPLETENESS_RESULT_REPOSITORY, useClass: PostgresCompletenessResultRepository },
    { provide: BLOCKER_REPOSITORY, useClass: PostgresBlockerRepository },
    { provide: DUE_DILIGENCE_CASE_REPOSITORY, useClass: PostgresDueDiligenceCaseRepository },
    { provide: DD_FINDING_REPOSITORY, useClass: PostgresDdFindingRepository },
    { provide: ASSET_RISK_ASSESSMENT_REPOSITORY, useClass: PostgresAssetRiskAssessmentRepository },
    { provide: RISK_ITEM_REPOSITORY, useClass: PostgresRiskItemRepository },
    { provide: VALUATION_REPOSITORY, useClass: PostgresValuationRepository },
    { provide: ASSET_POOL_REPOSITORY, useClass: PostgresAssetPoolRepository },
    { provide: POOL_ASSET_REPOSITORY, useClass: PostgresPoolAssetRepository },
    { provide: APPROVAL_CASE_REPOSITORY, useClass: PostgresApprovalCaseRepository },
    { provide: APPROVAL_DECISION_REPOSITORY, useClass: PostgresApprovalDecisionRepository },
    { provide: ENGINEERING_READINESS_REPOSITORY, useClass: PostgresEngineeringReadinessRepository },
    { provide: INTERACTION_REPOSITORY, useClass: PostgresInteractionRepository },
    { provide: TASK_REPOSITORY, useClass: PostgresTaskRepository },
    { provide: VALUATION_ENGINE, useClass: StubValuationAdapter },
    { provide: OUTBOX_PUBLISHER, useClass: InMemoryOutboxPublisher },
    CaseWorkflowActivitiesService,
    OriginationCaseWorkflowStarter,
    TemporalWorkerService,
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class AssetOriginationModule {}
