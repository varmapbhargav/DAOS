import { KycProviderPort, NotFoundError, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { InvestorId, KycProfileId } from '@daos/shared-kernel';

import {
  INVESTOR_REPOSITORY,
  KYC_PROFILE_REPOSITORY,
  KYC_PROVIDER,
  OUTBOX_PUBLISHER,
} from '../../domain/repositories/repository.tokens';
import { InvestorRepository } from '../../domain/repositories/investor.repository';
import { KycProfileRepository } from '../../domain/repositories/kyc-profile.repository';

export class ApproveKycCommand {
  constructor(public readonly investorId: string) {}
}

@CommandHandler(ApproveKycCommand)
export class ApproveKycHandler implements ICommandHandler<ApproveKycCommand, { status: string }> {
  constructor(
    @Inject(INVESTOR_REPOSITORY) private readonly investors: InvestorRepository,
    @Inject(KYC_PROFILE_REPOSITORY) private readonly kycProfiles: KycProfileRepository,
    @Inject(KYC_PROVIDER) private readonly kycProvider: KycProviderPort,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: ApproveKycCommand): Promise<{ status: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const investorId = InvestorId.create(command.investorId);

    const investor = await this.investors.findById(tenantId, investorId);
    if (!investor) throw new NotFoundError(`Investor not found: ${command.investorId}`);

    const profile = await this.kycProfiles.findByInvestorId(tenantId, investorId.value);
    if (!profile) throw new NotFoundError(`KYC profile not found for investor: ${command.investorId}`);
    if (!profile.providerRef) throw new Error('KYC profile has no provider reference');

    profile.markUnderReview();
    const status = await this.kycProvider.getStatus(profile.providerRef);
    profile.attachReport(status.report);

    const now = new Date().toISOString();
    profile.approve(now);
    investor.approveKyc(profile.id.value);

    await this.kycProfiles.save(profile);
    await this.investors.save(investor);
    await this.outbox.publish(investor.pullEvents());
    return { status: 'approved' };
  }
}
