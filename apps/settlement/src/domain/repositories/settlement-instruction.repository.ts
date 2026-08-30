import { SettlementInstructionId, TenantId } from '@daos/shared-kernel';

import { SettlementInstruction } from '../aggregates/settlement-instruction.aggregate';

export interface SettlementInstructionRepository {
  save(instruction: SettlementInstruction): Promise<void>;
  findById(tenantId: TenantId, id: SettlementInstructionId): Promise<SettlementInstruction | null>;
  findByTradeReference(tenantId: TenantId, tradeReference: string): Promise<SettlementInstruction | null>;
  findPending(tenantId: TenantId): Promise<SettlementInstruction[]>;
  findAll(tenantId: TenantId): Promise<SettlementInstruction[]>;
}
