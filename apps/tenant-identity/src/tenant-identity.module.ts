import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssignRoleHandler } from './application/commands/assign-role.command';
import { LoginHandler } from './application/commands/login.command';
import { LogoutHandler } from './application/commands/logout.command';
import { OnboardUserHandler } from './application/commands/onboard-user.command';
import { ProvisionTenantHandler } from './application/commands/provision-tenant.command';
import { RefreshTokenHandler } from './application/commands/refresh-token.command';
import { RevokeRoleHandler } from './application/commands/revoke-role.command';
import { SuspendUserHandler } from './application/commands/suspend-user.command';
import { UpdateWhiteLabelHandler } from './application/commands/update-white-label.command';
import { OutboxDispatcher } from './application/events/outbox-dispatcher';
import { GetMyProfileHandler } from './application/queries/get-my-profile.query';
import { GetTenantHandler } from './application/queries/get-tenant.query';
import { GetUserHandler } from './application/queries/get-user.query';
import { ListRolesHandler } from './application/queries/list-roles.query';
import { ListUsersHandler } from './application/queries/list-users.query';
import {
  CLOCK,
  IDEMPOTENCY_STORE,
  IDENTITY_PROVIDER,
  OUTBOX_PUBLISHER,
  ROLE_REPOSITORY,
  TENANT_REPOSITORY,
  USER_REPOSITORY,
} from './domain/repositories/repository.tokens';
import { TenantProvisioningService } from './domain/services/tenant-provisioning.service';
import { JwtIdentityAdapter } from './infrastructure/auth/jwt-identity.adapter';
import { PlatformSeeder } from './infrastructure/auth/platform-seeder';
import { SystemClock } from './infrastructure/clock/system-clock';
import { StubBillingAdapter } from './infrastructure/external/billing.adapter';
import { InMemoryIdempotencyStore } from './infrastructure/idempotency/in-memory-idempotency.store';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { InMemoryRoleRepository } from './infrastructure/persistence/in-memory-role.repository';
import { InMemoryTenantRepository } from './infrastructure/persistence/in-memory-tenant.repository';
import { InMemoryUserRepository } from './infrastructure/persistence/in-memory-user.repository';
import { PostgresRoleRepository } from './infrastructure/persistence/postgres-role.repository';
import { PostgresTenantRepository } from './infrastructure/persistence/postgres-tenant.repository';
import { PostgresUserRepository } from './infrastructure/persistence/postgres-user.repository';
import { AuthController } from './interface/http/controllers/auth.controller';
import { MeController } from './interface/http/controllers/me.controller';
import { RoleController } from './interface/http/controllers/role.controller';
import { TenantController } from './interface/http/controllers/tenant.controller';
import { UserController } from './interface/http/controllers/user.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';
import { TenantOrmEntity } from './infrastructure/persistence/entities/tenant.orm-entity';
import { RoleOrmEntity } from './infrastructure/persistence/entities/role.orm-entity';
import { UserOrmEntity } from './infrastructure/persistence/entities/user.orm-entity';

const commandHandlers = [
  ProvisionTenantHandler,
  LoginHandler,
  LogoutHandler,
  RefreshTokenHandler,
  OnboardUserHandler,
  AssignRoleHandler,
  RevokeRoleHandler,
  SuspendUserHandler,
  UpdateWhiteLabelHandler,
];

const queryHandlers = [GetTenantHandler, ListUsersHandler, GetUserHandler, ListRolesHandler, GetMyProfileHandler];

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
        schema: 'tenant_identity',
        entities: [TenantOrmEntity, RoleOrmEntity, UserOrmEntity],
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        autoLoadEntities: true,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
  controllers: [AuthController, TenantController, UserController, RoleController, MeController],
  providers: [
    { provide: TENANT_REPOSITORY, useClass: PostgresTenantRepository },
    { provide: USER_REPOSITORY, useClass: PostgresUserRepository },
    { provide: ROLE_REPOSITORY, useClass: PostgresRoleRepository },
    { provide: IDENTITY_PROVIDER, useClass: JwtIdentityAdapter },
    {
      provide: OUTBOX_PUBLISHER,
      useFactory: (config: ConfigService) => {
        const useRedis = config.get('USE_REDIS', 'false') === 'true';
        return useRedis ? new InMemoryOutboxPublisher() : new InMemoryOutboxPublisher();
      },
      inject: [ConfigService],
    },
    { provide: CLOCK, useClass: SystemClock },
    {
      provide: IDEMPOTENCY_STORE,
      useFactory: (config: ConfigService) => {
        const useRedis = config.get('USE_REDIS', 'false') === 'true';
        return useRedis ? InMemoryIdempotencyStore : InMemoryIdempotencyStore;
      },
      inject: [ConfigService],
    },
    StubBillingAdapter,
    TenantProvisioningService,
    PlatformSeeder,
    OutboxDispatcher,
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class TenantIdentityModule {}