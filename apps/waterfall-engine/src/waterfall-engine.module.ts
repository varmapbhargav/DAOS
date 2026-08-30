import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnnounceCorporateActionHandler } from './application/commands/announce-corporate-action.command';
import { ApproveDistributionHandler } from './application/commands/approve-distribution.command';
import { ApproveWaterfallModelHandler } from './application/commands/approve-waterfall-model.command';
import { CalculateDistributionHandler } from './application/commands/calculate-distribution.command';
import { CloseElectionHandler } from './application/commands/close-election.command';
import { CreateWaterfallModelHandler } from './application/commands/create-waterfall-model.command';
import { DeclareDistributionHandler } from './application/commands/declare-distribution.command';
import { ExecuteCorporateActionHandler } from './application/commands/execute-corporate-action.command';
import { PayDistributionHandler } from './application/commands/pay-distribution.command';
import { GetCorporateActionHandler } from './application/queries/get-corporate-action.query';
import { GetDistributionHandler } from './application/queries/get-distribution.query';
import { GetWaterfallModelHandler } from './application/queries/get-waterfall-model.query';
import { ListDistributionsHandler } from './application/queries/list-distributions.query';
import { ListWaterfallModelsHandler } from './application/queries/list-waterfall-models.query';
import {
  CORPORATE_ACTION_REPOSITORY,
  DISTRIBUTION_REPOSITORY,
  OUTBOX_PUBLISHER,
  WATERFALL_MODEL_REPOSITORY,
} from './domain/repositories/repository.tokens';
import { TaxWithholdingCalculator } from './domain/services/tax-withholding.calculator';
import { WaterfallCalculationService } from './domain/services/waterfall-calculation.service';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { WaterfallKafkaOutboxPublisher } from './infrastructure/messaging/waterfall-kafka-outbox.publisher';
import {
  CorporateActionOrmEntity,
  DistributionOrmEntity,
  WaterfallModelOrmEntity,
} from './infrastructure/persistence/entities/waterfall.orm-entities';
import { PostgresCorporateActionRepository } from './infrastructure/persistence/postgres-corporate-action.repository';
import { PostgresDistributionRepository } from './infrastructure/persistence/postgres-distribution.repository';
import { PostgresWaterfallModelRepository } from './infrastructure/persistence/postgres-waterfall-model.repository';
import { WaterfallController } from './interface/http/controllers/waterfall.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';

const commandHandlers = [
  CreateWaterfallModelHandler,
  ApproveWaterfallModelHandler,
  DeclareDistributionHandler,
  CalculateDistributionHandler,
  ApproveDistributionHandler,
  PayDistributionHandler,
  AnnounceCorporateActionHandler,
  CloseElectionHandler,
  ExecuteCorporateActionHandler,
];

const queryHandlers = [
  GetWaterfallModelHandler,
  ListWaterfallModelsHandler,
  GetDistributionHandler,
  ListDistributionsHandler,
  GetCorporateActionHandler,
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
        schema: 'waterfall_engine',
        entities: [WaterfallModelOrmEntity, DistributionOrmEntity, CorporateActionOrmEntity],
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        autoLoadEntities: true,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
  controllers: [WaterfallController],
  providers: [
    WaterfallCalculationService,
    TaxWithholdingCalculator,
    { provide: WATERFALL_MODEL_REPOSITORY, useClass: PostgresWaterfallModelRepository },
    { provide: DISTRIBUTION_REPOSITORY, useClass: PostgresDistributionRepository },
    { provide: CORPORATE_ACTION_REPOSITORY, useClass: PostgresCorporateActionRepository },
    { provide: OUTBOX_PUBLISHER, useClass: InMemoryOutboxPublisher },
    WaterfallKafkaOutboxPublisher,
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class WaterfallEngineModule {}
