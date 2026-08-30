import { KycDocument, KycProfileId, KycReport, KycStatus, TenantId, UtcInstant } from '@daos/shared-kernel';

import { KycProfile } from '../../../domain/entities/kyc-profile.entity';
import { KycProfileOrmEntity } from '../entities/kyc-profile.orm-entity';

type DocJson = {
  documentType: string;
  fileRef: string;
  checksum: string;
  uploadedAt: string;
};

export class KycProfileMapper {
  static toDomain(e: KycProfileOrmEntity): KycProfile {
    return KycProfile.reconstruct({
      id: KycProfileId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      investorId: e.investorId,
      status: e.status as KycStatus,
      providerRef: e.providerRef,
      documents: (e.documents as DocJson[]).map(
        (d): KycDocument => ({
          documentType: d.documentType,
          fileRef: d.fileRef,
          checksum: d.checksum,
          uploadedAt: UtcInstant.fromIso(d.uploadedAt),
        }),
      ),
      submittedAt: e.submittedAt,
      reviewedAt: e.reviewedAt,
      report: e.report as KycReport | null,
    });
  }

  static toOrm(domain: KycProfile): KycProfileOrmEntity {
    const e = new KycProfileOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.investorId = domain.investorId;
    e.status = domain.status;
    e.providerRef = domain.providerRef;
    e.documents = domain.documents.map((d) => ({
      documentType: d.documentType,
      fileRef: d.fileRef,
      checksum: d.checksum,
      uploadedAt: d.uploadedAt.toIso(),
    }));
    e.submittedAt = domain.submittedAt;
    e.reviewedAt = domain.reviewedAt;
    e.report = domain.report;
    e.version = 0;
    return e;
  }
}
