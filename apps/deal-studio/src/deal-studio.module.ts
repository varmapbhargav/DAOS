import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApproveDealHandler } from './application/commands/approve-deal.command';
import { CancelDealHandler } from './application/commands/cancel-deal.command';
import { CloseDealHandler } from './application/commands/close-deal.command';
import { FinalizeTermSheetHandler } from './application/commands/finalize-term-sheet.command';
import { MeetClosingConditionHandler } from './application/commands/meet-closing-condition.command';
import { StructureDealHandler } from './application/commands/structure-deal.command';
import { UpdateCapitalStackHandler } from './application/commands/update-capital-stack.command';
import { GetDealHandler } from './application/queries/get-deal.query';
import { GetTermSheetHandler } from './application/queries/get-term-sheet.query';
import { ListDealsHandler } from './application/queries/list-deals.query';
import {
  CAPITAL_STACK_VALIDATOR,
  CLOSING_CONDITION_CHECKER,
  DEAL_REPOSITORY,
  OUTBOX_PUBLISHER,
  TERM_SHEET_REPOSITORY,
} from './domain/repositories/repository.tokens';
import { CapitalStackValidator } from './domain/services/capital-stack-validator';
import { ClosingConditionChecker } from './domain/services/closing-condition-checker';
import { DealController } from './interface/http/controllers/deal.controller';
import { TermSheetController } from './interface/http/controllers/term-sheet.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { DealOrmEntity } from './infrastructure/persistence/entities/deal.orm-entity';
import { TermSheetOrmEntity } from './infrastructure/persistence/entities/term-sheet.orm-entity';
import { PostgresDealRepository } from './infrastructure/persistence/postgres-deal.repository';
import { PostgresTermSheetRepository } from './infrastructure/persistence/postgres-term-sheet.repository';

const commandHandlers = [
  StructureDealHandler,
  UpdateCapitalStackHandler,
  FinalizeTermSheetHandler,
  MeetClosingConditionHandler,
  ApproveDealHandler,
  CloseDealHandler,
  CancelDealHandler,
];

const queryHandlers = [GetDealHandler, ListDealsHandler, GetTermSheetHandler];

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
        entities: [DealOrmEntity, TermSheetOrmEntity],
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
    { provide: CAPITAL_STACK_VALIDATOR, useClass: CapitalStackValidator },
    { provide: CLOSING_CONDITION_CHECKER, useClass: ClosingConditionChecker },
    { provide: OUTBOX_PUBLISHER, useClass: InMemoryOutboxPublisher },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class DealStudioModule {}
