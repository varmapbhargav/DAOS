import { AccreditationLevel, KycProviderPort } from '@daos/shared-kernel';

import { Investor } from '../aggregates/investor.aggregate';

export type VerificationResult = {
  verified: boolean;
  level: AccreditationLevel;
  expiresAt: string | null;
};

/**
 * Verifies an investor's accreditation status through the configured KYC
 * provider (e.g. Sumsub). Returns the verified level and its expiry so the
 * application layer can apply it to the Investor aggregate.
 */
export class AccreditationVerificationService {
  constructor(private readonly kycProvider: KycProviderPort) {}

  async verify(investor: Investor, level: AccreditationLevel, now: Date): Promise<VerificationResult> {
    const result = await this.kycProvider.verifyAccreditation(investor.id.value, level);

    if (!result.verified || !result.expiry) {
      return { verified: false, level, expiresAt: null };
    }

    const expiry = new Date(result.expiry);
    if (expiry <= now) {
      return { verified: false, level, expiresAt: null };
    }

    return { verified: true, level, expiresAt: result.expiry };
  }
}
