import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ComplianceModule } from './compliance.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(ComplianceModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Compliance Service')
    .setDescription('Regulatory filings, compliance rules, investor counting')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.COMPLIANCE_PORT ?? 3013);
  await app.listen(port);
  console.log(`compliance listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
