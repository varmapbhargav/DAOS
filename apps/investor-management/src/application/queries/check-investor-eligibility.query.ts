import { EligibilityResultDto } from '@daos/investor-api';
import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { InvestorId } from '@daos/shared-kernel';

import { INVESTOR_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { InvestorRepository } from '../../domain/repositories/investor.repository';

export class CheckInvestorEligibilityQuery {
  constructor(public readonly investorId: string) {}
}

@QueryHandler(CheckInvestorEligibilityQuery)
export class CheckInvestorEligibilityHandler
  implements IQueryHandler<CheckInvestorEligibilityQuery, EligibilityResultDto>
{
  constructor(@Inject(INVESTOR_REPOSITORY) private readonly investors: InvestorRepository) {}

  async execute(query: CheckInvestorEligibilityQuery): Promise<EligibilityResultDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const investor = await this.investors.findById(tenantId, InvestorId.create(query.investorId));
    if (!investor) throw new NotFoundError(`Investor not found: ${query.investorId}`);

    const kycApproved = investor.kycStatus === 'approved';
    const accredited = investor.accreditationStatus === 'verified';
    const eligible = investor.status === 'active' && kycApproved && accredited;

    return {
      investorId: investor.id.value,
      kycApproved,
      accredited,
      eligible,
      accreditationStatus: investor.accreditationStatus,
    };
  }
}
