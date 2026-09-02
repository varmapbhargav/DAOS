import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  AddCashFlowCommand,
} from '../../../application/commands/add-cash-flow.command';
import {
  CreateCashFlowModelCommand,
} from '../../../application/commands/create-cash-flow-model.command';
import {
  DeleteCashFlowModelCommand,
  SetDiscountRateCommand,
  UpdateCashFlowModelCommand,
} from '../../../application/commands/update-delete-cash-flow-model.commands';
import {
  AddCashFlowDto,
  CreateCashFlowModelDto,
  SetDiscountRateDto,
  UpdateCashFlowModelDto,
} from '../../../application/dto/cash-flow-model.dto';
import {
  GetCashFlowModelQuery,
  ListCashFlowModelsByAssetQuery,
} from '../../../application/queries/cash-flow-model.query';

@ApiTags('cash-flow-models')
@Controller('assets/:assetId/cash-flow-models')
export class CashFlowController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List cash flow models for an asset' })
  listByAsset(@Param('assetId') assetId: string) {
    return this.queryBus.execute(new ListCashFlowModelsByAssetQuery(assetId));
  }

  @Post()
  @ApiOperation({ summary: 'Create a cash flow model for an asset' })
  create(@Param('assetId') assetId: string, @Body() dto: CreateCashFlowModelDto) {
    return this.commandBus.execute(new CreateCashFlowModelCommand(assetId, dto));
  }

  @Get(':modelId')
  @ApiOperation({ summary: 'Get a cash flow model by id' })
  get(@Param('modelId') modelId: string) {
    return this.queryBus.execute(new GetCashFlowModelQuery(modelId));
  }

  @Put(':modelId')
  @ApiOperation({ summary: 'Update a cash flow model' })
  update(@Param('modelId') modelId: string, @Body() dto: UpdateCashFlowModelDto) {
    return this.commandBus.execute(new UpdateCashFlowModelCommand(modelId, dto));
  }

  @Delete(':modelId')
  @ApiOperation({ summary: 'Delete a cash flow model' })
  remove(@Param('modelId') modelId: string) {
    return this.commandBus.execute(new DeleteCashFlowModelCommand(modelId));
  }

  @Post(':modelId/cash-flows')
  @ApiOperation({ summary: 'Add a cash flow row to a model' })
  addCashFlow(@Param('modelId') modelId: string, @Body() dto: AddCashFlowDto) {
    return this.commandBus.execute(new AddCashFlowCommand(modelId, dto));
  }

  @Put(':modelId/discount-rate')
  @ApiOperation({ summary: 'Set the discount rate for a cash flow model' })
  setDiscountRate(@Param('modelId') modelId: string, @Body() dto: SetDiscountRateDto) {
    return this.commandBus.execute(new SetDiscountRateCommand(modelId, dto));
  }
}

