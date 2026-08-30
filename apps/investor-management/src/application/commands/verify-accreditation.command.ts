import {
  AccreditationLevel,
  KycProviderPort,
  NotFoundError,
  OutboxPublisher,
  TenantContextHolder,
  TenantId,
} from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { InvestorId } from '@daos/shared-kernel';

import {
  INVESTOR_REPOSITORY,
  KYC_PROVIDER,
  OUTBOX_PUBLISHER,
} from '../../domain/repositories/repository.tokens';
import { InvestorRepository } from '../../domain/repositories/investor.repository';
import { AccreditationVerificationService } from '../../domain/services/accreditation-verification.service';
import { VerifyAccreditationDto } from '../dto/investor-action.dto';

export class VerifyAccreditationCommand {
  constructor(
    public readonly investorId: string,
    public readonly dto: VerifyAccreditationDto,
  ) {}
}

@CommandHandler(VerifyAccreditationCommand)
export class VerifyAccreditationHandler implements ICommandHandler<VerifyAccreditationCommand, { verified: boolean }> {
  constructor(
    @Inject(INVESTOR_REPOSITORY) private readonly investors: InvestorRepository,
    @Inject(KYC_PROVIDER) private readonly kycProvider: KycProviderPort,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: VerifyAccreditationCommand): Promise<{ verified: boolean }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const investorId = InvestorId.create(command.investorId);

    const investor = await this.investors.findById(tenantId, investorId);
    if (!investor) throw new NotFoundError(`Investor not found: ${command.investorId}`);

    const level = command.dto.level as AccreditationLevel;
    const service = new AccreditationVerificationService(this.kycProvider);
    const result = await service.verify(investor, level, new Date());

    if (result.verified && result.expiresAt) {
      investor.verifyAccreditation(level, result.expiresAt);
      await this.investors.save(investor);
      await this.outbox.publish(investor.pullEvents());
    }

    return { verified: result.verified };
  }
}
