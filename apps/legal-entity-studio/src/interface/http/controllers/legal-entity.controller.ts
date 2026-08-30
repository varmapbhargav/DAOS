import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ActivateEntityCommand } from '../../../application/commands/activate-entity.command';
import { AddEntityDocumentCommand } from '../../../application/commands/add-entity-document.command';
import { AppointRegisteredAgentCommand } from '../../../application/commands/appoint-registered-agent.command';
import { DissolveLegalEntityCommand } from '../../../application/commands/dissolve-legal-entity.command';
import { FormLegalEntityCommand } from '../../../application/commands/form-legal-entity.command';
import { UpdateEntityHierarchyCommand } from '../../../application/commands/update-entity-hierarchy.command';
import { FormLegalEntityDto } from '../../../application/dto/form-legal-entity.dto';
import {
  ActivateEntityDto,
  AddEntityDocumentDto,
  AppointRegisteredAgentDto,
  DissolveEntityDto,
  UpdateHierarchyDto,
} from '../../../application/dto/entity-action.dto';
import { GetEntityHierarchyQuery } from '../../../application/queries/get-entity-hierarchy.query';
import { GetLegalEntityQuery } from '../../../application/queries/get-legal-entity.query';
import { ListLegalEntitiesQuery } from '../../../application/queries/list-legal-entities.query';

@ApiTags('legal-entities')
@Controller('entities')
export class LegalEntityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Form a new legal entity' })
  form(@Body() dto: FormLegalEntityDto) {
    return this.commandBus.execute(new FormLegalEntityCommand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'List legal entities' })
  list() {
    return this.queryBus.execute(new ListLegalEntitiesQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a legal entity by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetLegalEntityQuery(id));
  }

  @Get(':id/hierarchy')
  @ApiOperation({ summary: 'Get the entity hierarchy' })
  hierarchy(@Param('id') id: string) {
    return this.queryBus.execute(new GetEntityHierarchyQuery(id));
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate a legal entity' })
  activate(@Param('id') id: string, @Body() dto: ActivateEntityDto) {
    return this.commandBus.execute(new ActivateEntityCommand(id, dto.activatedBy));
  }

  @Post(':id/hierarchy')
  @ApiOperation({ summary: 'Update the entity hierarchy' })
  updateHierarchy(@Param('id') id: string, @Body() dto: UpdateHierarchyDto) {
    return this.commandBus.execute(new UpdateEntityHierarchyCommand(id, dto));
  }

  @Post(':id/registered-agent')
  @ApiOperation({ summary: 'Appoint a registered agent' })
  appoint(@Param('id') id: string, @Body() dto: AppointRegisteredAgentDto) {
    return this.commandBus.execute(new AppointRegisteredAgentCommand(id, dto));
  }

  @Post(':id/dissolve')
  @ApiOperation({ summary: 'Dissolve a legal entity' })
  dissolve(@Param('id') id: string, @Body() dto: DissolveEntityDto) {
    return this.commandBus.execute(new DissolveLegalEntityCommand(id, dto.reason));
  }

  @Post(':id/documents')
  @ApiOperation({ summary: 'Add a corporate document to an entity' })
  addDocument(@Param('id') id: string, @Body() dto: AddEntityDocumentDto) {
    return this.commandBus.execute(new AddEntityDocumentCommand(id, dto));
  }
}
