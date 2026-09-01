import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NavCalculationRepository } from './domain/repositories/nav-calculation.repository';
import { PerformanceMetricRepository } from './domain/repositories/performance-metric.repository';
import { InvestorStatementRepository } from './domain/repositories/investor-statement.repository';
import { DocumentRepository } from './domain/repositories/document.repository';
import { DocumentVersionRepository } from './domain/repositories/document-version.repository';
import { CapTableRepository } from './domain/repositories/cap-table.repository';
import { ShareholderRecordRepository } from './domain/repositories/shareholder-record.repository';

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
        database: config.get('DB_NAME', 'daos_reporting'),

        autoLoadEntities: true,
      }),
      inject: [ConfigModule],
    }),
  ],
  providers: [
    NavCalculationRepository,
    PerformanceMetricRepository,
    InvestorStatementRepository,
    DocumentRepository,
    DocumentVersionRepository,
    CapTableRepository,
    ShareholderRecordRepository,
  ],
})
export class ReportingModule {}
