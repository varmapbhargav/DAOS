import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AssetOriginationModule } from './asset-origination.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AssetOriginationModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Asset Origination')
    .setDescription('Asset Origination bounded context')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.ASSET_PORT ?? 3003);
  await app.listen(port);

  console.log(`asset-origination listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
