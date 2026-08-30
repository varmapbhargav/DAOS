import { TenantContextHolder } from '@daos/shared-kernel';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

import { AuthContext } from '../decorators/current-user.decorator';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const auth: AuthContext | undefined = request.auth;
    TenantContextHolder.enterWith({
      tenantId: auth?.tenantId ?? null,
      userId: auth?.userId ?? null,
      roleIds: auth?.roleIds ?? [],
      permissions: auth?.permissions ?? [],
      isPlatform: auth?.platform ?? false,
    });
    return next.handle();
  }
}
