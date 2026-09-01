import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  AddAssetToPoolCommand,
  ChangePoolStatusCommand,
  CheckEligibilityCommand,
  CreateAssetPoolCommand,
  MergePoolsCommand,
  RebalancePoolCommand,
  RemoveAssetFromPoolCommand,
  SetParentPoolCommand,
  SplitPoolCommand,
  UpdateAssetAllocationCommand,
  UpdateAssetPoolCommand,
  UpdateConcentrationRulesCommand,
  UpdateEligibilityPolicyCommand,
} from '../../../application/commands/asset-pool.commands';
import {
  AddAssetToPoolDto,
  ChangePoolStatusDto,
  CheckEligibilityDto,
  CreateAssetPoolDto,
  MergePoolsDto,
  RebalancePoolDto,
  RemoveAssetFromPoolDto,
  SetParentPoolDto,
  SplitPoolDto,
  UpdateAssetAllocationDto,
  UpdateAssetPoolDto,
  UpdateConcentrationRulesDto,
  UpdateEligibilityPolicyDto,
} from '../../../application/dto/asset-pool.dto';
import {
  GetAssetPoolByNameQuery,
  GetAssetPoolQuery,
  GetPoolAssetByAssetQuery,
  ListAssetPoolsQuery,
  ListPoolAssetsQuery,
} from '../../../application/queries/asset-pool.query';

@ApiTags('asset-pools')
@Controller('asset-pools')
export class AssetPoolController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new asset pool' })
  create(@Body() dto: CreateAssetPoolDto) {
    return this.commandBus.execute(new CreateAssetPoolCommand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'List asset pools' })
  list(@Body() body: { status?: string } = {}) {
    return this.queryBus.execute(new ListAssetPoolsQuery(body.status));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an asset pool by ID' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetAssetPoolQuery(id));
  }

  @Get('by-name/:name')
  @ApiOperation({ summary: 'Get an asset pool by name' })
  getByName(@Param('name') name: string) {
    return this.queryBus.execute(new GetAssetPoolByNameQuery(name));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an asset pool' })
  update(@Param('id') id: string, @Body() dto: UpdateAssetPoolDto) {
    return this.commandBus.execute(new UpdateAssetPoolCommand(id, dto));
  }

  @Post(':id/status')
  @ApiOperation({ summary: 'Change pool status (activate, suspend, close, liquidate)' })
  changeStatus(@Param('id') id: string, @Body() dto: ChangePoolStatusDto) {
    return this.commandBus.execute(new ChangePoolStatusCommand(id, dto));
  }

  @Post(':id/assets')
  @ApiOperation({ summary: 'Add an asset to the pool' })
  addAsset(@Param('id') id: string, @Body() dto: AddAssetToPoolDto) {
    return this.commandBus.execute(new AddAssetToPoolCommand(id, dto));
  }

  @Get(':id/assets')
  @ApiOperation({ summary: 'List assets in the pool' })
  listAssets(@Param('id') id: string) {
    return this.queryBus.execute(new ListPoolAssetsQuery(id));
  }

  @Get(':id/assets/:assetId')
  @ApiOperation({ summary: 'Get a pool asset by asset ID' })
  getPoolAsset(@Param('id') id: string, @Param('assetId') assetId: string) {
    return this.queryBus.execute(new GetPoolAssetByAssetQuery(id, assetId));
  }

  @Patch(':id/assets/:assetId')
  @ApiOperation({ summary: 'Update asset allocation in the pool' })
  updateAssetAllocation(@Param('id') id: string, @Param('assetId') assetId: string, @Body() dto: UpdateAssetAllocationDto) {
    return this.commandBus.execute(new UpdateAssetAllocationCommand(id, assetId, dto));
  }

  @Post(':id/assets/:assetId/remove')
  @ApiOperation({ summary: 'Remove an asset from the pool' })
  removeAsset(@Param('id') id: string, @Param('assetId') assetId: string, @Body() dto: RemoveAssetFromPoolDto) {
    return this.commandBus.execute(new RemoveAssetFromPoolCommand(id, assetId, dto));
  }

  @Post(':id/rebalance')
  @ApiOperation({ summary: 'Rebalance the pool to target allocations' })
  rebalance(@Param('id') id: string, @Body() dto: RebalancePoolDto) {
    return this.commandBus.execute(new RebalancePoolCommand(id, dto));
  }

  @Post(':id/split')
  @ApiOperation({ summary: 'Split the pool into child pools' })
  split(@Param('id') id: string, @Body() dto: SplitPoolDto) {
    return this.commandBus.execute(new SplitPoolCommand(id, dto));
  }

  @Post(':id/merge')
  @ApiOperation({ summary: 'Merge source pools into this pool' })
  merge(@Param('id') id: string, @Body() dto: MergePoolsDto) {
    return this.commandBus.execute(new MergePoolsCommand(id, dto));
  }

  @Post(':id/concentration-rules')
  @ApiOperation({ summary: 'Update concentration rules' })
  updateConcentrationRules(@Param('id') id: string, @Body() dto: UpdateConcentrationRulesDto) {
    return this.commandBus.execute(new UpdateConcentrationRulesCommand(id, dto));
  }

  @Post(':id/eligibility-policy')
  @ApiOperation({ summary: 'Update eligibility policy' })
  updateEligibilityPolicy(@Param('id') id: string, @Body() dto: UpdateEligibilityPolicyDto) {
    return this.commandBus.execute(new UpdateEligibilityPolicyCommand(id, dto));
  }

  @Post(':id/check-eligibility')
  @ApiOperation({ summary: 'Check if an asset is eligible for this pool' })
  checkEligibility(@Param('id') id: string, @Body() dto: CheckEligibilityDto) {
    return this.commandBus.execute(new CheckEligibilityCommand(id, dto));
  }

  @Post(':id/parent-pool')
  @ApiOperation({ summary: 'Set parent pool' })
  setParentPool(@Param('id') id: string, @Body() dto: SetParentPoolDto) {
    return this.commandBus.execute(new SetParentPoolCommand(id, dto));
  }
}