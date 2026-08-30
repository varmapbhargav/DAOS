import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApproveKycHandler } from './application/commands/approve-kyc.command';
import { LinkWalletHandler } from './application/commands/link-wallet.command';
import { RegisterInvestorHandler } from './application/commands/register-investor.command';
import { RejectKycHandler } from './application/commands/reject-kyc.command';
import { SubmitKycHandler } from './application/commands/submit-kyc.command';
import { SuspendInvestorHandler } from './application/commands/suspend-investor.command';
import { UpdateRiskProfileHandler } from './application/commands/update-risk-profile.command';
import { VerifyAccreditationHandler } from './application/commands/verify-accreditation.command';
import { CheckInvestorEligibilityHandler } from './application/queries/check-investor-eligibility.query';
import { GetInvestorHandler } from './application/queries/get-investor.query';
import { GetKycProfileHandler } from './application/queries/get-kyc-profile.query';
import { ListInvestorsHandler } from './application/queries/list-investors.query';
import {
  INVESTOR_REPOSITORY,
  KYC_PROFILE_REPOSITORY,
  KYC_PROVIDER,
  OUTBOX_PUBLISHER,
} from './domain/repositories/repository.tokens';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { InvestorController } from './interface/http/controllers/investor.controller';
import { KycController } from './interface/http/controllers/kyc.controller';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';
import { InvestorGrpcService } from './interface/grpc/investor.grpc-service';
import { SumsubKycAdapter } from './infrastructure/kyc/sumsub-kyc.adapter';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { InvestorOrmEntity } from './infrastructure/persistence/entities/investor.orm-entity';
import { KycProfileOrmEntity } from './infrastructure/persistence/entities/kyc-profile.orm-entity';
import { PostgresInvestorRepository } from './infrastructure/persistence/postgres-investor.repository';
import { PostgresKycProfileRepository } from './infrastructure/persistence/postgres-kyc-profile.repository';

const commandHandlers = [
  RegisterInvestorHandler,
  SubmitKycHandler,
  ApproveKycHandler,
  RejectKycHandler,
  VerifyAccreditationHandler,
  LinkWalletHandler,
  UpdateRiskProfileHandler,
  SuspendInvestorHandler,
];

const queryHandlers = [
  GetInvestorHandler,
  ListInvestorsHandler,
  GetKycProfileHandler,
  CheckInvestorEligibilityHandler,
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
        schema: 'investor_management',
        entities: [InvestorOrmEntity, KycProfileOrmEntity],
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        autoLoadEntities: true,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
  controllers: [InvestorController, KycController],
  providers: [
    { provide: INVESTOR_REPOSITORY, useClass: PostgresInvestorRepository },
    { provide: KYC_PROFILE_REPOSITORY, useClass: PostgresKycProfileRepository },
    { provide: KYC_PROVIDER, useClass: SumsubKycAdapter },
    { provide: OUTBOX_PUBLISHER, useClass: InMemoryOutboxPublisher },
    InvestorGrpcService,
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class InvestorManagementModule {}
