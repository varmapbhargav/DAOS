import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddDocumentVersionHandler } from './application/commands/add-document-version.command';
import { UploadDocumentHandler } from './application/commands/upload-document.command';
import { GenerateDownloadUrlHandler } from './application/queries/generate-download-url.query';
import { GetDocumentVersionHandler } from './application/queries/get-document-version.query';
import { GetDocumentHandler } from './application/queries/get-document.query';
import { ListDocumentsHandler } from './application/queries/list-documents.query';
import { DOCUMENT_REPOSITORY, DOCUMENT_STORAGE, OUTBOX_PUBLISHER } from './domain/repositories/repository.tokens';
import { DocumentController } from './interface/http/controllers/document.controller';
import { DomainExceptionFilter } from './interface/http/filters/domain-exception.filter';
import { TenantContextInterceptor } from './interface/http/interceptors/tenant-context.interceptor';
import { InMemoryOutboxPublisher } from './infrastructure/messaging/in-memory-outbox';
import { DocumentOrmEntity } from './infrastructure/persistence/entities/document.orm-entity';
import { PostgresDocumentRepository } from './infrastructure/persistence/postgres-document.repository';
import { S3DocumentStorageAdapter } from './infrastructure/storage/s3-document-storage.adapter';

const commandHandlers = [UploadDocumentHandler, AddDocumentVersionHandler];

const queryHandlers = [
  GetDocumentHandler,
  ListDocumentsHandler,
  GetDocumentVersionHandler,
  GenerateDownloadUrlHandler,
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
        schema: 'document_management',
        entities: [DocumentOrmEntity],
        synchronize: config.get('DB_SYNC', 'false') === 'true',
        autoLoadEntities: true,
        logging: config.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
  ],
  controllers: [DocumentController],
  providers: [
    { provide: DOCUMENT_REPOSITORY, useClass: PostgresDocumentRepository },
    { provide: DOCUMENT_STORAGE, useClass: S3DocumentStorageAdapter },
    { provide: OUTBOX_PUBLISHER, useClass: InMemoryOutboxPublisher },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class DocumentManagementModule {}