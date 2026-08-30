import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { DistributionModule } from './distribution.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(DistributionModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Distribution')
    .setDescription('Distribution & Capital Raising bounded context')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.DISTRIBUTION_PORT ?? 3009);
  await app.listen(port);

  console.log(`distribution listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
