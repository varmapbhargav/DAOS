import { TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Meeting } from '../../domain/aggregates/meeting.aggregate';
import { MEETING_REPOSITORY } from '../../domain/repositories/repository.tokens';
import { MeetingRepository } from '../../domain/repositories/meeting.repository';
import { ScheduleMeetingCommand } from './schedule-meeting.command';

export class ScheduleMeetingResponse {
  constructor(public readonly meetingId: string) {}
}

@CommandHandler(ScheduleMeetingCommand)
export class ScheduleMeetingHandler implements ICommandHandler<ScheduleMeetingCommand, ScheduleMeetingResponse> {
  constructor(@Inject(MEETING_REPOSITORY) private readonly meetings: MeetingRepository) {}

  async execute(command: ScheduleMeetingCommand): Promise<ScheduleMeetingResponse> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const meeting = Meeting.schedule({
      tenantId,
      title: command.title,
      description: command.description,
      type: command.type as any,
      scheduledAt: command.scheduledAt ?? undefined,
      location: command.location ?? undefined,
    });

    await this.meetings.save(meeting);

    return new ScheduleMeetingResponse(meeting.id.value);
  }
}
