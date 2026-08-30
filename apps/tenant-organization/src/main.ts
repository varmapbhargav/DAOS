import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { TenantOrganizationModule } from './tenant-organization.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(TenantOrganizationModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Tenant Organization')
    .setDescription('Organization profile, billing & subscription, and API-key management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.TENANT_ORG_PORT ?? 3120);
  await app.listen(port);

  console.log(`tenant-organization listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();