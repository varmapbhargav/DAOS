import { randomUUID } from 'node:crypto';

export class SponsorReference {
  private constructor(
    public readonly id: string,
    public readonly entityId: string,
    public readonly tenantId: string,
    public readonly name: string,
    public readonly jurisdiction: string,
    public readonly relationshipStatus: string,
    public readonly riskRating: string,
    public readonly verificationStatus: string,
  ) {}

  static create(params: {
    entityId: string;
    tenantId: string;
    name: string;
    jurisdiction: string;
    relationshipStatus: string;
    riskRating: string;
    verificationStatus: string;
  }): SponsorReference {
    return new SponsorReference(
      randomUUID(),
      params.entityId,
      params.tenantId,
      params.name,
      params.jurisdiction,
      params.relationshipStatus,
      params.riskRating,
      params.verificationStatus,
    );
  }

  static reconstruct(params: {
    id: string;
    entityId: string;
    tenantId: string;
    name: string;
    jurisdiction: string;
    relationshipStatus: string;
    riskRating: string;
    verificationStatus: string;
  }): SponsorReference {
    return new SponsorReference(
      params.id,
      params.entityId,
      params.tenantId,
      params.name,
      params.jurisdiction,
      params.relationshipStatus,
      params.riskRating,
      params.verificationStatus,
    );
  }
}
