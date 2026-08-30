import { TenantContextHolder, UserId } from '@daos/shared-kernel';

export class CreateProposalCommand {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly type: string,
    public readonly votingMechanism: string,
    public readonly quorumPercentage: number,
    public readonly sharesEligible: number,
  ) {}

  static fromDto(dto: {
    title: string;
    description: string;
    type: string;
    votingMechanism: string;
    quorumPercentage: number;
    sharesEligible: number;
  }): CreateProposalCommand {
    return new CreateProposalCommand(
      dto.title,
      dto.description,
      dto.type,
      dto.votingMechanism,
      dto.quorumPercentage,
      dto.sharesEligible,
    );
  }
}
