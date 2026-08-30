import { CustodyAccountId, NotFoundError, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CUSTODY_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { CustodyAccountRepository } from '../../domain/repositories/custody-account.repository';
import { CustodyAccountDto, toCustodyAccountDto } from '../settlement.mapper';

export class GetCustodyAccountQuery {
  constructor(public readonly accountId: string) {}
}

@QueryHandler(GetCustodyAccountQuery)
export class GetCustodyAccountHandler implements IQueryHandler<GetCustodyAccountQuery, CustodyAccountDto> {
  constructor(@Inject(CUSTODY_REPOSITORY) private readonly accounts: CustodyAccountRepository) {}

  async execute(query: GetCustodyAccountQuery): Promise<CustodyAccountDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const account = await this.accounts.findById(tenantId, CustodyAccountId.create(query.accountId));
    if (!account) throw new NotFoundError(`Custody account not found: ${query.accountId}`);
    return toCustodyAccountDto(account);
  }
}
