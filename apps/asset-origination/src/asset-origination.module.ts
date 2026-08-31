import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddCashFlowHandler } from './application/commands/add-cash-flow.command';
import { ApproveAssetHandler } from './application/commands/approve-asset.command';
import { CompleteDueDiligenceHandler } from './application/commands/complete-due-diligence.command';
import { CompleteRiskReviewHandler } from './application/commands/complete-risk-review.command';
import { CompleteScreeningHandler } from './application/commands/complete-screening.command';
import { CompleteValuationHandler } from './application/commands/complete-valuation.command';
import { CreateAssetDraftHandler } from './application/commands/create-asset-draft.command';
import { CreateCashFlowModelHandler } from './application/commands/create-cash-flow-model.command';
import { HandoffToDealStudioHandler } from './application/commands/handoff-to-deal-studio.command';
import { OriginateAssetHandler } from './application/commands/originate-asset.command';
import { PutAssetOnHoldHandler } from './application/commands/put-asset-on-hold.command';
import { QualifyAssetHandler } from './application/commands/qualify-asset.command';
import { RejectAssetHandler } from './application/commands/reject-asset.command';
import { ResumeAssetHandler } from './application/commands/resume-asset.command';
import { StartDueDiligenceHandler } from './application/commands/start-due-diligence.command';
import { StartRiskReviewHandler } from './application/commands/start-risk-review.command';
import { StartScreeningHandler } from './application/commands/start-screening.command';
import { StartValuationHandler } from './application/commands/start-valuation.command';
import { SubmitDueDiligenceHandler } from './application/commands/submit-due-diligence.command';
import { SubmitForApprovalHandler } from './application/commands/submit-for-approval.command';
import { UpdateValuationHandler } from './application/commands/update-valuation.command';
import { WithdrawAssetHandler } from './application/commands/withdraw-asset.command';
import { GetAssetHandler } from './application/queries/get-asset.query';
import { GetAssetLifecycleHistoryHandler } from './application/queries/get-asset-lifecycle-history.query';
import { GetDueDiligenceReportHandler } from './application/queries/get-due-diligence-report.query';
import { ListAssetsHandler } from './application/queries/list-assets.query';
import {
  ASSET_LIFECYCLE_HISTORY_REPOSITORY,
  ASSET_REPOSITORY,
  CASH_FLOW_MODEL_REPOSITORY,
  DUE_DILIGENCE_REPORT_REPOSITORY,
  OUTBOX_PUBLISHER,
  SPONSOR_REFERENCE_REPOSITORY,
  VALUATION_ENGINE,
} from './domain/repositories/repository.tokens';
import { AssetController } from './interface/http/controllers/asset.controller';
import { DueDiligenceController } from './interface/http/controllers/due-diligence.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { StubValuationAdapter } from './infrastructure/valuation/stub-valuation.adapter';
import { AssetLifecycleHistoryOrmEntity } from './infrastructure/persistence/entities/asset-lifecycle-history.orm-entity';
import { AssetOrmEntity } from './infrastructure/persistence/entities/asset.orm-entity';
import { CashFlowModelOrmEntity } from './infrastructure/persistence/entities/cash-flow-model.orm-entity';
import { DueDiligenceReportOrmEntity } from './infrastructure/persistence/entities/due-diligence-report.orm-entity';
import { SponsorReferenceOrmEntity } from './infrastructure/persistence/entities/sponsor-reference.orm-entity';
import { PostgresAssetLifecycleHistoryRepository } from './infrastructure/persistence/postgres-asset-lifecycle-history.repository';
import { PostgresAssetRepository } from './infrastructure/persistence/postgres-asset.repository';
import { PostgresCashFlowModelRepository } from './infrastructure/persistence/postgres-cash-flow-model.repository';
import { PostgresDueDiligenceReportRepository } from './infrastructure/persistence/postgres-due-diligence-report.repository';
import { PostgresSponsorReferenceRepository } from './infrastructure/persistence/postgres-sponsor-reference.repository';

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
];

const queryHandlers = [
  GetAssetHandler,
  ListAssetsHandler,
  GetDueDiligenceReportHandler,
  GetAssetLifecycleHistoryHandler,
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
        database: config.get('DB_NAME', 'daos'),
        schema: 'asset_origination',
        entities: [
          AssetOrmEntity,
          DueDiligenceReportOrmEntity,
          CashFlowModelOrmEntity,
          AssetLifecycleHistoryOrmEntity,
          SponsorReferenceOrmEntity,
        ],
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        autoLoadEntities: true,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
  controllers: [AssetController, DueDiligenceController],
  providers: [
    { provide: ASSET_REPOSITORY, useClass: PostgresAssetRepository },
    { provide: DUE_DILIGENCE_REPORT_REPOSITORY, useClass: PostgresDueDiligenceReportRepository },
    { provide: CASH_FLOW_MODEL_REPOSITORY, useClass: PostgresCashFlowModelRepository },
    { provide: ASSET_LIFECYCLE_HISTORY_REPOSITORY, useClass: PostgresAssetLifecycleHistoryRepository },
    { provide: SPONSOR_REFERENCE_REPOSITORY, useClass: PostgresSponsorReferenceRepository },
    { provide: VALUATION_ENGINE, useClass: StubValuationAdapter },
    { provide: OUTBOX_PUBLISHER, useClass: InMemoryOutboxPublisher },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class AssetOriginationModule {}
