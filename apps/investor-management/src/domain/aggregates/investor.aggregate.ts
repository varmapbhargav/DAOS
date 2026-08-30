import {
  AccreditationLevel,
  AccreditationStatus,
  AggregateRoot,
  Email,
  InvestorId,
  InvestorProfile,
  InvestorStatus,
  RiskProfile,
  TenantId,
  WalletId,
} from '@daos/shared-kernel';

import { AccreditationExpired } from '../events/accreditation-expired.event';
import { AccreditationVerified } from '../events/accreditation-verified.event';
import { InvestorApproved } from '../events/investor-approved.event';
import { InvestorSuspended } from '../events/investor-suspended.event';
import { KycApproved } from '../events/kyc-approved.event';
import { KycRejected } from '../events/kyc-rejected.event';
import { KycSubmitted } from '../events/kyc-submitted.event';
import { WalletLinked } from '../events/wallet-linked.event';

export class Investor extends AggregateRoot {
  private constructor(
    public readonly id: InvestorId,
    public readonly tenantId: TenantId,
    private _userId: string | null,
    private _email: Email,
    private _status: InvestorStatus,
    private _profile: InvestorProfile,
    private _accreditationLevel: AccreditationLevel | null,
    private _accreditationStatus: AccreditationStatus,
    private _accreditationExpiresAt: string | null,
    private _kycStatus: 'notStarted' | 'submitted' | 'underReview' | 'approved' | 'rejected',
    private _riskProfile: RiskProfile | null,
    private _walletAddresses: string[],
    private _walletIds: WalletId[],
  ) {
    super();
  }

  static invite(params: {
    tenantId: TenantId;
    email: Email;
    userId?: string | null;
    profile: InvestorProfile;
  }): Investor {
    if (!params.email.value.trim()) throw new Error('Investor email is required');
    const investor = new Investor(
      InvestorId.create(),
      params.tenantId,
      params.userId ?? null,
      params.email,
      'invited',
      params.profile,
      null,
      'pending',
      null,
      'notStarted',
      null,
      [],
      [],
    );
    investor.incrementVersion();
    return investor;
  }

  static reconstruct(params: {
    id: InvestorId;
    tenantId: TenantId;
    userId: string | null;
    email: Email;
    status: InvestorStatus;
    profile: InvestorProfile;
    accreditationLevel: AccreditationLevel | null;
    accreditationStatus: AccreditationStatus;
    accreditationExpiresAt: string | null;
    kycStatus: 'notStarted' | 'submitted' | 'underReview' | 'approved' | 'rejected';
    riskProfile: RiskProfile | null;
    walletAddresses: string[];
    walletIds: WalletId[];
    version: number;
  }): Investor {
    const investor = new Investor(
      params.id,
      params.tenantId,
      params.userId,
      params.email,
      params.status,
      params.profile,
      params.accreditationLevel,
      params.accreditationStatus,
      params.accreditationExpiresAt,
      params.kycStatus,
      params.riskProfile,
      params.walletAddresses,
      params.walletIds,
    );
    investor._version = params.version;
    return investor;
  }

  get userId(): string | null {
    return this._userId;
  }

  get email(): Email {
    return this._email;
  }

  get status(): InvestorStatus {
    return this._status;
  }

  get profile(): InvestorProfile {
    return this._profile;
  }

  get accreditationLevel(): AccreditationLevel | null {
    return this._accreditationLevel;
  }

  get accreditationStatus(): AccreditationStatus {
    return this._accreditationStatus;
  }

  get accreditationExpiresAt(): string | null {
    return this._accreditationExpiresAt;
  }

  get kycStatus(): Investor['_kycStatus'] {
    return this._kycStatus;
  }

  get riskProfile(): RiskProfile | null {
    return this._riskProfile;
  }

  get walletAddresses(): string[] {
    return [...this._walletAddresses];
  }

  get walletIds(): WalletId[] {
    return [...this._walletIds];
  }

  submitKyc(kycProfileId: string, providerRef: string, submittedAt: string): void {
    if (this._status === 'disabled') throw new Error('Suspended investors cannot resubmit KYC');
    this._kycStatus = 'submitted';
    this.raise(new KycSubmitted(this.id.value, this.tenantId.value, kycProfileId, providerRef));
    this.incrementVersion();
  }

  approveKyc(kycProfileId: string): void {
    if (this._kycStatus !== 'submitted' && this._kycStatus !== 'underReview') {
      throw new Error(`KYC cannot be approved from status: ${this._kycStatus}`);
    }
    this._kycStatus = 'approved';
    this.raise(new KycApproved(this.id.value, this.tenantId.value, kycProfileId));
    this.maybeApprove();
    this.incrementVersion();
  }

  rejectKyc(kycProfileId: string, reason: string): void {
    this._kycStatus = 'rejected';
    this.raise(new KycRejected(this.id.value, this.tenantId.value, kycProfileId, reason));
    this.incrementVersion();
  }

  verifyAccreditation(level: AccreditationLevel, expiresAt: string): void {
    this._accreditationLevel = level;
    this._accreditationStatus = 'verified';
    this._accreditationExpiresAt = expiresAt;
    this.raise(new AccreditationVerified(this.id.value, this.tenantId.value, level, expiresAt));
    this.maybeApprove();
    this.incrementVersion();
  }

  expireAccreditation(): void {
    if (this._accreditationStatus !== 'verified') return;
    this._accreditationStatus = 'expired';
    this._accreditationLevel = null;
    this._accreditationExpiresAt = null;
    this.raise(new AccreditationExpired(this.id.value, this.tenantId.value));
    this.incrementVersion();
  }

  linkWallet(walletId: WalletId, address: string): void {
    if (this._walletAddresses.includes(address)) {
      throw new Error(`Wallet already linked: ${address}`);
    }
    this._walletAddresses.push(address);
    this._walletIds.push(walletId);
    this.raise(new WalletLinked(this.id.value, this.tenantId.value, walletId.value, address));
    this.incrementVersion();
  }

  updateRiskProfile(riskProfile: RiskProfile): void {
    this._riskProfile = riskProfile;
    this.incrementVersion();
  }

  suspend(reason: string): void {
    if (this._status === 'disabled') throw new Error('Investor already suspended');
    this._status = 'disabled';
    this.raise(new InvestorSuspended(this.id.value, this.tenantId.value, reason));
    this.incrementVersion();
  }

  private maybeApprove(): void {
    if (this._status === 'active') return;
    if (this._kycStatus === 'approved' && this._accreditationStatus === 'verified') {
      this._status = 'active';
      this.raise(new InvestorApproved(this.id.value, this.tenantId.value));
    }
  }
}
