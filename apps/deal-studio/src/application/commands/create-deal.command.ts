import { DomainMetadata, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId, DealRole, hasPermission } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Deal } from '../../domain/aggregates/deal.aggregate';
import { TermSheet } from '../../domain/aggregates/term-sheet.aggregate';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { TermSheetRepository } from '../../domain/repositories/term-sheet.repository';
import {
  DEAL_REPOSITORY,
  OUTBOX_PUBLISHER,
  TERM_SHEET_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { CreateDealDto } from '../dto/create-deal.dto';
import { DealMetadata } from '@daos/shared-kernel';

export class CreateDealCommand {
  constructor(public readonly dto: CreateDealDto) {}
}

@CommandHandler(CreateDealCommand)
export class CreateDealHandler implements ICommandHandler<CreateDealCommand, { dealId: string }> {
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly deals: DealRepository,
    @Inject(TERM_SHEET_REPOSITORY) private readonly termSheets: TermSheetRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: CreateDealCommand): Promise<{ dealId: string }> {
    const { dto } = command;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const actorId = dto.actorId;
    const roleIds = TenantContextHolder.get().roleIds;

    // Validate creator permission
    if (!hasPermission(roleIds, 'create:deal')) {
      throw new Error(`User with roles ${roleIds.join(', ')} does not have permission to create deals`);
    }

    const deal = Deal.create({
      tenantId,
      name: dto.name,
      assetId: dto.assetId,
      sponsorId: dto.sponsorId,
      actorId,
      metadata: dto.metadata as unknown as DealMetadata | undefined,
      opportunityId: dto.opportunityId,
      idempotencyKey: dto.idempotencyKey,
    });

    const termSheet = TermSheet.create({
      tenantId,
      dealId: deal.id.value,
      createdBy: actorId,
    });

    await this.deals.save(deal);
    await this.termSheets.save(termSheet);
    await this.outbox.publish(deal.pullEvents());
    return { dealId: deal.id.value };
  }
}
