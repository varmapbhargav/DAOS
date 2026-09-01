import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationKafkaOutboxPublisher } from './infrastructure/messaging/organization-kafka-outbox.publisher';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { StubBillingProvider } from './infrastructure/external/stub-billing.provider';

import { OnboardTenantHandler } from './application/commands/onboard-tenant.command';
import { UpdateTenantProfileHandler } from './application/commands/update-tenant-profile.command';
import { ChangeBillingPlanHandler } from './application/commands/change-billing-plan.command';
import { AddPaymentMethodHandler } from './application/commands/add-payment-method.command';
import { RecordUsageHandler } from './application/commands/record-usage.command';
import { CancelSubscriptionHandler } from './application/commands/cancel-subscription.command';
import { IssueApiKeyHandler } from './application/commands/issue-api-key.command';
import { RotateApiKeyHandler } from './application/commands/rotate-api-key.command';
import { RevokeApiKeyHandler } from './application/commands/revoke-api-key.command';
import { GetTenantProfileHandler } from './application/queries/get-tenant-profile.query';
import { GetBillingSummaryHandler } from './application/queries/get-billing-summary.query';
import { ListApiKeysHandler } from './application/queries/list-api-keys.query';
import { GetApiKeyHandler } from './application/queries/get-api-key.query';

import { PostgresTenantProfileRepository } from './infrastructure/persistence/postgres-tenant-profile.repository';
import { PostgresServiceEntitlementRepository } from './infrastructure/persistence/postgres-service-entitlement.repository';
import { PostgresApiKeyRepository } from './infrastructure/persistence/postgres-api-key.repository';

import { TenantProfileOrmEntity } from './infrastructure/persistence/entities/organization.orm-entities';
import { ServiceEntitlementOrmEntity } from './infrastructure/persistence/entities/organization.orm-entities';
import { ApiKeyOrmEntity } from './infrastructure/persistence/entities/organization.orm-entities';

import { OrganizationController } from './interface/http/controllers/organization.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';

import {
  TENANT_PROFILE_REPOSITORY,
  SERVICE_ENTITLEMENT_REPOSITORY,
  API_KEY_REPOSITORY,
  BILLING_PROVIDER_PORT,
  OUTBOX_PUBLISHER,
} from './domain/repositories/repository.tokens';

const commandHandlers = [
  OnboardTenantHandler,
  UpdateTenantProfileHandler,
  ChangeBillingPlanHandler,
  AddPaymentMethodHandler,
  RecordUsageHandler,
  CancelSubscriptionHandler,
  IssueApiKeyHandler,
  RotateApiKeyHandler,
  RevokeApiKeyHandler,
];

const queryHandlers = [
  GetTenantProfileHandler,
  GetBillingSummaryHandler,
  ListApiKeysHandler,
  GetApiKeyHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forRootAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USER ?? 'daos',
        password: process.env.DB_PASSWORD ?? 'daos_dev_password',
        database: process.env.DB_NAME ?? 'daos_tenant_organization',
        entities: [
          TenantProfileOrmEntity,
          ServiceEntitlementOrmEntity,
          ApiKeyOrmEntity,
        ],
        synchronize: process.env.DB_SYNC ?? 'false' === 'true',
        autoLoadEntities: true,
        logging: process.env.DB_LOGGING ?? 'false' === 'true',
      }),
    }),
    TypeOrmModule.forFeature([
      TenantProfileOrmEntity,
      ServiceEntitlementOrmEntity,
      ApiKeyOrmEntity,
    ]),
  ],
  controllers: [OrganizationController],
  providers: [
    {
      provide: OUTBOX_PUBLISHER,
      useClass: InMemoryOutboxPublisher,
    },
    OrganizationKafkaOutboxPublisher,
    { provide: BILLING_PROVIDER_PORT, useClass: StubBillingProvider },
    { provide: TENANT_PROFILE_REPOSITORY, useClass: PostgresTenantProfileRepository },
    { provide: SERVICE_ENTITLEMENT_REPOSITORY, useClass: PostgresServiceEntitlementRepository },
    { provide: API_KEY_REPOSITORY, useClass: PostgresApiKeyRepository },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ApiKeyService,
    BillingPlanEnforcer,
    UsageMeteringService,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class TenantOrganizationModule {}