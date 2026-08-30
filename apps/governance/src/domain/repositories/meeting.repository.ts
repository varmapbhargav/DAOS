import { MeetingId, TenantId } from '@daos/shared-kernel';

import { Meeting } from '../aggregates/meeting.aggregate';

export interface MeetingRepository {
  save(meeting: Meeting): Promise<void>;
  findById(tenantId: TenantId, id: MeetingId): Promise<Meeting | null>;
  findByStatus(tenantId: TenantId, status: string): Promise<Meeting[]>;
  findByDateRange(tenantId: TenantId, start: string, end: string): Promise<Meeting[]>;
  findAll(tenantId: TenantId): Promise<Meeting[]>;
}
