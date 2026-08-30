import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { CheckInvestorEligibilityQuery } from '../../application/queries/check-investor-eligibility.query';
import { GetInvestorQuery } from '../../application/queries/get-investor.query';

/**
 * gRPC contract G1 — InvestorService (for marketplace pre-trade checks).
 *
 * Exposes the success/failure methods of the protocol without coupling the
 * transport. The API gateway / marketplace can invoke these over gRPC or
 * HTTP. A thin @GrpcMethod controller maps the proto service onto this class
 * when the gRPC transport is enabled.
 */
@Injectable()
export class InvestorGrpcService {
  constructor(private readonly queryBus: QueryBus) {}

  async checkEligibility(payload: { tenantId: string; investorId: string }) {
    const result = await this.queryBus.execute(new CheckInvestorEligibilityQuery(payload.investorId));
    return {
      eligible: result.eligible,
      kycApproved: result.kycApproved,
      accredited: result.accredited,
    };
  }

  async getInvestorProfile(payload: { tenantId: string; investorId: string }) {
    const investor = await this.queryBus.execute(new GetInvestorQuery(payload.investorId));
    return {
      investorId: investor.id,
      legalName: investor.profile.legalName,
      accreditationStatus: investor.accreditationStatus,
      status: investor.status,
    };
  }
}
