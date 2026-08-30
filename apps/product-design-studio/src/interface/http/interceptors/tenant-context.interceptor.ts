import { TenantContextHolder } from '@daos/shared-kernel';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const auth = request.auth as { tenantId?: string; userId?: string; roleIds?: string[]; permissions?: string[]; platform?: boolean } | undefined;
    const tenantId =
      (typeof request.headers?.['x-tenant-id'] === 'string' && request.headers['x-tenant-id']) ||
      auth?.tenantId ||
      null;

    TenantContextHolder.enterWith({
      tenantId,
      userId: auth?.userId ?? null,
      roleIds: auth?.roleIds ?? [],
      permissions: auth?.permissions ?? [],
      isPlatform: auth?.platform ?? false,
    });
    return next.handle();
  }
}
