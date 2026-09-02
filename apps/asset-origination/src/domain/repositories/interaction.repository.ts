import { InteractionId, TenantId } from '@daos/shared-kernel';
import { Interaction } from '../entities/interaction.entity';

export interface InteractionRepository {
  save(interaction: Interaction): Promise<void>;
  findById(tenantId: TenantId, id: InteractionId): Promise<Interaction | null>;
  findByCaseId(tenantId: TenantId, caseId: string): Promise<Interaction[]>;
  findByAssetId(tenantId: TenantId, assetId: string): Promise<Interaction[]>;
  findByCounterpartyId(tenantId: TenantId, counterpartyId: string): Promise<Interaction[]>;
  findByDateRange(tenantId: TenantId, from: string, to: string): Promise<Interaction[]>;
}