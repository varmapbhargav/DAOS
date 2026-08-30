@CommandHandler(CreateProposalCommand)
export class CreateProposalHandler implements ICommandHandler<CreateProposalCommand, CreateProposalResponse> {
  constructor(
    @Inject(PROPOSAL_REPOSITORY) private readonly proposals: ProposalRepository,
  ) {}

  async execute(command: CreateProposalCommand): Promise<CreateProposalResponse> {
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());
    const userId = UserId.create();

    const proposal = Proposal.create({
      tenantId,
      createdById: userId,
      title: command.title,
      description: command.description,
      type: command.type as any,
      votingMechanism: command.votingMechanism as any,
      quorumPercentage: command.quorumPercentage,
      sharesEligible: command.sharesEligible,
    });

    await this.proposals.save(proposal);

    return new CreateProposalResponse(proposal.id.value);
  }
}
