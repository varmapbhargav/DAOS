import { AccreditationLevel, KycDocument, KycProviderPort, KycReport } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

/**
 * Stub KYC / accreditation provider adapter (Sumsub interface).
 * No real HTTP calls are made — returns canned responses so the domain and
 * application layers can be exercised. Replace with a real HTTP client
 * (and secret management) in production behind the KycProviderPort.
 */
@Injectable()
export class SumsubKycAdapter implements KycProviderPort {
  private refCounter = 0;

  async submitKyc(
    investorId: string,
    documents: KycDocument[],
  ): Promise<{ ref: string; status: string }> {
    this.refCounter += 1;
    const ref = `sumsub-${investorId.slice(0, 8)}-${this.refCounter}`;
    return { ref, status: 'submitted' };
  }

  async getStatus(ref: string): Promise<{ status: string; report: KycReport }> {
    return {
      status: 'approved',
      report: {
        passed: true,
        score: 100,
        documentResults: { all: { status: 'valid' } },
        recommendations: [],
      },
    };
  }

  async verifyAccreditation(
    investorId: string,
    level: AccreditationLevel,
  ): Promise<{ verified: boolean; expiry: string | null }> {
    // Stub: always verify for 1 year.
    const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    return { verified: true, expiry };
  }
}
