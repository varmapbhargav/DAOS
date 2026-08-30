import { InvestorDto } from '@daos/investor-api';
import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { INVESTOR_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { InvestorRepository } from '../../domain/repositories/investor.repository';

export class ListInvestorsQuery {}

@QueryHandler(ListInvestorsQuery)
export class ListInvestorsHandler implements IQueryHandler<ListInvestorsQuery, InvestorDto[]> {
  constructor(@Inject(INVESTOR_REPOSITORY) private readonly investors: InvestorRepository) {}

  async execute(): Promise<InvestorDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const list = await this.investors.findAll(tenantId);

    return list.map((investor) => ({
      id: investor.id.value,
      tenantId: investor.tenantId.value,
      userId: investor.userId,
      email: investor.email.value,
      status: investor.status,
      profile: {
        legalName: investor.profile.legalName,
        dateOfBirth: investor.profile.dateOfBirth.toISOString(),
        nationality: investor.profile.nationality,
        taxId: investor.profile.taxId,
      },
      accreditationLevel: investor.accreditationLevel,
      accreditationStatus: investor.accreditationStatus,
      riskProfile: investor.riskProfile
        ? {
            riskTolerance: investor.riskProfile.riskTolerance,
            investmentHorizon: investor.riskProfile.investmentHorizon,
            liquidityNeeds: investor.riskProfile.liquidityNeeds,
          }
        : null,
      walletAddresses: investor.walletAddresses,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
}
