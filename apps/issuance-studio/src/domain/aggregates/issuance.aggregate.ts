import {
  AggregateRoot,
  BlockchainNetwork,
  InstrumentType,
  IssuanceId,
  IssuanceStatus,
  TenantId,
  TokenTransferRestriction,
  WhitelistEntry,
} from '@daos/shared-kernel';

import { CapTableSynced } from '../events/cap-table-synced.event';
import { IssuanceCreated } from '../events/issuance-created.event';
import { LegalDocsSigned } from '../events/legal-docs-signed.event';
import { TokenMinted } from '../events/token-minted.event';
import { TransferRestrictionApplied } from '../events/transfer-restriction-applied.event';
import { WhitelistUpdated } from '../events/whitelist-updated.event';

export class Issuance extends AggregateRoot {
  private constructor(
    public readonly id: IssuanceId,
    public readonly tenantId: TenantId,
    private _name: string,
    private _instrumentType: InstrumentType,
    private _network: BlockchainNetwork,
    private _status: IssuanceStatus,
    private _capTableId: string | null,
    private _whitelist: WhitelistEntry[],
    private _transferRestrictions: TokenTransferRestriction[],
    private _tokenStandard: string,
    private _totalSupplyMinorUnits: string | null,
  ) {
    super();
  }

  static create(params: {
    tenantId: TenantId;
    name: string;
    instrumentType: InstrumentType;
    network: BlockchainNetwork;
    capTableId?: string | null;
  }): Issuance {
    if (!params.name.trim()) throw new Error('Issuance name is required');
    const issuance = new Issuance(
      IssuanceId.create(),
      params.tenantId,
      params.name.trim(),
      params.instrumentType,
      params.network,
      'draft',
      params.capTableId ?? null,
      [],
      [],
      'nativeChain',
      null,
    );
    issuance.raise(
      new IssuanceCreated(
        issuance.id.value,
        issuance.tenantId.value,
        issuance._name,
        issuance._instrumentType,
        issuance._network,
        issuance._capTableId,
      ),
    );
    issuance.incrementVersion();
    return issuance;
  }

  static reconstruct(params: {
    id: IssuanceId;
    tenantId: TenantId;
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
  }): Issuance {
    const issuance = new Issuance(
      params.id,
      params.tenantId,
      params.name,
      params.instrumentType,
      params.network,
      params.status,
      params.capTableId,
      params.whitelist,
      params.transferRestrictions,
      params.tokenStandard,
      params.totalSupplyMinorUnits,
    );
    issuance._version = params.version;
    return issuance;
  }

  get name(): string {
    return this._name;
  }

  get instrumentType(): InstrumentType {
    return this._instrumentType;
  }

  get network(): BlockchainNetwork {
    return this._network;
  }

  get status(): IssuanceStatus {
    return this._status;
  }

  get capTableId(): string | null {
    return this._capTableId;
  }

  get whitelist(): WhitelistEntry[] {
    return this._whitelist.map((e) => ({ ...e }));
  }

  get transferRestrictions(): TokenTransferRestriction[] {
    return this._transferRestrictions.map((r) => ({ ...r }));
  }

  get tokenStandard(): string {
    return this._tokenStandard;
  }

  get totalSupplyMinorUnits(): string | null {
    return this._totalSupplyMinorUnits;
  }

  signLegalDocs(signedBy: string): void {
    if (this._status !== 'draft') throw new Error('Only draft issuances can sign legal documents');
    if (!signedBy.trim()) throw new Error('Signer is required');
    this._status = 'legalDocsSigned';
    this.raise(new LegalDocsSigned(this.id.value, this.tenantId.value, signedBy, new Date().toISOString()));
    this.incrementVersion();
  }

  confirmMint(mintRequestId: string, amountMinorUnits: string, txHash: string): void {
    if (this._status === 'minted') throw new Error('Issuance already minted');
    this._status = 'minted';
    this._totalSupplyMinorUnits = amountMinorUnits;
    this.raise(new TokenMinted(this.id.value, this.tenantId.value, mintRequestId, amountMinorUnits, txHash));
    this.incrementVersion();
  }

  addToWhitelist(walletAddress: string, investorId: string): void {
    const address = walletAddress.trim();
    if (!address) throw new Error('Wallet address is required');
    if (this._whitelist.some((e) => e.walletAddress === address)) throw new Error('Wallet already whitelisted');
    this._whitelist.push({ walletAddress: address, investorId, addedAt: new Date().toISOString() });
    this.raise(new WhitelistUpdated(this.id.value, this.tenantId.value, address, 'add'));
    this.incrementVersion();
  }

  removeFromWhitelist(walletAddress: string): void {
    const index = this._whitelist.findIndex((e) => e.walletAddress === walletAddress);
    if (index < 0) throw new Error('Wallet not on whitelist');
    this._whitelist.splice(index, 1);
    this.raise(new WhitelistUpdated(this.id.value, this.tenantId.value, walletAddress, 'remove'));
    this.incrementVersion();
  }

  applyTransferRestriction(restriction: TokenTransferRestriction): void {
    this._transferRestrictions.push({ ...restriction });
    this.raise(
      new TransferRestrictionApplied(this.id.value, this.tenantId.value, restriction.restrictionType),
    );
    this.incrementVersion();
  }

  openWhitelist(): void {
    if (this._status === 'minted') this._status = 'whitelistOpen';
  }

  syncCapTable(capTableId: string): void {
    this._capTableId = capTableId;
    if (this._status === 'whitelistOpen' || this._status === 'minted') this._status = 'complete';
    this.raise(new CapTableSynced(this.id.value, this.tenantId.value, capTableId));
    this.incrementVersion();
  }
}