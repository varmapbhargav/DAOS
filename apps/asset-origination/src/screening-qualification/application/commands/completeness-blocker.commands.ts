import { BlockerId, BlockerResolutionStatus, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  BLOCKER_REPOSITORY,
  COMPLETENESS_RESULT_REPOSITORY,
  OUTBOX_PUBLISHER,
} from '../../../domain/repositories/repository.tokens';
import { Blocker } from '../../domain/entities/blocker.entity';
import { CompletenessResult } from '../../domain/entities/completeness-result.entity';
import { BlockerRaised } from '../../domain/events/blocker-raised.event';
import { BlockerResolved } from '../../domain/events/blocker-resolved.event';
import { CompletenessCalculated } from '../../domain/events/completeness-calculated.event';
import { BlockerRepository } from '../../domain/repositories/blocker.repository';
import { CompletenessResultRepository } from '../../domain/repositories/completeness-result.repository';
import {
  AssignBlockerDto,
  CalculateCompletenessDto,
  RaiseBlockerDto,
  ResolveBlockerDto,
} from '../dto/completeness-blocker.dto';

export class CalculateCompletenessCommand {
  constructor(public readonly caseId: string, public readonly dto: CalculateCompletenessDto) {}
}

export class RaiseBlockerCommand {
  constructor(public readonly caseId: string, public readonly dto: RaiseBlockerDto) {}
}

export class ResolveBlockerCommand {
  constructor(public readonly blockerId: string, public readonly dto: ResolveBlockerDto) {}
}

export class AssignBlockerCommand {
  constructor(public readonly blockerId: string, public readonly dto: AssignBlockerDto) {}
}

@CommandHandler(CalculateCompletenessCommand)
export class CalculateCompletenessHandler
  implements ICommandHandler<CalculateCompletenessCommand, { completenessId: string }>
{
  constructor(
    @Inject(COMPLETENESS_RESULT_REPOSITORY) private readonly completions: CompletenessResultRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CalculateCompletenessCommand): Promise<{ completenessId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;

    const result = CompletenessResult.create({
      tenantId,
      caseId: command.caseId,
      breakdown: command.dto.breakdown,
      calculatedBy: actor,
    });

    await this.completions.save(result);

    const event = new CompletenessCalculated(
      command.caseId,
      tenantId.value,
      result.id.value,
      result.breakdown.overall,
      result.breakdown,
      actor,
    );
    await this.outbox.publish([event]);

    return { completenessId: result.id.value };
  }
}

@CommandHandler(RaiseBlockerCommand)
export class RaiseBlockerHandler implements ICommandHandler<RaiseBlockerCommand, { blockerId: string }> {
  constructor(
    @Inject(BLOCKER_REPOSITORY) private readonly blockers: BlockerRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RaiseBlockerCommand): Promise<{ blockerId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const dto = command.dto;

    const blocker = Blocker.create({
      tenantId,
      caseId: command.caseId,
      severity: dto.severity,
      category: dto.category,
      description: dto.description,
      owner: dto.owner,
      dueDate: dto.dueDate,
      resolutionAction: dto.resolutionAction,
      evidenceReferences: dto.evidenceReferences,
    });

    await this.blockers.save(blocker);

    const event = new BlockerRaised(
      command.caseId,
      tenantId.value,
      blocker.id.value,
      blocker.severity,
      blocker.category,
      blocker.description,
    );
    await this.outbox.publish([event]);

    return { blockerId: blocker.id.value };
  }
}

@CommandHandler(ResolveBlockerCommand)
export class ResolveBlockerHandler implements ICommandHandler<ResolveBlockerCommand, void> {
  constructor(
    @Inject(BLOCKER_REPOSITORY) private readonly blockers: BlockerRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ResolveBlockerCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actor = TenantContextHolder.get().userId ?? tenantId.value;
    const blocker = await this.blockers.findById(tenantId, BlockerId.create(command.blockerId));
    if (!blocker) throw new Error('Blocker not found');
    blocker.resolve({
      status: command.dto.status as BlockerResolutionStatus,
      by: actor,
      reason: command.dto.reason,
    });
    await this.blockers.save(blocker);

    const event = new BlockerResolved(
      blocker.caseId,
      tenantId.value,
      blocker.id.value,
      blocker.resolutionStatus,
      actor,
      blocker.resolvedReason,
    );
    await this.outbox.publish([event]);
  }
}

@CommandHandler(AssignBlockerCommand)
export class AssignBlockerHandler implements ICommandHandler<AssignBlockerCommand, void> {
  constructor(@Inject(BLOCKER_REPOSITORY) private readonly blockers: BlockerRepository) {}

  async execute(command: AssignBlockerCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const blocker = await this.blockers.findById(tenantId, BlockerId.create(command.blockerId));
    if (!blocker) throw new Error('Blocker not found');
    blocker.assign(command.dto.owner ?? blocker.owner, command.dto.dueDate ?? blocker.dueDate, command.dto.resolutionAction ?? blocker.resolutionAction);
    await this.blockers.save(blocker);
  }
}