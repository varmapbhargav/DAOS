import { IssuanceId, MintRequestId, TenantId } from '@daos/shared-kernel';

import { Issuance } from '../aggregates/issuance.aggregate';
import { MintRequest } from '../entities/mint-request.entity';

export interface IssuanceRepository {
  save(issuance: Issuance): Promise<void>;
  findById(tenantId: TenantId, id: IssuanceId): Promise<Issuance | null>;
  findAll(tenantId: TenantId): Promise<Issuance[]>;
  findByCapTableId(tenantId: TenantId, capTableId: string): Promise<Issuance | null>;
}

export interface MintRequestRepository {
  save(request: MintRequest): Promise<void>;
  findById(tenantId: TenantId, id: MintRequestId): Promise<MintRequest | null>;
  findByIssuanceId(tenantId: TenantId, issuanceId: string): Promise<MintRequest[]>;
}