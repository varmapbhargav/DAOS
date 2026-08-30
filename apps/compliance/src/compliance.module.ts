import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ComplianceRuleRepository } from './domain/repositories/compliance-rule.repository';
import { RegulatoryFilingRepository } from './domain/repositories/regulatory-filing.repository';
import { InvestorCountRepository } from './domain/repositories/investor-count.repository';
import { ComplianceRuleService } from './domain/services/compliance-rule.service';
import { BeneficialOwnershipMonitor } from './domain/services/beneficial-ownership.monitor';

import { ComplianceController } from './interface/http/controllers/compliance.controller';
import { RegulatoryController } from './interface/http/controllers/regulatory.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigModule) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 5432),
        username: config.get('DB_USER', 'daos'),
        password: config.get('DB_PASSWORD', 'daos_dev_password'),
        database: config.get('DB_NAME', 'daos'),
        schema: 'compliance',
        autoLoadEntities: true,
      }),
      inject: [ConfigModule],
    }),
  ],
  controllers: [ComplianceController, RegulatoryController],
  providers: [
    { provide: ComplianceRuleRepository, useClass: ComplianceRuleRepository },
    { provide: RegulatoryFilingRepository, useClass: RegulatoryFilingRepository },
    { provide: InvestorCountRepository, useClass: InvestorCountRepository },
    ComplianceRuleService,
    BeneficialOwnershipMonitor,
  ],
})
export class ComplianceModule {}
