import { ConflictError, DomainInvariantError, InvalidCredentialsError, NotFoundError } from '@daos/shared-kernel';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = 500;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof ConflictError) {
      status = 409;
      message = exception.message;
    } else if (exception instanceof NotFoundError) {
      status = 404;
      message = exception.message;
    } else if (exception instanceof InvalidCredentialsError) {
      status = 401;
      message = exception.message;
    } else if (exception instanceof DomainInvariantError) {
      status = 400;
      message = exception.message;
    } else if (exception instanceof UnauthorizedException) {
      status = 401;
      message = exception.message;
    } else if (exception instanceof ForbiddenException) {
      status = 403;
      message = exception.message;
    } else if (exception instanceof BadRequestException) {
      status = 400;
      const body = exception.getResponse();
      message =
        typeof body === 'string' ? body : ((body as { message?: string | string[] }).message ?? exception.message);
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({ statusCode: status, message, path: request.url });
  }
}