import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AddToWhitelistCommand } from '../../../application/commands/add-to-whitelist.command';
import { ConfirmTokenMintCommand } from '../../../application/commands/confirm-token-mint.command';
import { CreateIssuanceCommand } from '../../../application/commands/create-issuance.command';
import { RemoveFromWhitelistCommand } from '../../../application/commands/remove-from-whitelist.command';
import { RequestTokenMintCommand } from '../../../application/commands/request-token-mint.command';
import { SignIssuanceLegalDocsCommand } from '../../../application/commands/sign-issuance-legal-docs.command';
import { SyncCapTableCommand } from '../../../application/commands/sync-cap-table.command';
import { CreateIssuanceDto } from '../../../application/dto/create-issuance.dto';
import {
  AddToWhitelistDto,
  RemoveFromWhitelistDto,
  RequestMintDto,
  SignLegalDocsDto,
  SyncCapTableDto,
} from '../../../application/dto/issuance-action.dto';
import { GetIssuanceQuery } from '../../../application/queries/get-issuance.query';
import { GetWhitelistQuery } from '../../../application/queries/get-whitelist.query';
import { ListIssuancesQuery } from '../../../application/queries/list-issuances.query';

@ApiTags('issuances')
@Controller('issuances')
export class IssuanceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create an issuance' })
  create(@Body() dto: CreateIssuanceDto) {
    return this.commandBus.execute(new CreateIssuanceCommand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'List issuances' })
  list() {
    return this.queryBus.execute(new ListIssuancesQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an issuance by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetIssuanceQuery(id));
  }

  @Get(':id/whitelist')
  @ApiOperation({ summary: 'Get the whitelist for an issuance' })
  whitelist(@Param('id') id: string) {
    return this.queryBus.execute(new GetWhitelistQuery(id));
  }

  @Post(':id/legal-docs/sign')
  @ApiOperation({ summary: 'Sign issuance legal documents' })
  signLegalDocs(@Param('id') id: string, @Body() dto: SignLegalDocsDto) {
    return this.commandBus.execute(new SignIssuanceLegalDocsCommand(id, dto.signedBy));
  }

  @Post(':id/mint/request')
  @ApiOperation({ summary: 'Request a token mint' })
  requestMint(@Param('id') id: string, @Body() dto: RequestMintDto) {
    return this.commandBus.execute(new RequestTokenMintCommand(id, dto));
  }

  @Post(':id/mint/:mintRequestId/confirm')
  @ApiOperation({ summary: 'Confirm a token mint' })
  confirmMint(@Param('id') id: string, @Param('mintRequestId') mintRequestId: string) {
    return this.commandBus.execute(new ConfirmTokenMintCommand(id, mintRequestId));
  }

  @Post(':id/whitelist')
  @ApiOperation({ summary: 'Add a wallet to the whitelist' })
  addToWhitelist(@Param('id') id: string, @Body() dto: AddToWhitelistDto) {
    return this.commandBus.execute(new AddToWhitelistCommand(id, dto));
  }

  @Post(':id/whitelist/remove')
  @ApiOperation({ summary: 'Remove a wallet from the whitelist' })
  removeFromWhitelist(@Param('id') id: string, @Body() dto: RemoveFromWhitelistDto) {
    return this.commandBus.execute(new RemoveFromWhitelistCommand(id, dto.walletAddress));
  }

  @Post(':id/cap-table/sync')
  @ApiOperation({ summary: 'Sync the issuance with the cap table' })
  syncCapTable(@Param('id') id: string, @Body() dto: SyncCapTableDto) {
    return this.commandBus.execute(new SyncCapTableCommand(id, dto.capTableId));
  }
}