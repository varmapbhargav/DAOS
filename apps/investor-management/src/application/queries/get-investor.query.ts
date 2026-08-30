import { InvestorDto } from '@daos/investor-api';
import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { InvestorId } from '@daos/shared-kernel';

import { INVESTOR_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { InvestorRepository } from '../../domain/repositories/investor.repository';

export class GetInvestorQuery {
  constructor(public readonly investorId: string) {}
}

@QueryHandler(GetInvestorQuery)
export class GetInvestorHandler implements IQueryHandler<GetInvestorQuery, InvestorDto> {
  constructor(@Inject(INVESTOR_REPOSITORY) private readonly investors: InvestorRepository) {}

  async execute(query: GetInvestorQuery): Promise<InvestorDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const investor = await this.investors.findById(tenantId, InvestorId.create(query.investorId));
    if (!investor) throw new NotFoundError(`Investor not found: ${query.investorId}`);

    return {
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
    };
  }
}
