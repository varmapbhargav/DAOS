import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  CompleteTransferabilityAssessmentCommand,
  CreateClaimCommand,
  CreateCounterpartyCommand,
  CreateDataRequestCommand,
  CreateEncumbranceCommand,
  CreateEvidenceCommand,
  CreateOwnershipCommand,
  CreateProvenanceEventCommand,
  CreateRightsCommand,
  CreateTransferabilityCommand,
  RejectClaimCommand,
  ReleaseEncumbranceCommand,
  RespondToDataRequestCommand,
  VerifyClaimCommand,
  VerifyCounterpartyCommand,
  VerifyOwnershipCommand,
} from '../../../application/commands/asset-profile.commands';
import {
  CompleteTransferabilityAssessmentDto,
  CreateClaimDto,
  CreateCounterpartyDto,
  CreateDataRequestDto,
  CreateEncumbranceDto,
  CreateEvidenceDto,
  CreateOwnershipDto,
  CreateProvenanceEventDto,
  CreateRightsDto,
  CreateTransferabilityDto,
  RejectClaimDto,
  RespondToDataRequestDto,
  VerifyClaimDto,
  VerifyCounterpartyDto,
  VerifyOwnershipDto,
} from '../../../application/dto/asset-profile.dto';
import {
  GetTransferabilityByAssetQuery,
  ListClaimsByAssetQuery,
  ListCounterpartiesByAssetQuery,
  ListDataRequestsByCaseQuery,
  ListEncumbrancesByAssetQuery,
  ListEvidenceByAssetQuery,
  ListEvidenceByCaseQuery,
  ListOwnershipByAssetQuery,
  ListProvenanceByAssetQuery,
  ListRightsByAssetQuery,
} from '../../../application/queries/asset-profile.query';

@ApiTags('asset-profiles')
@Controller('assets/:assetId')
export class AssetProfileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // Counterparties
  @Post('counterparties')
  @ApiOperation({ summary: 'Add a counterparty to an asset' })
  addCounterparty(@Body() dto: CreateCounterpartyDto) {
    return this.commandBus.execute(new CreateCounterpartyCommand(dto));
  }
  @Get('counterparties')
  @ApiOperation({ summary: 'List counterparties for an asset' })
  listCounterparties(@Param('assetId') assetId: string) {
    return this.queryBus.execute(new ListCounterpartiesByAssetQuery(assetId));
  }
  @Post('counterparties/:id/verify')
  @ApiOperation({ summary: 'Verify a counterparty' })
  verifyCounterparty(@Param('id') id: string, @Body() dto: VerifyCounterpartyDto) {
    return this.commandBus.execute(new VerifyCounterpartyCommand(id, dto));
  }

  // Ownership
  @Post('ownership')
  @ApiOperation({ summary: 'Add an ownership record to an asset' })
  addOwnership(@Body() dto: CreateOwnershipDto) {
    return this.commandBus.execute(new CreateOwnershipCommand(dto));
  }
  @Get('ownership')
  @ApiOperation({ summary: 'List ownership records for an asset' })
  listOwnership(@Param('assetId') assetId: string) {
    return this.queryBus.execute(new ListOwnershipByAssetQuery(assetId));
  }
  @Post('ownership/:id/verify')
  @ApiOperation({ summary: 'Verify an ownership record' })
  verifyOwnership(@Param('id') id: string, @Body() dto: VerifyOwnershipDto) {
    return this.commandBus.execute(new VerifyOwnershipCommand(id, dto));
  }

  // Rights
  @Post('rights')
  @ApiOperation({ summary: 'Add a rights record to an asset' })
  addRights(@Body() dto: CreateRightsDto) {
    return this.commandBus.execute(new CreateRightsCommand(dto));
  }
  @Get('rights')
  @ApiOperation({ summary: 'List rights for an asset' })
  listRights(@Param('assetId') assetId: string) {
    return this.queryBus.execute(new ListRightsByAssetQuery(assetId));
  }

  // Encumbrances
  @Post('encumbrances')
  @ApiOperation({ summary: 'Add an encumbrance to an asset' })
  addEncumbrance(@Body() dto: CreateEncumbranceDto) {
    return this.commandBus.execute(new CreateEncumbranceCommand(dto));
  }
  @Get('encumbrances')
  @ApiOperation({ summary: 'List encumbrances for an asset' })
  listEncumbrances(@Param('assetId') assetId: string) {
    return this.queryBus.execute(new ListEncumbrancesByAssetQuery(assetId));
  }
  @Post('encumbrances/:id/release')
  @ApiOperation({ summary: 'Release an encumbrance' })
  releaseEncumbrance(@Param('id') id: string) {
    return this.commandBus.execute(new ReleaseEncumbranceCommand(id));
  }

  // Transferability
  @Post('transferability')
  @ApiOperation({ summary: 'Create transferability record for an asset' })
  addTransferability(@Body() dto: CreateTransferabilityDto) {
    return this.commandBus.execute(new CreateTransferabilityCommand(dto));
  }
  @Get('transferability')
  @ApiOperation({ summary: 'Get transferability profile for an asset' })
  getTransferability(@Param('assetId') assetId: string) {
    return this.queryBus.execute(new GetTransferabilityByAssetQuery(assetId));
  }
  @Post('transferability/complete')
  @ApiOperation({ summary: 'Complete the transferability assessment' })
  completeTransferability(@Param('assetId') assetId: string, @Body() dto: CompleteTransferabilityAssessmentDto) {
    return this.commandBus.execute(new CompleteTransferabilityAssessmentCommand(assetId, dto));
  }

  // Provenance
  @Post('provenance')
  @ApiOperation({ summary: 'Add a provenance event to an asset' })
  addProvenance(@Body() dto: CreateProvenanceEventDto) {
    return this.commandBus.execute(new CreateProvenanceEventCommand(dto));
  }
  @Get('provenance')
  @ApiOperation({ summary: 'List provenance events for an asset' })
  listProvenance(@Param('assetId') assetId: string) {
    return this.queryBus.execute(new ListProvenanceByAssetQuery(assetId));
  }

  // Evidence
  @Post('evidence')
  @ApiOperation({ summary: 'Add evidence for an asset' })
  addEvidence(@Body() dto: CreateEvidenceDto) {
    return this.commandBus.execute(new CreateEvidenceCommand(dto));
  }
  @Get('evidence')
  @ApiOperation({ summary: 'List evidence for an asset' })
  listEvidence(@Param('assetId') assetId: string) {
    return this.queryBus.execute(new ListEvidenceByAssetQuery(assetId));
  }

  // Claims
  @Post('claims')
  @ApiOperation({ summary: 'Add a claim about an asset' })
  addClaim(@Body() dto: CreateClaimDto) {
    return this.commandBus.execute(new CreateClaimCommand(dto));
  }
  @Get('claims')
  @ApiOperation({ summary: 'List claims for an asset' })
  listClaims(@Param('assetId') assetId: string) {
    return this.queryBus.execute(new ListClaimsByAssetQuery(assetId));
  }
  @Post('claims/:id/verify')
  @ApiOperation({ summary: 'Verify a claim' })
  verifyClaim(@Param('id') id: string, @Body() dto: VerifyClaimDto) {
    return this.commandBus.execute(new VerifyClaimCommand(id, dto));
  }
  @Post('claims/:id/reject')
  @ApiOperation({ summary: 'Reject a claim' })
  rejectClaim(@Param('id') id: string, @Body() dto: RejectClaimDto) {
    return this.commandBus.execute(new RejectClaimCommand(id, dto));
  }
}

@ApiTags('origination-data-requests')
@Controller('origination-cases/:caseId')
export class CaseDataRequestController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('data-requests')
  @ApiOperation({ summary: 'Create a data request against a case' })
  createDataRequest(@Body() dto: CreateDataRequestDto) {
    return this.commandBus.execute(new CreateDataRequestCommand(dto));
  }
  @Get('data-requests')
  @ApiOperation({ summary: 'List data requests for a case' })
  listDataRequests(@Param('caseId') caseId: string) {
    return this.queryBus.execute(new ListDataRequestsByCaseQuery(caseId));
  }
  @Post('data-requests/:id/respond')
  @ApiOperation({ summary: 'Respond to a data request' })
  respond(@Param('id') id: string, @Body() dto: RespondToDataRequestDto) {
    return this.commandBus.execute(new RespondToDataRequestCommand(id, dto));
  }
  @Get('evidence')
  @ApiOperation({ summary: 'List evidence for a case' })
  listCaseEvidence(@Param('caseId') caseId: string) {
    return this.queryBus.execute(new ListEvidenceByCaseQuery(caseId));
  }
}
