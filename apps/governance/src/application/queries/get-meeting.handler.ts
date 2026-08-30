import { NotFoundException, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';

import { MEETING_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { MeetingRepository } from '../../domain/repositories/meeting.repository';
import { GetMeetingQuery } from './get-meeting.query';

export class GetMeetingResponse {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly type: string,
    public readonly status: string,
    public readonly scheduledAt: string | null,
    public readonly location: string | null,
    public readonly proposalIds: string[],
  ) {}
}

@QueryHandler(GetMeetingQuery)
export class GetMeetingHandler implements IQueryHandler<GetMeetingQuery, GetMeetingResponse> {
  constructor(@Inject(MEETING_REPOSITORY) private readonly meetings: MeetingRepository) {}

  async execute(query: GetMeetingQuery): Promise<GetMeetingResponse> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const meeting = await this.meetings.findById(tenantId, { value: query.meetingId } as any);
    if (!meeting) throw new NotFoundException(`Meeting not found: ${query.meetingId}`);

    return new GetMeetingResponse(
      meeting.id.value,
      meeting.title,
      meeting.description,
      meeting.type,
      meeting.status,
      meeting.scheduledAt,
      meeting.location,
      meeting.proposalIds.map((p) => p.value),
    );
  }
}
