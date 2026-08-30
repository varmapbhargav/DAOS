import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { LegalEntityStudioModule } from './legal-entity-studio.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(LegalEntityStudioModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Legal Entity Studio')
    .setDescription('Legal Entity Structuring bounded context')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.LEGAL_ENTITY_PORT ?? 3006);
  await app.listen(port);

  console.log(`legal-entity-studio listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
