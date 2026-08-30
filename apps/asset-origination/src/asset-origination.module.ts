import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApproveAssetHandler } from './application/commands/approve-asset.command';
import { CompleteDueDiligenceHandler } from './application/commands/complete-due-diligence.command';
import { OriginateAssetHandler } from './application/commands/originate-asset.command';
import { RejectAssetHandler } from './application/commands/reject-asset.command';
import { SubmitDueDiligenceHandler } from './application/commands/submit-due-diligence.command';
import { UpdateValuationHandler } from './application/commands/update-valuation.command';
import { GetAssetHandler } from './application/queries/get-asset.query';
import { GetDueDiligenceReportHandler } from './application/queries/get-due-diligence-report.query';
import { ListAssetsHandler } from './application/queries/list-assets.query';
import {
  ASSET_REPOSITORY,
  DUE_DILIGENCE_REPORT_REPOSITORY,
  OUTBOX_PUBLISHER,
  VALUATION_ENGINE,
} from './domain/repositories/repository.tokens';
import { AssetController } from './interface/http/controllers/asset.controller';
import { DueDiligenceController } from './interface/http/controllers/due-diligence.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { StubValuationAdapter } from './infrastructure/valuation/stub-valuation.adapter';
import { AssetOrmEntity } from './infrastructure/persistence/entities/asset.orm-entity';
import { DueDiligenceReportOrmEntity } from './infrastructure/persistence/entities/due-diligence-report.orm-entity';
import { PostgresAssetRepository } from './infrastructure/persistence/postgres-asset.repository';
import { PostgresDueDiligenceReportRepository } from './infrastructure/persistence/postgres-due-diligence-report.repository';

const commandHandlers = [
  OriginateAssetHandler,
  SubmitDueDiligenceHandler,
  CompleteDueDiligenceHandler,
  UpdateValuationHandler,
  ApproveAssetHandler,
  RejectAssetHandler,
];

const queryHandlers = [GetAssetHandler, ListAssetsHandler, GetDueDiligenceReportHandler];

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
        entities: [AssetOrmEntity, DueDiligenceReportOrmEntity],
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
    { provide: VALUATION_ENGINE, useClass: StubValuationAdapter },
    { provide: OUTBOX_PUBLISHER, useClass: InMemoryOutboxPublisher },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class AssetOriginationModule {}
