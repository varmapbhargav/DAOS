import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { DealStudioModule } from './deal-studio.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(DealStudioModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Deal Studio')
    .setDescription('Deal Studio bounded context')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.DEAL_PORT ?? 3005);
  await app.listen(port);

  console.log(`deal-studio listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
