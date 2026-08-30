import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApproveKycCommand } from '../../../application/commands/approve-kyc.command';
import { LinkWalletCommand } from '../../../application/commands/link-wallet.command';
import { RegisterInvestorCommand } from '../../../application/commands/register-investor.command';
import { RejectKycCommand } from '../../../application/commands/reject-kyc.command';
import { SubmitKycCommand } from '../../../application/commands/submit-kyc.command';
import { SuspendInvestorCommand } from '../../../application/commands/suspend-investor.command';
import { UpdateRiskProfileCommand } from '../../../application/commands/update-risk-profile.command';
import { VerifyAccreditationCommand } from '../../../application/commands/verify-accreditation.command';
import { RegisterInvestorDto, SubmitKycDto } from '../../../application/dto/register-investor.dto';
import {
  LinkWalletDto,
  RejectKycDto,
  SuspendInvestorDto,
  UpdateRiskProfileDto,
  VerifyAccreditationDto,
} from '../../../application/dto/investor-action.dto';
import { ApproveKycDto } from '../../../application/dto/admin-actions.dto';
import { CheckInvestorEligibilityQuery } from '../../../application/queries/check-investor-eligibility.query';
import { GetInvestorQuery } from '../../../application/queries/get-investor.query';
import { ListInvestorsQuery } from '../../../application/queries/list-investors.query';

@ApiTags('investors')
@Controller('investors')
export class InvestorController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register / invite a new investor' })
  register(@Body() dto: RegisterInvestorDto) {
    return this.commandBus.execute(new RegisterInvestorCommand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'List investors in the current tenant' })
  list() {
    return this.queryBus.execute(new ListInvestorsQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an investor by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetInvestorQuery(id));
  }

  @Get(':id/eligibility')
  @ApiOperation({ summary: 'Check eligibility (KYC + accreditation) for marketplace pre-trade checks' })
  eligibility(@Param('id') id: string) {
    return this.queryBus.execute(new CheckInvestorEligibilityQuery(id));
  }

  @Post(':id/kyc/submit')
  @ApiOperation({ summary: 'Submit KYC documents for an investor' })
  submitKyc(@Param('id') id: string, @Body() dto: SubmitKycDto) {
    return this.commandBus.execute(new SubmitKycCommand(id, dto));
  }

  @Post(':id/kyc/approve')
  @ApiOperation({ summary: 'Approve KYC for an investor' })
  approveKyc(@Param('id') id: string, @Body() _dto: ApproveKycDto) {
    return this.commandBus.execute(new ApproveKycCommand(id));
  }

  @Post(':id/kyc/reject')
  @ApiOperation({ summary: 'Reject KYC for an investor' })
  rejectKyc(@Param('id') id: string, @Body() dto: RejectKycDto) {
    return this.commandBus.execute(new RejectKycCommand(id, dto.reason));
  }

  @Post(':id/accreditation/verify')
  @ApiOperation({ summary: 'Verify an investor accreditation level' })
  verifyAccreditation(@Param('id') id: string, @Body() dto: VerifyAccreditationDto) {
    return this.commandBus.execute(new VerifyAccreditationCommand(id, dto));
  }

  @Post(':id/wallets')
  @ApiOperation({ summary: 'Link a wallet to an investor' })
  linkWallet(@Param('id') id: string, @Body() dto: LinkWalletDto) {
    return this.commandBus.execute(new LinkWalletCommand(id, dto.address));
  }

  @Post(':id/risk-profile')
  @ApiOperation({ summary: 'Update an investor risk profile' })
  updateRiskProfile(@Param('id') id: string, @Body() dto: UpdateRiskProfileDto) {
    return this.commandBus.execute(new UpdateRiskProfileCommand(id, dto));
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend an investor' })
  suspend(@Param('id') id: string, @Body() dto: SuspendInvestorDto) {
    return this.commandBus.execute(new SuspendInvestorCommand(id, dto.reason));
  }
}
