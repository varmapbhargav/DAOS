import {
  BlockchainNetwork,
  InstrumentType,
  IssuanceStatus,
  MintStatus,
  TokenTransferRestriction,
  WhitelistEntry,
} from '@daos/shared-kernel';

import { Issuance } from '../domain/aggregates/issuance.aggregate';
import { MintRequest } from '../domain/entities/mint-request.entity';

export interface IssuanceDto {
  id: string;
  tenantId: string;
  name: string;
  instrumentType: InstrumentType;
  network: BlockchainNetwork;
  status: IssuanceStatus;
  capTableId: string | null;
  whitelist: WhitelistEntry[];
  transferRestrictions: TokenTransferRestriction[];
  tokenStandard: string;
  totalSupplyMinorUnits: string | null;
  version: number;
}

export interface MintRequestDto {
  id: string;
  tenantId: string;
  issuanceId: string;
  amountMinorUnits: string;
  toAddress: string;
  status: MintStatus;
  txHash: string | null;
  requestedBy: string;
  requestedAt: string;
  confirmedAt: string | null;
  version: number;
}

export interface WhitelistDto {
  issuanceId: string;
  entries: WhitelistEntry[];
}

export function toIssuanceDto(issuance: Issuance): IssuanceDto {
  return {
    id: issuance.id.value,
    tenantId: issuance.tenantId.value,
    name: issuance.name,
    instrumentType: issuance.instrumentType,
    network: issuance.network,
    status: issuance.status,
    capTableId: issuance.capTableId,
    whitelist: issuance.whitelist,
    transferRestrictions: issuance.transferRestrictions,
    tokenStandard: issuance.tokenStandard,
    totalSupplyMinorUnits: issuance.totalSupplyMinorUnits,
    version: issuance.version,
  };
}

export function toMintRequestDto(request: MintRequest): MintRequestDto {
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

export function toWhitelistDto(issuance: Issuance): WhitelistDto {
  return { issuanceId: issuance.id.value, entries: issuance.whitelist };
}