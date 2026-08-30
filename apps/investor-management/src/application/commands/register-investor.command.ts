import { ConflictError, Email, InvestorProfile, OutboxPublisher, TenantContextHolder, TenantId } from '@daos/shared-kernel';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Investor } from '../../domain/aggregates/investor.aggregate';
import {
  INVESTOR_REPOSITORY,
  OUTBOX_PUBLISHER,
} from '../../domain/repositories/repository.tokens';
import { InvestorRepository } from '../../domain/repositories/investor.repository';
import { RegisterInvestorDto } from '../dto/register-investor.dto';

export class RegisterInvestorCommand {
  constructor(public readonly dto: RegisterInvestorDto) {}
}

@CommandHandler(RegisterInvestorCommand)
export class RegisterInvestorHandler implements ICommandHandler<RegisterInvestorCommand, { investorId: string }> {
  constructor(
    @Inject(INVESTOR_REPOSITORY) private readonly investors: InvestorRepository,
    @Inject(OUTBOX_PUBLISHER) private readonly outbox: OutboxPublisher,
  ) {}

  async execute(command: RegisterInvestorCommand): Promise<{ investorId: string }> {
    const dto = command.dto;
    const tenantId = TenantId.create(TenantContextHolder.requireTenantId());

    const email = Email.create(dto.email);
    if (await this.investors.findByEmail(tenantId, email)) {
      throw new ConflictError(`Investor already exists: ${dto.email}`);
    }

    const profile: InvestorProfile = {
      legalName: dto.profile.legalName,
      dateOfBirth: new Date(dto.profile.dateOfBirth),
      nationality: dto.profile.nationality,
      taxId: dto.profile.taxId,
    };

    const investor = Investor.invite({ tenantId, email, userId: dto.userId, profile });
    await this.investors.save(investor);
    await this.outbox.publish(investor.pullEvents());
    return { investorId: investor.id.value };
  }
}
