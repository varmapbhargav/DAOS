import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { InvestorManagementModule } from './investor-management.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(InvestorManagementModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Investor Management')
    .setDescription('Investor Management & Accreditation bounded context')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.INVESTOR_PORT ?? 3002);
  await app.listen(port);

  console.log(`investor-management listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
