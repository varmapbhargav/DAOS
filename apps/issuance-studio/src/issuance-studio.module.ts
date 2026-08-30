import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddToWhitelistHandler } from './application/commands/add-to-whitelist.command';
import { ConfirmTokenMintHandler } from './application/commands/confirm-token-mint.command';
import { CreateIssuanceHandler } from './application/commands/create-issuance.command';
import { RemoveFromWhitelistHandler } from './application/commands/remove-from-whitelist.command';
import { RequestTokenMintHandler } from './application/commands/request-token-mint.command';
import { SignIssuanceLegalDocsHandler } from './application/commands/sign-issuance-legal-docs.command';
import { SyncCapTableHandler } from './application/commands/sync-cap-table.command';
import { GetIssuanceHandler } from './application/queries/get-issuance.query';
import { GetMintRequestHandler } from './application/queries/get-mint-request.query';
import { GetWhitelistHandler } from './application/queries/get-whitelist.query';
import { ListIssuancesHandler } from './application/queries/list-issuances.query';
import { IssuanceWorkflowOrchestrator } from './domain/services/issuance-workflow-orchestrator';
import {
  BLOCKCHAIN_GATEWAY,
  ISSUANCE_REPOSITORY,
  MINT_REQUEST_REPOSITORY,
  OUTBOX_PUBLISHER,
  TOKEN_STANDARD_PROVIDER,
} from './domain/repositories/repository.tokens';
import { IssuanceController } from './interface/http/controllers/issuance.controller';
import { MintRequestController } from './interface/http/controllers/mint-request.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';
import { StubBlockchainGatewayAdapter } from './infrastructure/blockchain/stub-blockchain-gateway.adapter';
import { StubTokenStandardEngine } from './infrastructure/blockchain/stub-token-standard.engine';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { IssuanceOrmEntity } from './infrastructure/persistence/entities/issuance.orm-entity';
import { MintRequestOrmEntity } from './infrastructure/persistence/entities/mint-request.orm-entity';
import { PostgresIssuanceRepository } from './infrastructure/persistence/postgres-issuance.repository';
import { PostgresMintRequestRepository } from './infrastructure/persistence/postgres-mint-request.repository';

const commandHandlers = [
  CreateIssuanceHandler,
  SignIssuanceLegalDocsHandler,
  RequestTokenMintHandler,
  ConfirmTokenMintHandler,
  AddToWhitelistHandler,
  RemoveFromWhitelistHandler,
  SyncCapTableHandler,
];

const queryHandlers = [GetIssuanceHandler, ListIssuancesHandler, GetWhitelistHandler, GetMintRequestHandler];

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
        schema: 'issuance_studio',
        entities: [IssuanceOrmEntity, MintRequestOrmEntity],
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        autoLoadEntities: true,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
  controllers: [IssuanceController, MintRequestController],
  providers: [
    { provide: ISSUANCE_REPOSITORY, useClass: PostgresIssuanceRepository },
    { provide: MINT_REQUEST_REPOSITORY, useClass: PostgresMintRequestRepository },
    { provide: BLOCKCHAIN_GATEWAY, useClass: StubBlockchainGatewayAdapter },
    { provide: TOKEN_STANDARD_PROVIDER, useClass: StubTokenStandardEngine },
    { provide: OUTBOX_PUBLISHER, useClass: InMemoryOutboxPublisher },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    IssuanceWorkflowOrchestrator,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class IssuanceStudioModule {}