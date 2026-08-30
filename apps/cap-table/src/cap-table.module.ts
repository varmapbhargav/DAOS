import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddShareholderHandler } from './application/commands/add-shareholder.command';
import { InitializeCapTableHandler } from './application/commands/initialize-cap-table.command';
import { SyncCapTableFromChainHandler } from './application/commands/sync-cap-table-from-chain.command';
import { TransferSharesHandler } from './application/commands/transfer-shares.command';
import { GetCapTableWaterfallViewHandler } from './application/queries/get-cap-table-waterfall-view.query';
import { GetCapTableHandler } from './application/queries/get-cap-table.query';
import { GetShareholderRecordHandler } from './application/queries/get-shareholder-record.query';
import { ListCapTablesHandler } from './application/queries/list-cap-tables.query';
import { CAP_TABLE_REPOSITORY, OUTBOX_PUBLISHER } from './domain/repositories/repository.tokens';
import { CapTableController } from './interface/http/controllers/cap-table.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { CapTableOrmEntity } from './infrastructure/persistence/entities/cap-table.orm-entity';
import { PostgresCapTableRepository } from './infrastructure/persistence/postgres-cap-table.repository';

const commandHandlers = [
  InitializeCapTableHandler,
  AddShareholderHandler,
  TransferSharesHandler,
  SyncCapTableFromChainHandler,
];

const queryHandlers = [
  GetCapTableHandler,
  GetShareholderRecordHandler,
  GetCapTableWaterfallViewHandler,
  ListCapTablesHandler,
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
        schema: 'cap_table',
        entities: [CapTableOrmEntity],
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        autoLoadEntities: true,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
  controllers: [CapTableController],
  providers: [
    { provide: CAP_TABLE_REPOSITORY, useClass: PostgresCapTableRepository },
    { provide: OUTBOX_PUBLISHER, useClass: InMemoryOutboxPublisher },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class CapTableModule {}