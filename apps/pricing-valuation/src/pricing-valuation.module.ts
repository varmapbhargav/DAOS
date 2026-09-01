import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApproveValuationHandler } from './application/commands/approve-valuation.command';
import { MarkPriceStaleHandler } from './application/commands/mark-price-stale.command';
import { PublishPriceHandler } from './application/commands/publish-price.command';
import { RejectValuationHandler } from './application/commands/reject-valuation.command';
import { RunValuationHandler } from './application/commands/run-valuation.command';
import { GetPriceHistoryHandler } from './application/queries/get-price-history.query';
import { GetPriceHandler } from './application/queries/get-price.query';
import { GetValuationModelHandler } from './application/queries/get-valuation-model.query';
import {
  OUTBOX_PUBLISHER,
  PRICE_HISTORY_REPOSITORY,
  PRICE_REPOSITORY,
  PRICING_VENDOR_PORT,
  VALUATION_AGENT_PORT,
  VALUATION_MODEL_REPOSITORY,
} from './domain/repositories/repository.tokens';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { PricingKafkaOutboxPublisher } from './infrastructure/messaging/pricing-kafka-outbox.publisher';
import {
  PriceHistoryOrmEntity,
  PriceOrmEntity,
  ValuationModelOrmEntity,
} from './infrastructure/persistence/entities/pricing.orm-entities';
import { PostgresPriceHistoryRepository } from './infrastructure/persistence/postgres-price-history.repository';
import { PostgresPriceRepository } from './infrastructure/persistence/postgres-price.repository';
import { PostgresValuationModelRepository } from './infrastructure/persistence/postgres-valuation-model.repository';
import { BloombergPricingAdapter } from './infrastructure/vendors/bloomberg-pricing.adapter';
import { StubValuationAgent } from './infrastructure/vendors/stub-valuation-agent';
import { PricingController } from './interface/http/controllers/pricing.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';

const commandHandlers = [
  PublishPriceHandler,
  MarkPriceStaleHandler,
  RunValuationHandler,
  ApproveValuationHandler,
  RejectValuationHandler,
];

const queryHandlers = [GetPriceHandler, GetPriceHistoryHandler, GetValuationModelHandler];

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
        database: config.get('DB_NAME', 'daos_pricing_valuation'),

        entities: [PriceOrmEntity, PriceHistoryOrmEntity, ValuationModelOrmEntity],
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        autoLoadEntities: true,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
  controllers: [PricingController],
  providers: [
    BloombergPricingAdapter,
    StubValuationAgent,
    { provide: PRICING_VENDOR_PORT, useClass: BloombergPricingAdapter },
    { provide: VALUATION_AGENT_PORT, useClass: StubValuationAgent },
    { provide: PRICE_REPOSITORY, useClass: PostgresPriceRepository },
    { provide: VALUATION_MODEL_REPOSITORY, useClass: PostgresValuationModelRepository },
    { provide: PRICE_HISTORY_REPOSITORY, useClass: PostgresPriceHistoryRepository },
    { provide: OUTBOX_PUBLISHER, useClass: InMemoryOutboxPublisher },
    PricingKafkaOutboxPublisher,
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class PricingValuationModule {}
