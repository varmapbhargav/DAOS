import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AllocateSubscriptionsHandler } from './application/commands/allocate-subscriptions.command';
import { CompleteClosingHandler } from './application/commands/complete-closing.command';
import { ExecuteSubscriptionDocumentsHandler } from './application/commands/execute-subscription-documents.command';
import { FundCapitalCallHandler } from './application/commands/fund-capital-call.command';
import { FundSubscriptionHandler } from './application/commands/fund-subscription.command';
import { IssueCapitalCallHandler } from './application/commands/issue-capital-call.command';
import { ReceiveSubscriptionHandler } from './application/commands/receive-subscription.command';
import { RejectSubscriptionHandler } from './application/commands/reject-subscription.command';
import { SendSubscriptionDocumentsHandler } from './application/commands/send-subscription-documents.command';
import { GetAllocationHandler } from './application/queries/get-allocation.query';
import { GetCapitalCallHandler } from './application/queries/get-capital-call.query';
import { GetClosingHandler } from './application/queries/get-closing.query';
import { GetFundraisingProgressHandler } from './application/queries/get-fundraising-progress.query';
import { GetSubscriptionHandler } from './application/queries/get-subscription.query';
import { ListSubscriptionsHandler } from './application/queries/list-subscriptions.query';
import { AllocationEngine } from './domain/services/allocation-engine';
import { CapitalCallCalculator } from './domain/services/capital-call-calculator';
import {
  ALLOCATION_REPOSITORY,
  CAPITAL_CALL_REPOSITORY,
  CLOSING_REPOSITORY,
  ESCROW_PROVIDER,
  OUTBOX_PUBLISHER,
  PAYMENT_GATEWAY,
  SUBSCRIPTION_REPOSITORY,
} from './domain/repositories/repository.tokens';
import { DistributionController } from './interface/http/controllers/distribution.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';
import { DistributionKafkaOutboxPublisher } from './infrastructure/messaging/distribution-kafka-outbox.publisher';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { PostgresAllocationRepository } from './infrastructure/persistence/postgres-allocation.repository';
import { PostgresCapitalCallRepository } from './infrastructure/persistence/postgres-capital-call.repository';
import { PostgresClosingRepository } from './infrastructure/persistence/postgres-closing.repository';
import { PostgresSubscriptionRepository } from './infrastructure/persistence/postgres-subscription.repository';
import {
  AllocationOrmEntity,
  CapitalCallOrmEntity,
  ClosingOrmEntity,
  SubscriptionOrmEntity,
} from './infrastructure/persistence/entities/distribution.orm-entities';
import { StubEscrowProviderAdapter } from './infrastructure/providers/stub-escrow-provider.adapter';
import { StubPaymentGatewayAdapter } from './infrastructure/providers/stub-payment-gateway.adapter';

const commandHandlers = [
  ReceiveSubscriptionHandler,
  SendSubscriptionDocumentsHandler,
  ExecuteSubscriptionDocumentsHandler,
  AllocateSubscriptionsHandler,
  FundSubscriptionHandler,
  RejectSubscriptionHandler,
  IssueCapitalCallHandler,
  FundCapitalCallHandler,
  CompleteClosingHandler,
];

const queryHandlers = [
  GetSubscriptionHandler,
  ListSubscriptionsHandler,
  GetAllocationHandler,
  GetCapitalCallHandler,
  GetClosingHandler,
  GetFundraisingProgressHandler,
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
        schema: 'distribution',
        entities: [
          SubscriptionOrmEntity,
          AllocationOrmEntity,
          CapitalCallOrmEntity,
          ClosingOrmEntity,
        ],
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        autoLoadEntities: true,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
  controllers: [DistributionController],
  providers: [
    AllocationEngine,
    CapitalCallCalculator,
    { provide: SUBSCRIPTION_REPOSITORY, useClass: PostgresSubscriptionRepository },
    { provide: ALLOCATION_REPOSITORY, useClass: PostgresAllocationRepository },
    { provide: CAPITAL_CALL_REPOSITORY, useClass: PostgresCapitalCallRepository },
    { provide: CLOSING_REPOSITORY, useClass: PostgresClosingRepository },
    { provide: PAYMENT_GATEWAY, useClass: StubPaymentGatewayAdapter },
    { provide: ESCROW_PROVIDER, useClass: StubEscrowProviderAdapter },
    { provide: OUTBOX_PUBLISHER, useClass: InMemoryOutboxPublisher },
    DistributionKafkaOutboxPublisher,
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class DistributionModule {}
