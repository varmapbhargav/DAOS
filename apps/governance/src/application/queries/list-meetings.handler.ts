import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';

import { MEETING_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { MeetingRepository } from '../../domain/repositories/meeting.repository';
import { ListMeetingsQuery } from './list-meetings.query';

export class ListMeetingsResponse {
  constructor(public readonly meetings: Meeting[]) {}
}

export class MeetingDto {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly type: string,
    public readonly status: string,
    public readonly scheduledAt: string | null,
  ) {}
}

@QueryHandler(ListMeetingsQuery)
export class ListMeetingsHandler implements IQueryHandler<ListMeetingsQuery, MeetingDto[]> {
  constructor(@Inject(MEETING_REPOSITORY) private readonly meetings: MeetingRepository) {}

  async execute(query: ListMeetingsQuery): Promise<MeetingDto[]> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    let meetingList: Meeting[];
    if (query.status) {
      meetingList = await this.meetings.findByStatus(tenantId, query.status);
    } else {
      meetingList = await this.meetings.findAll(tenantId);
    }

    return meetingList.map((m) => new MeetingDto(m.id.value, m.title, m.type, m.status, m.scheduledAt));
  }
}
