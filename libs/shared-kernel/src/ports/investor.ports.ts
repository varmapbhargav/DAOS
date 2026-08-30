// Investor Management infrastructure ports.
// Aggregate-referencing repository ports live in the investor-management
// bounded context (domain/repositories) to respect the domain-first rule.
import { AccreditationLevel, KycDocument } from '../value-objects/investor-value-objects';

export interface KycProviderPort {
  submitKyc(investorId: string, documents: KycDocument[]): Promise<{ ref: string; status: string }>;
  getStatus(ref: string): Promise<{ status: string; report: KycReport }>;
  verifyAccreditation(
    investorId: string,
    level: AccreditationLevel,
  ): Promise<{ verified: boolean; expiry: string | null }>;
}

export type KycReport = {
  passed: boolean;
  score: number;
  documentResults: Record<string, unknown>;
  recommendations: string[];
};
