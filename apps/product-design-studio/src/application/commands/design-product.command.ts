import { Benchmark, FeeStructure, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { InvestmentProduct } from '../../domain/aggregates/investment-product.aggregate';
import { INVESTMENT_PRODUCT_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { InvestmentProductRepository } from '../../domain/repositories/investment-product.repository';
import { DesignProductDto } from '../dto/design-product.dto';

export class DesignProductCommand {
  constructor(public readonly dto: DesignProductDto) {}
}

@CommandHandler(DesignProductCommand)
export class DesignProductHandler implements ICommandHandler<DesignProductCommand, { productId: string }> {
  constructor(
    @Inject(INVESTMENT_PRODUCT_REPOSITORY) private readonly products: InvestmentProductRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: DesignProductCommand): Promise<{ productId: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const feeStructure: FeeStructure = {
      managementFeeAnnual: dto.feeStructure.managementFeeAnnual,
      performanceFee: dto.feeStructure.performanceFee,
      hurdleRate: dto.feeStructure.hurdleRate,
      highWaterMark: dto.feeStructure.highWaterMark,
      catchUpPercentage: dto.feeStructure.catchUpPercentage,
      catchUpRate: dto.feeStructure.catchUpRate,
    };

    const product = InvestmentProduct.design({
      tenantId,
      name: dto.name,
      productType: dto.productType as InvestmentProduct['productType'],
      strategy: {
        investmentObjective: dto.strategy.investmentObjective,
        assetClasses: dto.strategy.assetClasses,
        geographies: dto.strategy.geographies,
        concentrationLimits: (dto.strategy.concentrationLimits ?? []).map((c) => ({
          type: c.type,
          threshold: c.threshold,
        })),
      },
      benchmark: dto.benchmark
        ? ({ benchmarkName: dto.benchmark.benchmarkName, indexRef: dto.benchmark.indexRef } as Benchmark)
        : null,
      liquidityTerms: dto.liquidityTerms,
      feeStructure,
    });

    await this.products.save(product);
    await this.outbox.publish(product.pullEvents());
    return { productId: product.id.value };
  }
}
