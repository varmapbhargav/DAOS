import { NotFoundError, OutboxPublisher, RiskProfile, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { InvestorId } from '@daos/shared-kernel';

import { INVESTOR_REPOSITORY, OUTBOX_PUBLISHER } from '../../domain/repositories/repository.tokens';
import { InvestorRepository } from '../../domain/repositories/investor.repository';
import { UpdateRiskProfileDto } from '../dto/investor-action.dto';

export class UpdateRiskProfileCommand {
  constructor(
    public readonly investorId: string,
    public readonly dto: UpdateRiskProfileDto,
  ) {}
}

@CommandHandler(UpdateRiskProfileCommand)
export class UpdateRiskProfileHandler implements ICommandHandler<UpdateRiskProfileCommand, void> {
  constructor(
    @Inject(INVESTOR_REPOSITORY) private readonly investors: InvestorRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: UpdateRiskProfileCommand): Promise<void> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const investorId = InvestorId.create(command.investorId);

    const investor = await this.investors.findById(tenantId, investorId);
    if (!investor) throw new NotFoundError(`Investor not found: ${command.investorId}`);

    const dto = command.dto;
    const riskProfile: RiskProfile = {
      riskTolerance: dto.riskTolerance as RiskProfile['riskTolerance'],
      investmentHorizon: dto.investmentHorizon,
      liquidityNeeds: dto.liquidityNeeds as RiskProfile['liquidityNeeds'],
    };
    investor.updateRiskProfile(riskProfile);

    await this.investors.save(investor);
    await this.outbox.publish(investor.pullEvents());
  }
}
