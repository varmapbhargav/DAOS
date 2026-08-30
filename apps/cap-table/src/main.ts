import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { CapTableModule } from './cap-table.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(CapTableModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Cap Table')
    .setDescription('Cap Table bounded context')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.CAP_TABLE_PORT ?? 3021);
  await app.listen(port);

  console.log(`cap-table listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();