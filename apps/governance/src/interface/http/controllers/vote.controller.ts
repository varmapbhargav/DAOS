import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CastVoteCommand } from '../../../application/commands/cast-vote.command';
import { GetVoteResultsQuery } from '../../../application/queries/get-vote-results.query';

@ApiTags('votes')
@Controller('votes')
export class VoteController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cast a vote on a proposal' })
  cast(@Body() dto: { proposalId: string; choice: 'for' | 'against' | 'abstain'; shares: number }) {
    return this.commandBus.execute(new CastVoteCommand(dto.proposalId, dto.choice, dto.shares));
  }

  @Get('proposal/:proposalId')
  @ApiOperation({ summary: 'Get vote results for a proposal' })
  results(@Param('proposalId') proposalId: string) {
    return this.queryBus.execute(new GetVoteResultsQuery(proposalId));
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get votes cast by a user' })
  userVotes(@Param('userId') userId: string) {
    return [];
  }
}
