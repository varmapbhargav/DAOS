export class CastVoteCommand {
  constructor(
    public readonly proposalId: string,
    public readonly choice: 'for' | 'against' | 'abstain',
    public readonly shares: number,
  ) {}
}
