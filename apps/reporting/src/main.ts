import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ReportingModule } from './reporting.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(ReportingModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Reporting Service')
    .setDescription('NAV calculation, performance metrics, investor statements')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.REPORTING_PORT ?? 3014);
  await app.listen(port);
  console.log(`reporting listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
