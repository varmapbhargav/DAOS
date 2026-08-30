import {
  BlockchainNetwork,
  InstrumentType,
  IssuanceId,
  IssuanceStatus,
  TenantId,
  TokenTransferRestriction,
  WhitelistEntry,
} from '@daos/shared-kernel';

import { Issuance } from '../../../domain/aggregates/issuance.aggregate';
import { IssuanceOrmEntity } from '../entities/issuance.orm-entity';

export class IssuanceMapper {
  static toOrm(issuance: Issuance): Partial<IssuanceOrmEntity> {
    return {
      id: issuance.id.value,
      tenantId: issuance.tenantId.value,
      name: issuance.name,
      instrumentType: issuance.instrumentType,
      network: issuance.network,
      status: issuance.status,
      capTableId: issuance.capTableId,
      whitelist: issuance.whitelist as WhitelistEntry[] as object,
      transferRestrictions: issuance.transferRestrictions as TokenTransferRestriction[] as object,
      tokenStandard: issuance.tokenStandard,
      totalSupplyMinorUnits: issuance.totalSupplyMinorUnits,
      version: issuance.version,
    };
  }

  static toDomain(e: IssuanceOrmEntity): Issuance {
    return Issuance.reconstruct({
      id: IssuanceId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      name: e.name,
      instrumentType: e.instrumentType as InstrumentType,
      network: e.network as BlockchainNetwork,
      status: e.status as IssuanceStatus,
      capTableId: e.capTableId,
      whitelist: (e.whitelist as WhitelistEntry[]) ?? [],
      transferRestrictions: (e.transferRestrictions as TokenTransferRestriction[]) ?? [],
      tokenStandard: e.tokenStandard ?? 'nativeChain',
      totalSupplyMinorUnits: e.totalSupplyMinorUnits,
      version: e.version,
    });
  }
}