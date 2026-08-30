import { CurrentUsage } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

import { ServiceEntitlement } from '../aggregates/service-entitlement.aggregate';

@Injectable()
export class UsageMeteringService {
  computeNewUsage(entitlement: ServiceEntitlement, apiCallsDelta: number, seatsUsed: number): CurrentUsage {
    const current = entitlement.currentUsage;
    const totalSeats = Math.max(0, seatsUsed);
    let totalApiCalls = current.apiCalls + apiCallsDelta;
    if (totalApiCalls < 0) totalApiCalls = 0;
    return { apiCalls: totalApiCalls, seatsUsed: totalSeats };
  }
}
