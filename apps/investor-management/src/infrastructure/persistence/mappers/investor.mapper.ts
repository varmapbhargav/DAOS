import {
  AccreditationLevel,
  AccreditationStatus,
  Email,
  InvestorId,
  InvestorProfile,
  InvestorStatus,
  RiskProfile,
  TenantId,
  WalletId,
} from '@daos/shared-kernel';

import { Investor } from '../../../domain/aggregates/investor.aggregate';
import { InvestorOrmEntity } from '../entities/investor.orm-entity';

type ProfileJson = {
  legalName: string;
  dateOfBirth: string;
  nationality: string;
  taxId: string;
};

export class InvestorMapper {
  static toDomain(e: InvestorOrmEntity): Investor {
    const profileJson = e.profile as ProfileJson;
    const profile: InvestorProfile = {
      legalName: profileJson.legalName,
      dateOfBirth: new Date(profileJson.dateOfBirth),
      nationality: profileJson.nationality,
      taxId: profileJson.taxId,
    };

    const risk = e.riskProfile as RiskProfile | null;

    return Investor.reconstruct({
      id: InvestorId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      userId: e.userId,
      email: Email.create(e.email),
      status: e.status as InvestorStatus,
      profile,
      accreditationLevel: e.accreditationLevel as AccreditationLevel | null,
      accreditationStatus: e.accreditationStatus as AccreditationStatus,
      accreditationExpiresAt: e.accreditationExpiresAt,
      kycStatus: e.kycStatus as Investor['kycStatus'],
      riskProfile: risk,
      walletAddresses: e.walletAddresses,
      walletIds: (e.walletIds ?? []).map((w) => WalletId.create(w)),
      version: e.version,
    });
  }

  static toOrm(domain: Investor): InvestorOrmEntity {
    const e = new InvestorOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.userId = domain.userId;
    e.email = domain.email.value;
    e.status = domain.status;
    e.profile = {
      legalName: domain.profile.legalName,
      dateOfBirth: domain.profile.dateOfBirth.toISOString(),
      nationality: domain.profile.nationality,
      taxId: domain.profile.taxId,
    };
    e.accreditationLevel = domain.accreditationLevel;
    e.accreditationStatus = domain.accreditationStatus;
    e.accreditationExpiresAt = domain.accreditationExpiresAt;
    e.kycStatus = domain.kycStatus;
    e.riskProfile = domain.riskProfile
      ? {
          riskTolerance: domain.riskProfile.riskTolerance,
          investmentHorizon: domain.riskProfile.investmentHorizon,
          liquidityNeeds: domain.riskProfile.liquidityNeeds,
        }
      : null;
    e.walletAddresses = domain.walletAddresses;
    e.walletIds = domain.walletIds.map((w) => w.value);
    e.version = domain.version;
    return e;
  }
}
