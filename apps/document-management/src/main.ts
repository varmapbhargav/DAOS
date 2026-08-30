import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { DocumentManagementModule } from './document-management.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(DocumentManagementModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Document Management')
    .setDescription('Document Management bounded context')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.DOCUMENT_PORT ?? 3015);
  await app.listen(port);

  console.log(`document-management listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();