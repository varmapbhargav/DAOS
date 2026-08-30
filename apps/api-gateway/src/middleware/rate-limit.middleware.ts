import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { RATE_LIMITER, RateLimiter } from '../rate-limit/rate-limiter.port';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(@Inject(RATE_LIMITER) private readonly limiter: RateLimiter) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const tenantKey = (req as Request & { tenantKey?: string | null }).tenantKey;
    const key = tenantKey ?? req.ip ?? 'anonymous';
    if (!(await this.limiter.allow(key))) {
      res.status(429).json({ statusCode: 429, message: 'Too many requests' });
      return;
    }
    next();
  }
}
