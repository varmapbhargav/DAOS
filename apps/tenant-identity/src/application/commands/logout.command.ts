import { IdempotencyStore } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { IDEMPOTENCY_STORE } from '../../domain/repositories/repository.tokens';

export class LogoutCommand {
  constructor(public readonly jti: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(@Inject(IDEMPOTENCY_STORE) private readonly idempotency: IdempotencyStore) {}

  async execute(command: LogoutCommand): Promise<void> {
    await this.idempotency.mark(`jti-denylist:${command.jti}`);
  }
}
