import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { OpportunityEngineeringModule } from './opportunity-engineering.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(OpportunityEngineeringModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Opportunity Engineering')
    .setDescription('Opportunity Engineering bounded context')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.OPPORTUNITY_PORT ?? 3004);
  await app.listen(port);

  console.log(`opportunity-engineering listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
