import { DataRequestId, DataRequestStatus, DataRequestType, TenantId } from '@daos/shared-kernel';

import { DataRequest, DataRequestPriority } from '../../../domain/entities/data-request.entity';
import { DataRequestOrmEntity } from '../entities/data-request.orm-entity';

export class DataRequestMapper {
  static toDomain(e: DataRequestOrmEntity): DataRequest {
    return DataRequest.reconstruct({
      id: DataRequestId.create(e.id),
      tenantId: TenantId.create(e.tenantId),
      caseId: e.caseId,
      requestedFrom: e.requestedFrom,
      requestedBy: e.requestedBy,
      requestType: e.requestType as DataRequestType,
      description: e.description,
      priority: e.priority as DataRequestPriority,
      requiredBy: e.requiredBy,
      status: e.status as DataRequestStatus,
      response: e.response,
      evidenceReferences: e.evidenceReferences ?? [],
      createdAt: e.createdAt,
      completedAt: e.completedAt,
    });
  }

  static toOrm(domain: DataRequest): DataRequestOrmEntity {
    const e = new DataRequestOrmEntity();
    e.id = domain.id.value;
    e.tenantId = domain.tenantId.value;
    e.caseId = domain.caseId;
    e.requestedFrom = domain.requestedFrom;
    e.requestedBy = domain.requestedBy;
    e.requestType = domain.requestType;
    e.description = domain.description;
    e.priority = domain.priority;
    e.requiredBy = domain.requiredBy;
    e.status = domain.status;
    e.response = domain.response;
    e.evidenceReferences = domain.evidenceReferences;
    e.createdAt = domain.createdAt;
    e.completedAt = domain.completedAt;
    e.version = 0;
    return e;
  }
}
