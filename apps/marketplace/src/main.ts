import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { MarketplaceModule } from './marketplace.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(MarketplaceModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Marketplace')
    .setDescription('Marketplace trading & order matching bounded context')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.MARKETPLACE_PORT ?? 3010);
  await app.listen(port);

  console.log(`marketplace listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
