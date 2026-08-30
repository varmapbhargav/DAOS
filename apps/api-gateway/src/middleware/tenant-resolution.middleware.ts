import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class TenantResolutionMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const headerTenant = req.headers['x-tenant-id'];
    let tenantKey: string | null = typeof headerTenant === 'string' ? headerTenant : null;
    if (!tenantKey) {
      const host = req.headers.host ?? '';
      const firstLabel = host.split('.')[0];
      // localhost and bare IPs are not tenant subdomains
      if (firstLabel && firstLabel !== 'localhost' && !/^\d+$/.test(firstLabel)) {
        tenantKey = firstLabel;
      }
    }
    (req as Request & { tenantKey?: string | null }).tenantKey = tenantKey;
    next();
  }
}
