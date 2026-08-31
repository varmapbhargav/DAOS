import {
  CapitalStack,
  CapitalTranche,
  Money,
  OutboxPublisher,
  TenantContextHolder,
  TenantId,
} from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Deal } from '../../domain/aggregates/deal.aggregate';
import { TermSheet } from '../../domain/aggregates/term-sheet.aggregate';
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

    const trancheTypeMap: Record<string, CapitalTranche['type']> = {
      senior: 'SENIOR_DEBT',
      mezzanine: 'MEZZANINE_DEBT',
      juniorDebt: 'JUNIOR_DEBT',
      preferredEquity: 'PREFERRED_EQUITY',
      commonEquity: 'COMMON_EQUITY',
    };

    const capitalStack: CapitalStack | undefined = dto.capitalStack
      ? {
          tranches: dto.capitalStack.tranches.map((t, index) => ({
            trancheId: `tr-${index + 1}`,
            name: t.trancheType,
            type: trancheTypeMap[t.trancheType] ?? 'SENIOR_DEBT',
            currency: t.amountCurrency,
            targetAmount: Money.of(BigInt(t.amountMinorUnits), t.amountCurrency),
            committedAmount: null,
            fundedAmount: null,
            seniority: t.seniority,
            ranking: index + 1,
            economics: {
              interestRateType: 'FIXED',
              fixedRate: null,
              floatingReferenceRate: null,
              spread: null,
              couponFrequency: 'ANNUAL',
              maturityDate: null,
              gracePeriodMonths: 0,
              amortizationType: 'BULLET',
              defaultInterestRate: null,
              pikAllowed: false,
            },
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
      createdBy: TenantContextHolder.get().userId ?? 'system',
    });

    await this.deals.save(deal);
    await this.termSheets.save(termSheet);
    await this.outbox.publish(deal.pullEvents());
    return { dealId: deal.id.value };
  }
}
