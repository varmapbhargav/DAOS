import { Money, OutboxPublisher, PricingVendorPort, TenantContextHolder, TenantId, ValuationAgentPort } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ValuationModel } from '../../domain/aggregates/valuation-model.aggregate';
import {
  OUTBOX_PUBLISHER,
  PRICING_VENDOR_PORT,
  VALUATION_AGENT_PORT,
  VALUATION_MODEL_REPOSITORY,
} from '../../domain/repositories/repository.tokens';
import { ValuationModelRepository } from '../../domain/repositories/valuation-model.repository';
import { RunValuationDto } from '../dto/pricing.dto';
import { toMoney } from '../money.mapper';

function divergence(model: Money, vendor: Money): number {
  if (model.currency !== vendor.currency || vendor.amount === 0n) return 1;
  const diff = model.amount - vendor.amount;
  const abs = diff < 0n ? -diff : diff;
  return Number((abs * 100n) / vendor.amount) / 100;
}

export class RunValuationCommand {
  constructor(public readonly dto: RunValuationDto) {}
}

@CommandHandler(RunValuationCommand)
export class RunValuationHandler implements ICommandHandler<RunValuationCommand, { valuationModelId: string }> {
  constructor(
    @Inject(VALUATION_MODEL_REPOSITORY) private readonly models: ValuationModelRepository,
    @Inject(VALUATION_AGENT_PORT) private readonly agent: ValuationAgentPort,
    @Inject(PRICING_VENDOR_PORT) private readonly vendor: PricingVendorPort,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RunValuationCommand): Promise<{ valuationModelId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const dto = command.dto;
    const model = ValuationModel.initiate({
      tenantId,
      assetId: dto.assetId,
      methodology: dto.methodology as ValuationModel['methodology'],
    });

    let value: Money;
    let reportId: string;
    if (dto.value) {
      value = toMoney(dto.value);
      reportId = dto.reportId ?? 'model-generated';
    } else if (dto.reportId) {
      reportId = dto.reportId;
      const report = await this.agent.getValuationReport(reportId);
      value = report.amount;
    } else {
      throw new Error('Either value or reportId is required to run a valuation');
    }

    model.runValuation({ value, reportId });

    try {
      const vendor = await this.vendor.getRealtimePrice(dto.assetId);
      if (divergence(value, vendor.price) > 0.05) {
        model.detectDiscrepancy(vendor.price);
      }
    } catch {
      void 0;
    }

    await this.models.save(model);
    await this.outbox.publish(model.pullEvents());
    return { valuationModelId: model.id.value };
  }
}
