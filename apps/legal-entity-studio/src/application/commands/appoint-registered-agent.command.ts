import { LegalEntityId, NotFoundError, OutboxPublisher, RegisteredAgent, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LEGAL_ENTITY_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { LegalEntityRepository } from '../../domain/repositories/legal-entity.repository';
import { AppointRegisteredAgentDto } from '../dto/entity-action.dto';

export class AppointRegisteredAgentCommand {
  constructor(
    public readonly entityId: string,
    public readonly dto: AppointRegisteredAgentDto,
  ) {}
}

@CommandHandler(AppointRegisteredAgentCommand)
export class AppointRegisteredAgentHandler
  implements ICommandHandler<AppointRegisteredAgentCommand, { agencyName: string }>
{
  constructor(
    @Inject(LEGAL_ENTITY_REPOSITORY) private readonly entities: LegalEntityRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: AppointRegisteredAgentCommand): Promise<{ agencyName: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const entity = await this.entities.findById(tenantId, LegalEntityId.create(command.entityId));
    if (!entity) throw new NotFoundError(`Legal entity not found: ${command.entityId}`);

    const agent: RegisteredAgent = {
      agencyName: command.dto.agencyName,
      agentRef: command.dto.agentRef,
      jurisdiction: command.dto.jurisdiction,
      goodStandingDate: command.dto.goodStandingDate,
    };
    entity.appointRegisteredAgent(agent);
    await this.entities.save(entity);
    await this.outbox.publish(entity.pullEvents());
    return { agencyName: agent.agencyName };
  }
}