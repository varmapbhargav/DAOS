import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApproveDealHandler } from './application/commands/approve-deal.command';
import { CancelDealHandler } from './application/commands/cancel-deal.command';
import { CloseConditionsSubmitHandler } from './application/commands/close-conditions-submit.command';
import { CloseConditionsVerifyHandler } from './application/commands/close-conditions-verify.command';
import { CloseConditionsWaiveHandler } from './application/commands/close-conditions-waive.command';
import { CloseDealHandler } from './application/commands/close-deal.command';
import { CloseStartHandler } from './application/commands/close-start.command';
import { CreateDealHandler } from './application/commands/create-deal.command';
import { FinalizeTermSheetHandler } from './application/commands/finalize-term-sheet.command';
import { MeetClosingConditionHandler } from './application/commands/meet-closing-condition.command';
import { PutOnHoldHandler } from './application/commands/put-on-hold.command';
import { ResumeHandler } from './application/commands/resume.command';
import { StartStructuringHandler } from './application/commands/start-structuring.command';
import { StructureDealHandler } from './application/commands/structure-deal.command';
import { SubmitForApprovalHandler } from './application/commands/submit-for-approval.command';
import { SubmitForLegalReviewHandler } from './application/commands/submit-for-legal-review.command';
import { UpdateCapitalStackHandler } from './application/commands/update-capital-stack.command';
import { UpdateDealHandler } from './application/commands/update-deal.command';

import { GetDealCapitalStackHandler } from './application/queries/get-deal-capital-stack.query';
import { GetDealClosingConditionsHandler } from './application/queries/get-deal-closing-conditions.query';
import { GetDealDocumentsHandler } from './application/queries/get-deal-documents.query';
import { GetDealEconomicsHandler } from './application/queries/get-deal-economics.query';
import { GetDealParticipantsHandler } from './application/queries/get-deal-participants.query';
import { GetDealStatusHistoryHandler } from './application/queries/get-deal-status-history.query';
import { GetDealSummaryHandler } from './application/queries/get-deal-summary.query';
import { GetDealTimelineHandler } from './application/queries/get-deal-timeline.query';
import { GetDealWaterfallHandler } from './application/queries/get-deal-waterfall.query';
import { GetDealHandler } from './application/queries/get-deal.query';
import { GetTermSheetVersionsHandler } from './application/queries/get-term-sheet-versions.query';
import { GetTermSheetHandler } from './application/queries/get-term-sheet.query';
import { ListDealsHandler } from './application/queries/list-deals.query';
import { PipelineDealsHandler } from './application/queries/pipeline-deals.query';

import {
  CAPITAL_STACK_VALIDATOR,
  CLOSING_CONDITION_CHECKER,
  CLOSING_CONDITION_REPOSITORY,
  DEAL_REPOSITORY,
  DEAL_STATUS_HISTORY_REPOSITORY,
  DISTRIBUTION_WATERFALL_REPOSITORY,
  IDEMPOTENCY_STORE,
  OUTBOX_PUBLISHER,
  SCENARIO_REPOSITORY,
  TERM_SHEET_REPOSITORY,
} from './domain/repositories/repository.tokens';
import { CapitalStackValidator } from './domain/services/capital-stack-validator';
import { ClosingConditionChecker } from './domain/services/closing-condition-checker';
import { DealController } from './interface/http/controllers/deal.controller';
import { TermSheetController } from './interface/http/controllers/term-sheet.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';
import { PostgresIdempotencyStore } from './infrastructure/idempotency/postgres-idempotency.store';
import { PostgresOutboxPublisher } from './infrastructure/messaging/postgres-outbox.publisher';
import { ClosingConditionOrmEntity } from './infrastructure/persistence/entities/closing-condition.orm-entity';
import { DealEconomicsOrmEntity } from './infrastructure/persistence/entities/deal-economics.orm-entity';
import { DealParticipantOrmEntity } from './infrastructure/persistence/entities/deal-participant.orm-entity';
import { DealStatusHistoryOrmEntity } from './infrastructure/persistence/entities/deal-status-history.orm-entity';
import { DealOrmEntity } from './infrastructure/persistence/entities/deal.orm-entity';
import { DistributionWaterfallOrmEntity } from './infrastructure/persistence/entities/distribution-waterfall.orm-entity';
import { IdempotencyRecordOrmEntity } from './infrastructure/persistence/entities/idempotency-record.orm-entity';
import { OutboxEventOrmEntity } from './infrastructure/persistence/entities/outbox-event.orm-entity';
import { ScenarioOrmEntity } from './infrastructure/persistence/entities/scenario.orm-entity';
import { TermSheetOrmEntity } from './infrastructure/persistence/entities/term-sheet.orm-entity';
import { PostgresClosingConditionRepository } from './infrastructure/persistence/postgres-closing-condition.repository';
import { PostgresDealStatusHistoryRepository } from './infrastructure/persistence/postgres-deal-status-history.repository';
import { PostgresDealRepository } from './infrastructure/persistence/postgres-deal.repository';
import { PostgresDistributionWaterfallRepository } from './infrastructure/persistence/postgres-distribution-waterfall.repository';
import { PostgresScenarioRepository } from './infrastructure/persistence/postgres-scenario.repository';
import { PostgresTermSheetRepository } from './infrastructure/persistence/postgres-term-sheet.repository';

const commandHandlers = [
  ApproveDealHandler,
  CancelDealHandler,
  CloseConditionsSubmitHandler,
  CloseConditionsVerifyHandler,
  CloseConditionsWaiveHandler,
  CloseDealHandler,
  CloseStartHandler,
  CreateDealHandler,
  FinalizeTermSheetHandler,
  MeetClosingConditionHandler,
  PutOnHoldHandler,
  ResumeHandler,
  StartStructuringHandler,
  StructureDealHandler,
  SubmitForApprovalHandler,
  SubmitForLegalReviewHandler,
  UpdateCapitalStackHandler,
  UpdateDealHandler,
];

const queryHandlers = [
  GetDealHandler,
  GetDealCapitalStackHandler,
  GetDealClosingConditionsHandler,
  GetDealDocumentsHandler,
  GetDealEconomicsHandler,
  GetDealParticipantsHandler,
  GetDealStatusHistoryHandler,
  GetDealSummaryHandler,
  GetDealTimelineHandler,
  GetDealWaterfallHandler,
  GetTermSheetHandler,
  GetTermSheetVersionsHandler,
  ListDealsHandler,
  PipelineDealsHandler,
];

const ormEntities = [
  DealOrmEntity,
  TermSheetOrmEntity,
  ClosingConditionOrmEntity,
  DealEconomicsOrmEntity,
  DealParticipantOrmEntity,
  DealStatusHistoryOrmEntity,
  DistributionWaterfallOrmEntity,
  IdempotencyRecordOrmEntity,
  OutboxEventOrmEntity,
  ScenarioOrmEntity,
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
        schema: 'deal_studio',
        entities: ormEntities,
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        autoLoadEntities: true,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
  controllers: [DealController, TermSheetController],
  providers: [
    { provide: DEAL_REPOSITORY, useClass: PostgresDealRepository },
    { provide: TERM_SHEET_REPOSITORY, useClass: PostgresTermSheetRepository },
    { provide: CLOSING_CONDITION_REPOSITORY, useClass: PostgresClosingConditionRepository },
    { provide: DEAL_STATUS_HISTORY_REPOSITORY, useClass: PostgresDealStatusHistoryRepository },
    { provide: DISTRIBUTION_WATERFALL_REPOSITORY, useClass: PostgresDistributionWaterfallRepository },
    { provide: SCENARIO_REPOSITORY, useClass: PostgresScenarioRepository },
    { provide: IDEMPOTENCY_STORE, useClass: PostgresIdempotencyStore },
    { provide: CAPITAL_STACK_VALIDATOR, useClass: CapitalStackValidator },
    { provide: CLOSING_CONDITION_CHECKER, useClass: ClosingConditionChecker },
    { provide: OUTBOX_PUBLISHER, useClass: PostgresOutboxPublisher },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class DealStudioModule {}
