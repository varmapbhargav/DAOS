import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddCashFlowHandler } from './application/commands/add-cash-flow.command';
import {
  AssessEngineeringReadinessHandler,
  CompleteApprovalHandler,
  CompleteEngineeringReadinessHandler,
  RecordApprovalDecisionHandler,
  RecordEngineeringCheckHandler,
  StartApprovalHandler,
} from './application/commands/approval-readiness.commands';
import { ApproveAssetHandler } from './application/commands/approve-asset.command';
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
} from './application/commands/asset-profile.commands';
import { CompleteDueDiligenceHandler } from './application/commands/complete-due-diligence.command';
import { CompleteRiskReviewHandler } from './application/commands/complete-risk-review.command';
import { CompleteScreeningHandler } from './application/commands/complete-screening.command';
import { CompleteValuationHandler } from './application/commands/complete-valuation.command';
import {
  AssignBlockerHandler,
  CalculateCompletenessHandler,
  RaiseBlockerHandler,
  ResolveBlockerHandler,
} from './application/commands/completeness-blocker.commands';
import { CreateAssetDraftHandler } from './application/commands/create-asset-draft.command';
import { CreateCashFlowModelHandler } from './application/commands/create-cash-flow-model.command';
import {
  AddDdFindingHandler,
  AddRiskItemHandler,
  CompleteDueDiligenceHandler as DdCaseCompleteDueDiligenceHandler,
  CompleteRiskAssessmentHandler,
  CreateRiskAssessmentHandler,
  StartDueDiligenceHandler as DdCaseStartDueDiligenceHandler,
  UpdateDdFindingHandler,
  UpdateRiskItemHandler,
} from './application/commands/dd-risk.commands';
import { HandoffToDealStudioHandler } from './application/commands/handoff-to-deal-studio.command';
import { OriginateAssetHandler } from './application/commands/originate-asset.command';
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
} from './application/commands/origination-case.commands';
import { PutAssetOnHoldHandler } from './application/commands/put-asset-on-hold.command';
import { QualifyAssetHandler } from './application/commands/qualify-asset.command';
import { RejectAssetHandler } from './application/commands/reject-asset.command';
import { ResumeAssetHandler } from './application/commands/resume-asset.command';
import {
  OverrideScreeningHandler,
  RunQualificationHandler,
  RunScreeningHandler,
} from './application/commands/screening-qualification.commands';
import { StartDueDiligenceHandler } from './application/commands/start-due-diligence.command';
import { StartRiskReviewHandler } from './application/commands/start-risk-review.command';
import { StartScreeningHandler } from './application/commands/start-screening.command';
import { StartValuationHandler } from './application/commands/start-valuation.command';
import { SubmitDueDiligenceHandler } from './application/commands/submit-due-diligence.command';
import { SubmitForApprovalHandler } from './application/commands/submit-for-approval.command';
import { UpdateValuationHandler } from './application/commands/update-valuation.command';
import {
  ApproveValuationHandler,
  AssignValuerHandler,
  RejectValuationHandler,
  RequestValuationHandler,
  RevalueHandler,
  SubmitValuationForReviewHandler,
  UploadValuationHandler,
} from './application/commands/valuation.commands';
import { WithdrawAssetHandler } from './application/commands/withdraw-asset.command';
import {
  GetApprovalByCaseHandler,
  GetEngineeringReadinessByCaseHandler,
  ListApprovalDecisionsByCaseHandler,
} from './application/queries/approval-readiness.query';
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
} from './application/queries/asset-profile.query';
import {
  GetCompletenessByCaseHandler,
  ListBlockersByCaseHandler,
} from './application/queries/completeness-blocker.query';
import {
  GetDueDiligenceByCaseHandler,
  GetRiskAssessmentByCaseHandler,
  ListDdFindingsByCaseHandler,
  ListRiskItemsByCaseHandler,
} from './application/queries/dd-risk.query';
import { GetAssetHandler } from './application/queries/get-asset.query';
import { GetAssetLifecycleHistoryHandler } from './application/queries/get-asset-lifecycle-history.query';
import { GetDueDiligenceReportHandler } from './application/queries/get-due-diligence-report.query';
import { ListAssetsHandler } from './application/queries/list-assets.query';
import {
  GetOriginationCaseByNumberHandler,
  GetOriginationCaseHandler,
  ListOriginationCasesHandler,
} from './application/queries/origination-case.query';
import {
  GetQualificationByCaseHandler,
  GetScreeningByCaseHandler,
} from './application/queries/screening-qualification.query';
import {
  GetValuationByCaseHandler,
  ListValuationsByCaseHandler,
} from './application/queries/valuation.query';
import {
  APPROVAL_CASE_REPOSITORY,
  APPROVAL_DECISION_REPOSITORY,
  ASSET_CLAIM_REPOSITORY,
  ASSET_COUNTERPARTY_REPOSITORY,
  ASSET_ENCUMBRANCE_REPOSITORY,
  ASSET_LIFECYCLE_HISTORY_REPOSITORY,
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
  ORIGINATION_CASE_REPOSITORY,
  OUTBOX_PUBLISHER,
  OWNERSHIP_REPOSITORY,
  QUALIFICATION_RESULT_REPOSITORY,
  RISK_ITEM_REPOSITORY,
  SCREENING_RESULT_REPOSITORY,
  SPONSOR_REFERENCE_REPOSITORY,
  SUBMISSION_REPOSITORY,
  VALUATION_ENGINE,
  VALUATION_REPOSITORY,
} from './domain/repositories/repository.tokens';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { ApprovalCaseOrmEntity } from './infrastructure/persistence/entities/approval-case.orm-entity';
import { ApprovalDecisionOrmEntity } from './infrastructure/persistence/entities/approval-decision.orm-entity';
import { AssetOrmEntity } from './infrastructure/persistence/entities/asset.orm-entity';
import { AssetClaimOrmEntity } from './infrastructure/persistence/entities/asset-claim.orm-entity';
import { AssetCounterpartyOrmEntity } from './infrastructure/persistence/entities/asset-counterparty.orm-entity';
import { AssetEncumbranceOrmEntity } from './infrastructure/persistence/entities/asset-encumbrance.orm-entity';
import { AssetLifecycleHistoryOrmEntity } from './infrastructure/persistence/entities/asset-lifecycle-history.orm-entity';
import { AssetProvenanceOrmEntity } from './infrastructure/persistence/entities/asset-provenance.orm-entity';
import { AssetRightsOrmEntity } from './infrastructure/persistence/entities/asset-rights.orm-entity';
import { AssetRiskAssessmentOrmEntity } from './infrastructure/persistence/entities/asset-risk-assessment.orm-entity';
import { AssetTransferabilityOrmEntity } from './infrastructure/persistence/entities/asset-transferability.orm-entity';
import { BlockerOrmEntity } from './infrastructure/persistence/entities/blocker.orm-entity';
import { CashFlowModelOrmEntity } from './infrastructure/persistence/entities/cash-flow-model.orm-entity';
import { CompletenessResultOrmEntity } from './infrastructure/persistence/entities/completeness-result.orm-entity';
import { DataRequestOrmEntity } from './infrastructure/persistence/entities/data-request.orm-entity';
import { DdFindingOrmEntity } from './infrastructure/persistence/entities/dd-finding.orm-entity';
import { DueDiligenceCaseOrmEntity } from './infrastructure/persistence/entities/due-diligence-case.orm-entity';
import { DueDiligenceReportOrmEntity } from './infrastructure/persistence/entities/due-diligence-report.orm-entity';
import { EngineeringReadinessOrmEntity } from './infrastructure/persistence/entities/engineering-readiness.orm-entity';
import { EvidenceOrmEntity } from './infrastructure/persistence/entities/evidence.orm-entity';
import { OriginationCaseOrmEntity } from './infrastructure/persistence/entities/origination-case.orm-entity';
import { OwnershipOrmEntity } from './infrastructure/persistence/entities/ownership.orm-entity';
import { QualificationResultOrmEntity } from './infrastructure/persistence/entities/qualification-result.orm-entity';
import { RiskItemOrmEntity } from './infrastructure/persistence/entities/risk-item.orm-entity';
import { ScreeningResultOrmEntity } from './infrastructure/persistence/entities/screening-result.orm-entity';
import { SponsorReferenceOrmEntity } from './infrastructure/persistence/entities/sponsor-reference.orm-entity';
import { SubmissionOrmEntity } from './infrastructure/persistence/entities/submission.orm-entity';
import { ValuationOrmEntity } from './infrastructure/persistence/entities/valuation.orm-entity';
import { PostgresApprovalCaseRepository } from './infrastructure/persistence/postgres-approval-case.repository';
import { PostgresApprovalDecisionRepository } from './infrastructure/persistence/postgres-approval-decision.repository';
import { PostgresAssetRepository } from './infrastructure/persistence/postgres-asset.repository';
import { PostgresAssetClaimRepository } from './infrastructure/persistence/postgres-asset-claim.repository';
import { PostgresAssetCounterpartyRepository } from './infrastructure/persistence/postgres-asset-counterparty.repository';
import { PostgresAssetEncumbranceRepository } from './infrastructure/persistence/postgres-asset-encumbrance.repository';
import { PostgresAssetLifecycleHistoryRepository } from './infrastructure/persistence/postgres-asset-lifecycle-history.repository';
import { PostgresAssetProvenanceRepository } from './infrastructure/persistence/postgres-asset-provenance.repository';
import { PostgresAssetRightsRepository } from './infrastructure/persistence/postgres-asset-rights.repository';
import { PostgresAssetRiskAssessmentRepository } from './infrastructure/persistence/postgres-asset-risk-assessment.repository';
import { PostgresAssetTransferabilityRepository } from './infrastructure/persistence/postgres-asset-transferability.repository';
import { PostgresBlockerRepository } from './infrastructure/persistence/postgres-blocker.repository';
import { PostgresCashFlowModelRepository } from './infrastructure/persistence/postgres-cash-flow-model.repository';
import { PostgresCompletenessResultRepository } from './infrastructure/persistence/postgres-completeness-result.repository';
import { PostgresDataRequestRepository } from './infrastructure/persistence/postgres-data-request.repository';
import { PostgresDdFindingRepository } from './infrastructure/persistence/postgres-dd-finding.repository';
import { PostgresDueDiligenceCaseRepository } from './infrastructure/persistence/postgres-due-diligence-case.repository';
import { PostgresDueDiligenceReportRepository } from './infrastructure/persistence/postgres-due-diligence-report.repository';
import { PostgresEngineeringReadinessRepository } from './infrastructure/persistence/postgres-engineering-readiness.repository';
import { PostgresEvidenceRepository } from './infrastructure/persistence/postgres-evidence.repository';
import { PostgresOriginationCaseRepository } from './infrastructure/persistence/postgres-origination-case.repository';
import { PostgresOwnershipRepository } from './infrastructure/persistence/postgres-ownership.repository';
import { PostgresQualificationResultRepository } from './infrastructure/persistence/postgres-qualification-result.repository';
import { PostgresRiskItemRepository } from './infrastructure/persistence/postgres-risk-item.repository';
import { PostgresScreeningResultRepository } from './infrastructure/persistence/postgres-screening-result.repository';
import { PostgresSponsorReferenceRepository } from './infrastructure/persistence/postgres-sponsor-reference.repository';
import { PostgresSubmissionRepository } from './infrastructure/persistence/postgres-submission.repository';
import { PostgresValuationRepository } from './infrastructure/persistence/postgres-valuation.repository';
import { StubValuationAdapter } from './infrastructure/valuation/stub-valuation.adapter';
import { AssetController } from './interface/http/controllers/asset.controller';
import {
  AssetProfileController,
  CaseDataRequestController,
} from './interface/http/controllers/asset-profile.controller';
import { DueDiligenceController } from './interface/http/controllers/due-diligence.controller';
import { OriginationCaseController } from './interface/http/controllers/origination-case.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';

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
];

const queryHandlers = [
  GetAssetHandler,
  ListAssetsHandler,
  GetDueDiligenceReportHandler,
  GetAssetLifecycleHistoryHandler,
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
        ],
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        autoLoadEntities: true,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
  controllers: [
    AssetController,
    DueDiligenceController,
    OriginationCaseController,
    AssetProfileController,
    CaseDataRequestController,
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
    { provide: APPROVAL_CASE_REPOSITORY, useClass: PostgresApprovalCaseRepository },
    { provide: APPROVAL_DECISION_REPOSITORY, useClass: PostgresApprovalDecisionRepository },
    { provide: ENGINEERING_READINESS_REPOSITORY, useClass: PostgresEngineeringReadinessRepository },
    { provide: VALUATION_ENGINE, useClass: StubValuationAdapter },
    { provide: OUTBOX_PUBLISHER, useClass: InMemoryOutboxPublisher },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class AssetOriginationModule {}
