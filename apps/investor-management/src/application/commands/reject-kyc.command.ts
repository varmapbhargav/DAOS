import { NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { InvestorId } from '@daos/shared-kernel';

import {
  INVESTOR_REPOSITORY,
  KYC_PROFILE_REPOSITORY,
  OUTBOX_PUBLISHER,
} from '../../domain/repositories/repository.tokens';
import { InvestorRepository } from '../../domain/repositories/investor.repository';
import { KycProfileRepository } from '../../domain/repositories/kyc-profile.repository';

export class RejectKycCommand {
  constructor(
    public readonly investorId: string,
    public readonly reason: string,
  ) {}
}

@CommandHandler(RejectKycCommand)
export class RejectKycHandler implements ICommandHandler<RejectKycCommand, { status: string }> {
  constructor(
    @Inject(INVESTOR_REPOSITORY) private readonly investors: InvestorRepository,
    @Inject(KYC_PROFILE_REPOSITORY) private readonly kycProfiles: KycProfileRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RejectKycCommand): Promise<{ status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const investorId = InvestorId.create(command.investorId);

    const investor = await this.investors.findById(tenantId, investorId);
    if (!investor) throw new NotFoundError(`Investor not found: ${command.investorId}`);

    const profile = await this.kycProfiles.findByInvestorId(tenantId, investorId.value);
    if (!profile) throw new NotFoundError(`KYC profile not found for investor: ${command.investorId}`);

    const now = new Date().toISOString();
    profile.reject(now);
    investor.rejectKyc(profile.id.value, command.reason);

    await this.kycProfiles.save(profile);
    await this.investors.save(investor);
    await this.outbox.publish(investor.pullEvents());
    return { status: 'rejected' };
  }
}
