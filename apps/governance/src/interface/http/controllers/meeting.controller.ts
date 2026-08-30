import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ScheduleMeetingCommand } from '../../../application/commands/schedule-meeting.command';
import { ListMeetingsQuery } from '../../../application/queries/list-meetings.query';
import { GetMeetingQuery } from '../../../application/queries/get-meeting.query';

@ApiTags('meetings')
@Controller('meetings')
export class MeetingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Schedule a new meeting' })
  schedule(@Body() dto: any) {
    return this.commandBus.execute(new ScheduleMeetingCommand(
      dto.title,
      dto.description,
      dto.type,
      dto.scheduledAt,
      dto.location,
    ));
  }

  @Get()
  @ApiOperation({ summary: 'List meetings for the current tenant' })
  list(@Query('status') status?: string) {
    return this.queryBus.execute(new ListMeetingsQuery(status));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a meeting by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetMeetingQuery(id));
  }

  @Post(':id/convene')
  @ApiOperation({ summary: 'Convene a scheduled meeting' })
  convene(@Param('id') id: string) {
    return 'Meeting convened';
  }

  @Post(':id/adjourn')
  @ApiOperation({ summary: 'Adjourn a convened meeting' })
  adjourn(@Param('id') id: string) {
    return 'Meeting adjourned';
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a meeting' })
  cancel(@Param('id') id: string) {
    return 'Meeting cancelled';
  }
}
