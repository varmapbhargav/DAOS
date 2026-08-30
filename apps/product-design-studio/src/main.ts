import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ProductDesignStudioModule } from './product-design-studio.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(ProductDesignStudioModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Product Design Studio')
    .setDescription('Product Design Studio bounded context')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.PRODUCT_PORT ?? 3007);
  await app.listen(port);

  console.log(`product-design-studio listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
