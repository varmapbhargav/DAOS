import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddShareClassHandler } from './application/commands/add-share-class.command';
import { ApproveProductHandler } from './application/commands/approve-product.command';
import { CloseProductHandler } from './application/commands/close-product.command';
import { DesignProductHandler } from './application/commands/design-product.command';
import { SubmitProductForApprovalHandler } from './application/commands/submit-product-for-approval.command';
import { UpdateFeeStructureHandler } from './application/commands/update-fee-structure.command';
import { CalculateFeeProjectionHandler } from './application/queries/calculate-fee-projection.query';
import { GetProductHandler } from './application/queries/get-product.query';
import { GetShareClassHandler } from './application/queries/get-share-class.query';
import { ListProductsHandler } from './application/queries/list-products.query';
import { FeeModelCalculator } from './domain/services/fee-model-calculator';
import { MandateRuleEngine } from './domain/services/mandate-rule-engine';
import {
  FEE_MODEL_CALCULATOR,
  INVESTMENT_PRODUCT_REPOSITORY,
  MANDATE_RULE_ENGINE,
  OUTBOX_PUBLISHER,
  SHARE_CLASS_REPOSITORY,
} from './domain/repositories/repository.tokens';
import { ProductController } from './interface/http/controllers/product.controller';
import { ShareClassController } from './interface/http/controllers/share-class.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { InvestmentProductOrmEntity } from './infrastructure/persistence/entities/investment-product.orm-entity';
import { ShareClassOrmEntity } from './infrastructure/persistence/entities/share-class.orm-entity';
import { PostgresInvestmentProductRepository } from './infrastructure/persistence/postgres-investment-product.repository';
import { PostgresShareClassRepository } from './infrastructure/persistence/postgres-share-class.repository';

const commandHandlers = [
  DesignProductHandler,
  AddShareClassHandler,
  UpdateFeeStructureHandler,
  SubmitProductForApprovalHandler,
  ApproveProductHandler,
  CloseProductHandler,
];

const queryHandlers = [
  GetProductHandler,
  ListProductsHandler,
  GetShareClassHandler,
  CalculateFeeProjectionHandler,
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
        schema: 'product_design_studio',
        entities: [InvestmentProductOrmEntity, ShareClassOrmEntity],
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        autoLoadEntities: true,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
  controllers: [ProductController, ShareClassController],
  providers: [
    { provide: INVESTMENT_PRODUCT_REPOSITORY, useClass: PostgresInvestmentProductRepository },
    { provide: SHARE_CLASS_REPOSITORY, useClass: PostgresShareClassRepository },
    { provide: FEE_MODEL_CALCULATOR, useClass: FeeModelCalculator },
    { provide: MANDATE_RULE_ENGINE, useClass: MandateRuleEngine },
    { provide: OUTBOX_PUBLISHER, useClass: InMemoryOutboxPublisher },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class ProductDesignStudioModule {}
