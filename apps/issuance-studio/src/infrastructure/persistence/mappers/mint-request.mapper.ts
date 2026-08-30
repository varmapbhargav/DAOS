import { MintRequestId, MintStatus, TenantId } from '@daos/shared-kernel';

import { MintRequest } from '../../../domain/entities/mint-request.entity';
import { MintRequestOrmEntity } from '../entities/mint-request.orm-entity';

export class MintRequestMapper {
  static toOrm(request: MintRequest): Partial<MintRequestOrmEntity> {
    return {
      id: request.id.value,
      tenantId: request.tenantId.value,
      issuanceId: request.issuanceId,
      amountMinorUnits: request.amountMinorUnits,
      toAddress: request.toAddress,
      status: request.status,
      txHash: request.txHash,
      requestedBy: request.requestedBy,
      requestedAt: request.requestedAt,
      confirmedAt: request.confirmedAt,
      version: request.version,
    };
  }

  static toDomain(e: MintRequestOrmEntity): MintRequest {
    return MintRequest.reconstruct({
      id: MintRequestId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      issuanceId: e.issuanceId,
      amountMinorUnits: e.amountMinorUnits,
      toAddress: e.toAddress,
      status: e.status as MintStatus,
      txHash: e.txHash,
      requestedBy: e.requestedBy,
      requestedAt: e.requestedAt,
      confirmedAt: e.confirmedAt,
      version: e.version,
    });
  }
}