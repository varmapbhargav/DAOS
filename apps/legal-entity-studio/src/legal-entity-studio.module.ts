import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivateEntityHandler } from './application/commands/activate-entity.command';
import { AddEntityDocumentHandler } from './application/commands/add-entity-document.command';
import { AppointRegisteredAgentHandler } from './application/commands/appoint-registered-agent.command';
import { DissolveLegalEntityHandler } from './application/commands/dissolve-legal-entity.command';
import { FormLegalEntityHandler } from './application/commands/form-legal-entity.command';
import { UpdateEntityHierarchyHandler } from './application/commands/update-entity-hierarchy.command';
import { GetCorporateDocumentHandler } from './application/queries/get-corporate-document.query';
import { GetEntityHierarchyHandler } from './application/queries/get-entity-hierarchy.query';
import { GetLegalEntityHandler } from './application/queries/get-legal-entity.query';
import { ListLegalEntitiesHandler } from './application/queries/list-legal-entities.query';
import {
  CORPORATE_DOCUMENT_REPOSITORY,
  ESIGNATURE_PROVIDER,
  LEGAL_ENTITY_REPOSITORY,
  LEGAL_FORMATION_PROVIDER,
  OUTBOX_PUBLISHER,
} from './domain/repositories/repository.tokens';
import { CorporateDocumentController } from './interface/http/controllers/corporate-document.controller';
import { LegalEntityController } from './interface/http/controllers/legal-entity.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { StubDocuSignAdapter } from './infrastructure/providers/stub-docusign.adapter';
import { StubLegalFormationAdapter } from './infrastructure/providers/stub-legal-formation.adapter';
import { CorporateDocumentOrmEntity } from './infrastructure/persistence/entities/corporate-document.orm-entity';
import { LegalEntityOrmEntity } from './infrastructure/persistence/entities/legal-entity.orm-entity';
import { PostgresCorporateDocumentRepository } from './infrastructure/persistence/postgres-corporate-document.repository';
import { PostgresLegalEntityRepository } from './infrastructure/persistence/postgres-legal-entity.repository';

const commandHandlers = [
  FormLegalEntityHandler,
  ActivateEntityHandler,
  AddEntityDocumentHandler,
  AppointRegisteredAgentHandler,
  UpdateEntityHierarchyHandler,
  DissolveLegalEntityHandler,
];

const queryHandlers = [
  GetLegalEntityHandler,
  ListLegalEntitiesHandler,
  GetCorporateDocumentHandler,
  GetEntityHierarchyHandler,
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
        schema: 'legal_entity_studio',
        entities: [LegalEntityOrmEntity, CorporateDocumentOrmEntity],
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        autoLoadEntities: true,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
  controllers: [LegalEntityController, CorporateDocumentController],
  providers: [
    { provide: LEGAL_ENTITY_REPOSITORY, useClass: PostgresLegalEntityRepository },
    { provide: CORPORATE_DOCUMENT_REPOSITORY, useClass: PostgresCorporateDocumentRepository },
    { provide: LEGAL_FORMATION_PROVIDER, useClass: StubLegalFormationAdapter },
    { provide: ESIGNATURE_PROVIDER, useClass: StubDocuSignAdapter },
    { provide: OUTBOX_PUBLISHER, useClass: InMemoryOutboxPublisher },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class LegalEntityStudioModule {}
