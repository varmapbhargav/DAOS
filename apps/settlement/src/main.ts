import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { SettlementModule } from './settlement.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(SettlementModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Settlement')
    .setDescription('Settlement & Clearing bounded context')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.SETTLEMENT_PORT ?? 3012);
  await app.listen(port);

  console.log(`settlement listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
