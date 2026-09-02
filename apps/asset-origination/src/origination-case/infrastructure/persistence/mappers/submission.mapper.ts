import { SubmissionId, TenantId } from '@daos/shared-kernel';

import { Submission, SubmissionDocumentRef, SubmissionStatus } from '../../../domain/entities/submission.entity';
import { SubmissionOrmEntity } from '../entities/submission.orm-entity';

export class SubmissionMapper {
  static toDomain(e: SubmissionOrmEntity): Submission {
    return Submission.reconstruct({
      id: SubmissionId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      caseId: e.caseId,
      version: e.version,
      source: e.source,
      channel: e.channel,
      payload: e.payload ?? {},
      documents: (e.documents as unknown as SubmissionDocumentRef[]) ?? [],
      status: e.status as SubmissionStatus,
      acknowledgedAt: e.acknowledgedAt,
      rejectionReason: e.rejectionReason,
      receivedAt: e.receivedAt,
      submittedBy: e.submittedBy,
    });
  }

  static toOrm(domain: Submission): SubmissionOrmEntity {
    const e = new SubmissionOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.caseId = domain.caseId;
    e.version = domain.version;
    e.source = domain.source;
    e.channel = domain.channel;
    e.payload = domain.payload;
    e.documents = domain.documents;
    e.status = domain.status;
    e.acknowledgedAt = domain.acknowledgedAt;
    e.rejectionReason = domain.rejectionReason;
    e.receivedAt = domain.receivedAt;
    e.submittedBy = domain.submittedBy;
    return e;
  }
}
