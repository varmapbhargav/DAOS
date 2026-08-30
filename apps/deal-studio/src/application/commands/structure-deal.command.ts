import {
  CapitalStack,
  Money,
  OutboxPublisher,
  TenantContextHolder,
  TenantId,
} from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Deal } from '../../domain/aggregates/deal.aggregate';
import { TermSheet } from '../../domain/entities/term-sheet.entity';
import {
  DEAL_REPOSITORY,
  OUTBOX_PUBLISHER,
  TERM_SHEET_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { DealRepository } from '../../domain/repositories/deal.repository';
import { TermSheetRepository } from '../../domain/repositories/term-sheet.repository';
import { StructureDealDto } from '../dto/structure-deal.dto';

export class StructureDealCommand {
  constructor(public readonly dto: StructureDealDto) {}
}

@CommandHandler(StructureDealCommand)
export class StructureDealHandler implements ICommandHandler<StructureDealCommand, { dealId: string }> {
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly deals: DealRepository,
    @Inject(TERM_SHEET_REPOSITORY) private readonly termSheets: TermSheetRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: StructureDealCommand): Promise<{ dealId: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const capitalStack: CapitalStack | undefined = dto.capitalStack
      ? {
          tranches: dto.capitalStack.tranches.map((t) => ({
            trancheType: t.trancheType as CapitalStack['tranches'][number]['trancheType'],
            amount: Money.of(BigInt(t.amountMinorUnits), t.amountCurrency),
            coupon: t.coupon,
            seniority: t.seniority,
          })),
        }
      : undefined;

    const deal = Deal.structure({
      tenantId,
      name: dto.name,
      assetId: dto.assetId,
      sponsorId: dto.sponsorId,
      capitalStack,
    });

    const termSheet = TermSheet.create({
      tenantId,
      dealId: deal.id.value,
    });

    await this.deals.save(deal);
    await this.termSheets.save(termSheet);
    await this.outbox.publish(deal.pullEvents());
    return { dealId: deal.id.value };
  }
}
