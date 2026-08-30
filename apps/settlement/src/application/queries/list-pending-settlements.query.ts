import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SETTLEMENT_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { SettlementInstructionRepository } from '../../domain/repositories/settlement-instruction.repository';
import { SettlementInstructionDto, toSettlementInstructionDto } from '../settlement.mapper';

export class ListPendingSettlementsQuery {}

@QueryHandler(ListPendingSettlementsQuery)
export class ListPendingSettlementsHandler
  implements IQueryHandler<ListPendingSettlementsQuery, SettlementInstructionDto[]>
{
  constructor(@Inject(SETTLEMENT_REPOSITORY) private readonly settlements: SettlementInstructionRepository) {}

  async execute(): Promise<SettlementInstructionDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const pending = await this.settlements.findPending(tenantId);
    return pending.map(toSettlementInstructionDto);
  }
}
