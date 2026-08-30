import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { IssuanceStudioModule } from './issuance-studio.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(IssuanceStudioModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Issuance Studio')
    .setDescription('Issuance Studio bounded context')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.ISSUANCE_PORT ?? 3008);
  await app.listen(port);

  console.log(`issuance-studio listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();