import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { JwtVerifyMiddleware } from './auth/jwt-verify.middleware';
import { MeController } from './me/me.controller';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { TenantResolutionMiddleware } from './middleware/tenant-resolution.middleware';
import { IdentityHttpClient } from './proxy/identity-http.client';
import { InMemoryRateLimiter } from './rate-limit/in-memory-rate-limiter';
import { RATE_LIMITER } from './rate-limit/rate-limiter.port';

@Module({
  controllers: [MeController],
  providers: [IdentityHttpClient, { provide: RATE_LIMITER, useClass: InMemoryRateLimiter }],
})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Explicit prefixes (no '*' wildcard — Express 5 / path-to-regexp v8 dropped bare '*').
    consumer
      .apply(TenantResolutionMiddleware, RateLimitMiddleware)
      .forRoutes('auth', 'tenants', 'users', 'roles', 'me');
    consumer.apply(JwtVerifyMiddleware).forRoutes('tenants', 'users', 'roles', 'me');
  }
}
