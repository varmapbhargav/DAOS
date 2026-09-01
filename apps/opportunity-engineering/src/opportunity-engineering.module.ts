import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddScenarioHandler } from './application/commands/add-scenario.command';
import { ApproveOpportunityHandler } from './application/commands/approve-opportunity.command';
import { ApproveScenarioHandler } from './application/commands/approve-scenario.command';
import { CalculateScenarioHandler } from './application/commands/calculate-scenario.command';
import { EngineerOpportunityHandler } from './application/commands/engineer-opportunity.command';
import { RejectOpportunityHandler } from './application/commands/reject-opportunity.command';
import { RunMonteCarloHandler } from './application/commands/run-monte-carlo.command';
import { ScoreOpportunityHandler } from './application/commands/score-opportunity.command';
import { SetScenarioAssumptionsHandler } from './application/commands/set-scenario-assumptions.command';
import { GetOpportunityHandler } from './application/queries/get-opportunity.query';
import { GetScenarioModelHandler } from './application/queries/get-scenario-model.query';
import { ListOpportunitiesHandler } from './application/queries/list-opportunities.query';
import {
  OPPORTUNITY_REPOSITORY,
  OUTBOX_PUBLISHER,
  SCENARIO_MODEL_REPOSITORY,
} from './domain/repositories/repository.tokens';
import { OpportunityController } from './interface/http/controllers/opportunity.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';
import { PostgresOutboxPublisher } from './infrastructure/messaging/postgres-outbox.publisher';
import { OutboxRelayWorker } from './infrastructure/messaging/outbox-relay.worker';
import { OpportunityOrmEntity } from './infrastructure/persistence/entities/opportunity.orm-entity';
import { ScenarioModelOrmEntity } from './infrastructure/persistence/entities/scenario-model.orm-entity';
import { OutboxEventOrmEntity } from './infrastructure/persistence/entities/outbox-event.orm-entity';
import { PostgresOpportunityRepository } from './infrastructure/persistence/postgres-opportunity.repository';
import { PostgresScenarioModelRepository } from './infrastructure/persistence/postgres-scenario-model.repository';

const commandHandlers = [
  EngineerOpportunityHandler,
  AddScenarioHandler,
  ApproveScenarioHandler,
  CalculateScenarioHandler,
  RunMonteCarloHandler,
  SetScenarioAssumptionsHandler,
  ScoreOpportunityHandler,
  ApproveOpportunityHandler,
  RejectOpportunityHandler,
];

const queryHandlers = [GetOpportunityHandler, ListOpportunitiesHandler, GetScenarioModelHandler];

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
        database: config.get('DB_NAME', 'daos_opportunity_engineering'),

        entities: [OpportunityOrmEntity, ScenarioModelOrmEntity, OutboxEventOrmEntity],
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        autoLoadEntities: true,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
  controllers: [OpportunityController],
  providers: [
    { provide: OPPORTUNITY_REPOSITORY, useClass: PostgresOpportunityRepository },
    { provide: SCENARIO_MODEL_REPOSITORY, useClass: PostgresScenarioModelRepository },
    { provide: OUTBOX_PUBLISHER, useClass: PostgresOutboxPublisher },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    OutboxRelayWorker,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class OpportunityEngineeringModule {}
