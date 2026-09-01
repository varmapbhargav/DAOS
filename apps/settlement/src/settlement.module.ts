import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfirmSettlementHandler } from './application/commands/confirm-settlement.command';
import { CreditHoldingHandler } from './application/commands/credit-holding.command';
import { FailSettlementHandler } from './application/commands/fail-settlement.command';
import { InitiateSettlementHandler } from './application/commands/initiate-settlement.command';
import { MatchSettlementHandler } from './application/commands/match-settlement.command';
import { OpenCustodyAccountHandler } from './application/commands/open-custody-account.command';
import { GetCustodyAccountHandler } from './application/queries/get-custody-account.query';
import { GetSettlementInstructionHandler } from './application/queries/get-settlement-instruction.query';
import { ListPendingSettlementsHandler } from './application/queries/list-pending-settlements.query';
import {
  BLOCKCHAIN_SETTLEMENT,
  CUSTODIAN_BANK,
  CUSTODY_REPOSITORY,
  OUTBOX_PUBLISHER,
  SETTLEMENT_REPOSITORY,
} from './domain/repositories/repository.tokens';
import { CustodyController } from './interface/http/controllers/custody.controller';
import { SettlementController } from './interface/http/controllers/settlement.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { SettlementKafkaOutboxPublisher } from './infrastructure/messaging/settlement-kafka-outbox.publisher';
import {
  CustodyAccountOrmEntity,
  SettlementInstructionOrmEntity,
} from './infrastructure/persistence/entities/settlement.orm-entities';
import { PostgresCustodyAccountRepository } from './infrastructure/persistence/postgres-custody-account.repository';
import { PostgresSettlementInstructionRepository } from './infrastructure/persistence/postgres-settlement-instruction.repository';
import { StubBlockchainSettlementAdapter } from './infrastructure/providers/stub-blockchain-settlement.adapter';
import { StubCustodianBankAdapter } from './infrastructure/providers/stub-custodian-bank.adapter';

const commandHandlers = [
  InitiateSettlementHandler,
  MatchSettlementHandler,
  ConfirmSettlementHandler,
  FailSettlementHandler,
  OpenCustodyAccountHandler,
  CreditHoldingHandler,
];

const queryHandlers = [
  GetSettlementInstructionHandler,
  GetCustodyAccountHandler,
  ListPendingSettlementsHandler,
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
        database: config.get('DB_NAME', 'daos_settlement'),

        entities: [SettlementInstructionOrmEntity, CustodyAccountOrmEntity],
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        autoLoadEntities: true,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
  controllers: [SettlementController, CustodyController],
  providers: [
    { provide: SETTLEMENT_REPOSITORY, useClass: PostgresSettlementInstructionRepository },
    { provide: CUSTODY_REPOSITORY, useClass: PostgresCustodyAccountRepository },
    { provide: CUSTODIAN_BANK, useClass: StubCustodianBankAdapter },
    { provide: BLOCKCHAIN_SETTLEMENT, useClass: StubBlockchainSettlementAdapter },
    { provide: OUTBOX_PUBLISHER, useClass: InMemoryOutboxPublisher },
    SettlementKafkaOutboxPublisher,
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class SettlementModule {}
