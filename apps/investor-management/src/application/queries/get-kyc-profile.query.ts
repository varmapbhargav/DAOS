import { KycProfileDto } from '@daos/investor-api';
import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { InvestorId } from '@daos/shared-kernel';

import { KYC_PROFILE_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { KycProfileRepository } from '../../domain/repositories/kyc-profile.repository';

export class GetKycProfileQuery {
  constructor(public readonly investorId: string) {}
}

@QueryHandler(GetKycProfileQuery)
export class GetKycProfileHandler implements IQueryHandler<GetKycProfileQuery, KycProfileDto> {
  constructor(@Inject(KYC_PROFILE_REPOSITORY) private readonly kycProfiles: KycProfileRepository) {}

  async execute(query: GetKycProfileQuery): Promise<KycProfileDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const profile = await this.kycProfiles.findByInvestorId(tenantId, InvestorId.create(query.investorId).value);
    if (!profile) throw new NotFoundError(`KYC profile not found for investor: ${query.investorId}`);

    return {
      id: profile.id.value,
      investorId: profile.investorId,
      tenantId: profile.tenantId.value,
      status: profile.status,
      providerRef: profile.providerRef,
      documents: profile.documents.map((d) => ({
        documentType: d.documentType,
        fileRef: d.fileRef,
        checksum: d.checksum,
        uploadedAt: d.uploadedAt.toIso(),
      })),
      submittedAt: profile.submittedAt,
      reviewedAt: profile.reviewedAt,
      report: profile.report,
    };
  }
}
