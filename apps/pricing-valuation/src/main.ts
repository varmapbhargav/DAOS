import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { PricingValuationModule } from './pricing-valuation.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(PricingValuationModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('DAOS Pricing & Valuation')
    .setDescription('Pricing feeds, fair value & valuation models bounded context')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.PRICING_PORT ?? 3018);
  await app.listen(port);

  console.log(`pricing-valuation listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
