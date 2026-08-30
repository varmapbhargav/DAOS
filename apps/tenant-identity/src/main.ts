import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { TenantIdentityModule } from './tenant-identity.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(TenantIdentityModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Tenant & Identity')
    .setDescription('Tenant Management & Identity bounded context')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.IDENTITY_PORT ?? 3001);
  await app.listen(port);
   
  console.log(`tenant-identity listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
