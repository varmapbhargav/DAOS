import {
  KycDocument,
  KycProviderPort,
  NotFoundError,
  OutboxPublisher,
  TenantContextHolder,
  TenantId,
  UtcInstant,
} from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { InvestorId } from '@daos/shared-kernel';

import { KycProfile } from '../../domain/entities/kyc-profile.entity';
import {
  INVESTOR_REPOSITORY,
  KYC_PROFILE_REPOSITORY,
  KYC_PROVIDER,
  OUTBOX_PUBLISHER,
} from '../../domain/repositories/repository.tokens';
import { InvestorRepository } from '../../domain/repositories/investor.repository';
import { KycProfileRepository } from '../../domain/repositories/kyc-profile.repository';
import { SubmitKycDto } from '../dto/register-investor.dto';

export class SubmitKycCommand {
  constructor(
    public readonly investorId: string,
    public readonly dto: SubmitKycDto,
  ) {}
}

@CommandHandler(SubmitKycCommand)
export class SubmitKycHandler implements ICommandHandler<SubmitKycCommand, { kycProfileId: string }> {
  constructor(
    @Inject(INVESTOR_REPOSITORY) private readonly investors: InvestorRepository,
    @Inject(KYC_PROFILE_REPOSITORY) private readonly kycProfiles: KycProfileRepository,
    @Inject(KYC_PROVIDER) private readonly kycProvider: KycProviderPort,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: SubmitKycCommand): Promise<{ kycProfileId: string }> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const investorId = InvestorId.create(command.investorId);

    const investor = await this.investors.findById(tenantId, investorId);
    if (!investor) throw new NotFoundError(`Investor not found: ${command.investorId}`);

    let profile = await this.kycProfiles.findByInvestorId(tenantId, investorId.value);
    if (!profile) {
      profile = KycProfile.create({ tenantId, investorId: investorId.value });
    }

    const documents: KycDocument[] = command.dto.documents.map((d) => ({
      documentType: d.documentType,
      fileRef: d.fileRef,
      checksum: d.checksum,
      uploadedAt: d.uploadedAt ? UtcInstant.fromIso(d.uploadedAt) : UtcInstant.now(),
    }));

    const submitted = await this.kycProvider.submitKyc(investorId.value, documents);
    const now = new Date().toISOString();

    profile.submit(submitted.ref, now);
    investor.submitKyc(profile.id.value, submitted.ref, now);

    await this.kycProfiles.save(profile);
    await this.investors.save(investor);
    await this.outbox.publish(investor.pullEvents());
    return { kycProfileId: profile.id.value };
  }
}
