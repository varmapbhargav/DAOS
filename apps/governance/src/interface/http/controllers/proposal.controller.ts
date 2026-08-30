import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CastVoteCommand } from '../../../application/commands/cast-vote.command';
import { CloseVotingCommand } from '../../../application/commands/close-voting.command';
import { CreateProposalCommand } from '../../../application/commands/create-proposal.command';
import { IssueVotingNoticeCommand } from '../../../application/commands/issue-voting-notice.command';
import { OpenVotingCommand } from '../../../application/commands/open-voting.command';
import { ListProposalsQuery } from '../../../application/queries/list-proposals.query';
import { GetProposalQuery } from '../../../application/queries/get-proposal.query';
import { GetVoteResultsQuery } from '../../../application/queries/get-vote-results.query';

@ApiTags('proposals')
@Controller('proposals')
export class ProposalController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new proposal' })
  create(@Body() dto: any) {
    const cmd = CreateProposalCommand.fromDto(dto);
    return this.commandBus.execute(cmd);
  }

  @Get()
  @ApiOperation({ summary: 'List proposals for the current tenant' })
  list(@Query('status') status?: string) {
    return this.queryBus.execute(new ListProposalsQuery(status));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a proposal by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetProposalQuery(id));
  }

  @Get(':id/votes')
  @ApiOperation({ summary: 'Get vote results for a proposal' })
  votes(@Param('id') id: string) {
    return this.queryBus.execute(new GetVoteResultsQuery(id));
  }

  @Post(':id/voting/notice')
  @ApiOperation({ summary: 'Issue voting notice for a proposal' })
  issueNotice(@Param('id') id: string) {
    return this.commandBus.execute(new IssueVotingNoticeCommand(id));
  }

  @Post(':id/voting/open')
  @ApiOperation({ summary: 'Open voting for a proposal' })
  openVoting(@Param('id') id: string, @Body() dto: { startAt: string; endAt: string }) {
    return this.commandBus.execute(new OpenVotingCommand(id, dto.startAt, dto.endAt));
  }

  @Post(':id/voting/close')
  @ApiOperation({ summary: 'Close voting for a proposal' })
  closeVoting(@Param('id') id: string) {
    return this.commandBus.execute(new CloseVotingCommand(id));
  }

  @Post(':id/vote')
  @ApiOperation({ summary: 'Cast a vote on a proposal' })
  castVote(@Param('id') id: string, @Body() dto: { choice: 'for' | 'against' | 'abstain'; shares: number }) {
    return this.commandBus.execute(new CastVoteCommand(id, dto.choice, dto.shares));
  }
}
