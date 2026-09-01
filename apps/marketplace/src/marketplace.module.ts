import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CancelOrderHandler } from './application/commands/cancel-order.command';
import { DelistListingHandler } from './application/commands/delist-listing.command';
import { ExecuteTradeHandler } from './application/commands/execute-trade.command';
import { PlaceOrderHandler } from './application/commands/place-order.command';
import { PublishListingHandler } from './application/commands/publish-listing.command';
import { SuspendListingHandler } from './application/commands/suspend-listing.command';
import { GetListingHandler } from './application/queries/get-listing.query';
import { GetOrderBookHandler } from './application/queries/get-order-book.query';
import { GetOrderHandler } from './application/queries/get-order.query';
import { GetTradeHandler } from './application/queries/get-trade.query';
import { ListListingsHandler } from './application/queries/list-listings.query';
import { ListOrdersHandler } from './application/queries/list-orders.query';
import { ListTradesHandler } from './application/queries/list-trades.query';
import { CompliancePreTradeCheck } from './domain/services/compliance-pre-trade-check';
import { OrderMatchingEngine } from './domain/services/order-matching-engine';
import {
  LISTING_REPOSITORY,
  ORDER_BOOK_CACHE,
  ORDER_REPOSITORY,
  OUTBOX_PUBLISHER,
  TRADE_REPOSITORY,
} from './domain/repositories/repository.tokens';
import { InMemoryOrderBookCache } from './infrastructure/cache/in-memory-order-book.cache';
import { MarketplaceController } from './interface/http/controllers/marketplace.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { MarketplaceKafkaOutboxPublisher } from './infrastructure/messaging/marketplace-kafka-outbox.publisher';
import { ListingOrmEntity, OrderOrmEntity, TradeOrmEntity } from './infrastructure/persistence/entities/marketplace.orm-entities';
import { PostgresListingRepository } from './infrastructure/persistence/postgres-listing.repository';
import { PostgresOrderRepository } from './infrastructure/persistence/postgres-order.repository';
import { PostgresTradeRepository } from './infrastructure/persistence/postgres-trade.repository';

const commandHandlers = [
  PublishListingHandler,
  SuspendListingHandler,
  DelistListingHandler,
  PlaceOrderHandler,
  CancelOrderHandler,
  ExecuteTradeHandler,
];

const queryHandlers = [
  GetListingHandler,
  ListListingsHandler,
  GetOrderHandler,
  ListOrdersHandler,
  GetTradeHandler,
  ListTradesHandler,
  GetOrderBookHandler,
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
        database: config.get('DB_NAME', 'daos_marketplace'),

        entities: [ListingOrmEntity, OrderOrmEntity, TradeOrmEntity],
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        autoLoadEntities: true,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
  controllers: [MarketplaceController],
  providers: [
    OrderMatchingEngine,
    CompliancePreTradeCheck,
    { provide: LISTING_REPOSITORY, useClass: PostgresListingRepository },
    { provide: ORDER_REPOSITORY, useClass: PostgresOrderRepository },
    { provide: TRADE_REPOSITORY, useClass: PostgresTradeRepository },
    { provide: ORDER_BOOK_CACHE, useClass: InMemoryOrderBookCache },
    { provide: OUTBOX_PUBLISHER, useClass: InMemoryOutboxPublisher },
    MarketplaceKafkaOutboxPublisher,
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class MarketplaceModule {}
