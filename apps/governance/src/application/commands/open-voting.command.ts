export class OpenVotingCommand {
  constructor(
    public readonly proposalId: string,
    public readonly votingStartAt: string,
    public readonly votingEndAt: string,
  ) {}
}
