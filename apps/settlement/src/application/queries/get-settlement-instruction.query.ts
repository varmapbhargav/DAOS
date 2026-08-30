import { NotFoundError, SettlementInstructionId, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SETTLEMENT_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { SettlementInstructionRepository } from '../../domain/repositories/settlement-instruction.repository';
import { SettlementInstructionDto, toSettlementInstructionDto } from '../settlement.mapper';

export class GetSettlementInstructionQuery {
  constructor(public readonly instructionId: string) {}
}

@QueryHandler(GetSettlementInstructionQuery)
export class GetSettlementInstructionHandler
  implements IQueryHandler<GetSettlementInstructionQuery, SettlementInstructionDto>
{
  constructor(@Inject(SETTLEMENT_REPOSITORY) private readonly settlements: SettlementInstructionRepository) {}

  async execute(query: GetSettlementInstructionQuery): Promise<SettlementInstructionDto> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const instruction = await this.settlements.findById(
      tenantId,
      SettlementInstructionId.create(query.instructionId),
    );
    if (!instruction) throw new NotFoundError(`Settlement instruction not found: ${query.instructionId}`);
    return toSettlementInstructionDto(instruction);
  }
}
