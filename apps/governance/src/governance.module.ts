import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IssueVotingNoticeHandler } from './application/commands/issue-voting-notice.handler';
import { ListProposalsHandler } from './application/queries/list-proposals.handler';
import { ScheduleMeetingHandler } from './application/commands/schedule-meeting.handler';
import { CloseVotingHandler } from './application/commands/close-voting.handler';
import { OpenVotingHandler } from './application/commands/open-voting.handler';
import { CastVoteHandler } from './application/commands/cast-vote.handler';
import { GetProposalHandler } from './application/queries/get-proposal.handler';
import { CreateProposalHandler } from './application/commands/create-proposal.handler';
import { GetVoteResultsHandler } from './application/queries/get-vote-results.handler';
import { ListMeetingsHandler } from './application/queries/list-meetings.handler';
import { GetMeetingHandler } from './application/queries/get-meeting.handler';
import { ProposalVotingService } from './domain/services/proposal-voting.service';
import { ProposalController } from './interface/http/controllers/proposal.controller';
import { VoteController } from './interface/http/controllers/vote.controller';
import { MeetingController } from './interface/http/controllers/meeting.controller';
import { PROPOSAL_REPOSITORY, VOTE_REPOSITORY, MEETING_REPOSITORY } from './domain/repositories/repository.tokens';
import { PostgresProposalRepository } from './infrastructure/persistence/postgres-proposal.repository';
import { PostgresVoteRepository } from './infrastructure/persistence/postgres-vote.repository';
import { PostgresMeetingRepository } from './infrastructure/persistence/postgres-meeting.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigModule) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 5432),
        username: config.get('DB_USER', 'daos'),
        password: config.get('DB_PASSWORD', 'daos_dev_password'),
        database: config.get('DB_NAME', 'daos'),
        schema: 'governance',
        autoLoadEntities: true,
      }),
      inject: [ConfigModule],
    }),
  ],
  controllers: [ProposalController, VoteController, MeetingController],
  providers: [
    { provide: PROPOSAL_REPOSITORY, useClass: PostgresProposalRepository },
    { provide: VOTE_REPOSITORY, useClass: PostgresVoteRepository },
    { provide: MEETING_REPOSITORY, useClass: PostgresMeetingRepository },
    ProposalVotingService,
    IssueVotingNoticeHandler,
    ListProposalsHandler,
    ScheduleMeetingHandler,
    CloseVotingHandler,
    OpenVotingHandler,
    CastVoteHandler,
    GetProposalHandler,
    CreateProposalHandler,
    GetVoteResultsHandler,
    ListMeetingsHandler,
    GetMeetingHandler,
  ],
})
export class GovernanceModule {}
