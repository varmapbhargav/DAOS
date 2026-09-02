import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  AddTaskDependencyCommand,
  AssignTaskCommand,
  CancelTaskCommand,
  CompleteTaskCommand,
  CreateTaskCommand,
  EscalateTaskCommand,
  RecordInteractionCommand,
  UpdateTaskCommand,
} from '../../../application/commands/interaction-task.commands';
import {
  AddTaskDependencyDto,
  AssignTaskDto,
  CreateTaskDto,
  EscalateTaskDto,
  RecordInteractionDto,
  UpdateTaskDto,
} from '../../../application/dto/interaction-task.dto';
import {
  GetInteractionQuery,
  GetTaskQuery,
  ListInteractionsQuery,
  ListTasksQuery,
} from '../../../application/queries/interaction-task.query';

@ApiTags('interactions')
@Controller('interactions')
export class InteractionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Record an interaction (email, meeting, call, etc.)' })
  record(@Body() dto: RecordInteractionDto) {
    return this.commandBus.execute(new RecordInteractionCommand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'List interactions with filters' })
  list(@Query() query: ListInteractionsQuery) {
    return this.queryBus.execute(new ListInteractionsQuery(query.caseId, query.assetId, query.counterpartyId, query.from, query.to));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an interaction by ID' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetInteractionQuery(id));
  }
}

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(@Body() dto: CreateTaskDto) {
    return this.commandBus.execute(new CreateTaskCommand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'List tasks with filters' })
  list(@Query() query: ListTasksQuery) {
    return this.queryBus.execute(new ListTasksQuery(query.caseId, query.assetId, query.assignee, query.status, query.type, query.overdue));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetTaskQuery(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task (status, priority, assignee, due date, evidence, escalation)' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.commandBus.execute(new UpdateTaskCommand(id, dto));
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign a task to a user' })
  assign(@Param('id') id: string, @Body() dto: AssignTaskDto) {
    return this.commandBus.execute(new AssignTaskCommand(id, dto));
  }

  @Post(':id/dependencies')
  @ApiOperation({ summary: 'Add a task dependency' })
  addDependency(@Param('id') id: string, @Body() dto: AddTaskDependencyDto) {
    return this.commandBus.execute(new AddTaskDependencyCommand(id, dto));
  }

  @Post(':id/escalate')
  @ApiOperation({ summary: 'Escalate a task' })
  escalate(@Param('id') id: string, @Body() dto: EscalateTaskDto) {
    return this.commandBus.execute(new EscalateTaskCommand(id, dto));
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a task with evidence' })
  complete(@Param('id') id: string, @Body() dto: { evidence?: string[] } = {}) {
    return this.commandBus.execute(new CompleteTaskCommand(id, dto.evidence));
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a task' })
  cancel(@Param('id') id: string) {
    return this.commandBus.execute(new CancelTaskCommand(id));
  }
}