import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { GovernanceModule } from './governance.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(GovernanceModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Governance Service')
    .setDescription('Proposal voting, meeting scheduling, governance operations')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.GOVERNANCE_PORT ?? 3020);
  await app.listen(port);
  console.log(`governance listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
