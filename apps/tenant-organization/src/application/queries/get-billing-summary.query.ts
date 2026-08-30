import { NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SERVICE_ENTITLEMENT_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { ServiceEntitlementRepository } from '../../domain/repositories/service-entitlement.repository';
import { toBillingSummaryDto, BillingSummaryDto } from '../organization.mapper';

export class GetBillingSummaryQuery {}

@QueryHandler(GetBillingSummaryQuery)
export class GetBillingSummaryHandler implements IQueryHandler<GetBillingSummaryQuery, BillingSummaryDto> {
  constructor(@Inject(SERVICE_ENTITLEMENT_REPOSITORY) private readonly entitlements: ServiceEntitlementRepository) {}

  async execute(): Promise<BillingSummaryDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const entitlement = await this.entitlements.findByTenantId(tenantId);
    if (!entitlement) throw new NotFoundError('Service entitlement not found');
    return toBillingSummaryDto(entitlement);
  }
}
