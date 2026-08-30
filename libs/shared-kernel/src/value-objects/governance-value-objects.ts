// Governance & Voting Value Objects
export type ProposalType =
  | 'amendment'
  | 'capitalAction'
  | 'managementChange'
  | 'fundTermination'
  | 'strategyChange'
  | 'other';

export type ProposalStatus =
  | 'draft'
  | 'noticeIssued'
  | 'votingOpen'
  | 'votingClosed'
  | 'quorumNotMet'
  | 'passed'
  | 'failed'
  | 'implemented';

export type VotingMechanism =
  | 'weightedByShares'
  | 'weightedByCommitment'
  | 'weightedByToken'
  | 'oneShareOneVote';

export type VoteChoice = 'for' | 'against' | 'abstain';

export type MeetingType = 'annual' | 'special' | 'board' | 'committee';

export type MeetingStatus = 'scheduled' | 'convened' | 'adjourned' | 'cancelled';
