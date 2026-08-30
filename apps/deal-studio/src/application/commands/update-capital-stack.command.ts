import { CapitalTranche, CapitalTrancheType, DealId, Money, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId, Percentage } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';

import { DealRepository } from '../../domain/repositories/deal.repository';
import { CAPITAL_STACK_VALIDATOR, DEAL_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { CapitalStackValidator } from '../../domain/services/capital-stack-validator';
import { UpdateCapitalStackDto } from '../dto/capital-stack.dto';

export class UpdateCapitalStackCommand {
  constructor(public readonly dealId: string, public readonly dto: UpdateCapitalStackDto) {}
}

@CommandHandler(UpdateCapitalStackCommand)
export class UpdateCapitalStackHandler implements ICommandHandler<UpdateCapitalStackCommand, { status: string }> {
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly deals: DealRepository,
    @Inject(CAPITAL_STACK_VALIDATOR) private readonly validator: CapitalStackValidator,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute({ dealId, dto }: UpdateCapitalStackCommand): Promise<{ status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const deal = await this.deals.findById(tenantId, DealId.create(dealId));
    if (!deal) throw new NotFoundError(`Deal not found: ${dealId}`);

    const stack = {
      tranches: dto.tranches.map((t): CapitalTranche => ({
        trancheId: randomUUID(),
        name: t.name,
        type: t.type as CapitalTrancheType,
        currency: t.currency,
        targetAmount: Money.of(BigInt(t.targetAmountMinorUnits), t.currency),
        committedAmount: null,
        fundedAmount: null,
        seniority: t.seniority,
        ranking: t.ranking,
        economics: {
          interestRateType: t.economics.interestRateType as any,
          fixedRate: t.economics.fixedRate ?? null,
          floatingReferenceRate: t.economics.floatingReferenceRate ?? null,
          spread: t.economics.spread ?? null,
          couponFrequency: t.economics.couponFrequency as any,
          maturityDate: t.economics.maturityDate ?? null,
          gracePeriodMonths: t.economics.gracePeriodMonths,
          amortizationType: t.economics.amortizationType as any,
          defaultInterestRate: t.economics.defaultInterestRate ?? null,
          pikAllowed: t.economics.pikAllowed,
        },
      })),
    };

    deal.updateCapitalStack(stack, this.validator, dto.actorId);
    await this.deals.save(deal);
    await this.outbox.publish(deal.pullEvents());
    return { status: deal.status };
  }
}
