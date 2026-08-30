import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AddPaymentMethodCommand } from '../../../application/commands/add-payment-method.command';
import { CancelSubscriptionCommand } from '../../../application/commands/cancel-subscription.command';
import { ChangeBillingPlanCommand } from '../../../application/commands/change-billing-plan.command';
import { IssueApiKeyCommand } from '../../../application/commands/issue-api-key.command';
import { OnboardTenantCommand } from '../../../application/commands/onboard-tenant.command';
import { RecordUsageCommand } from '../../../application/commands/record-usage.command';
import { RevokeApiKeyCommand } from '../../../application/commands/revoke-api-key.command';
import { RotateApiKeyCommand } from '../../../application/commands/rotate-api-key.command';
import { UpdateTenantProfileCommand } from '../../../application/commands/update-tenant-profile.command';
import {
  AddPaymentMethodDto,
  ChangeBillingPlanDto,
  IssueApiKeyDto,
  OnboardTenantDto,
  RecordUsageDto,
  RotateApiKeyDto,
  UpdateTenantProfileDto,
} from '../../../application/dto/organization.dto';
import { GetApiKeyQuery } from '../../../application/queries/get-api-key.query';
import { GetBillingSummaryQuery } from '../../../application/queries/get-billing-summary.query';
import { GetTenantProfileQuery } from '../../../application/queries/get-tenant-profile.query';
import { ListApiKeysQuery } from '../../../application/queries/list-api-keys.query';

@ApiTags('organization')
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('onboard')
  @ApiOperation({ summary: 'Provision the organization profile and default entitlement' })
  onboardTenant(@Body() dto: OnboardTenantDto) {
    return this.commandBus.execute(new OnboardTenantCommand(dto));
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get the organization profile' })
  getTenantProfile() {
    return this.queryBus.execute(new GetTenantProfileQuery());
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update organization profile settings' })
  updateTenantProfile(@Body() dto: UpdateTenantProfileDto) {
    return this.commandBus.execute(new UpdateTenantProfileCommand(dto));
  }

  @Get('billing')
  @ApiOperation({ summary: 'Get billing and subscription summary' })
  getBillingSummary() {
    return this.queryBus.execute(new GetBillingSummaryQuery());
  }

  @Post('billing/plan')
  @ApiOperation({ summary: 'Change the billing plan' })
  changeBillingPlan(@Body() dto: ChangeBillingPlanDto) {
    return this.commandBus.execute(new ChangeBillingPlanCommand(dto));
  }

  @Post('billing/payment-method')
  @ApiOperation({ summary: 'Add or update the payment method' })
  addPaymentMethod(@Body() dto: AddPaymentMethodDto) {
    return this.commandBus.execute(new AddPaymentMethodCommand(dto));
  }

  @Post('billing/usage')
  @ApiOperation({ summary: 'Record usage against the entitlement' })
  recordUsage(@Body() dto: RecordUsageDto) {
    return this.commandBus.execute(new RecordUsageCommand(dto));
  }

  @Post('billing/cancel')
  @ApiOperation({ summary: 'Cancel the subscription' })
  cancelSubscription() {
    return this.commandBus.execute(new CancelSubscriptionCommand());
  }

  @Get('api-keys')
  @ApiOperation({ summary: 'List API keys' })
  listApiKeys() {
    return this.queryBus.execute(new ListApiKeysQuery());
  }

  @Post('api-keys')
  @ApiOperation({ summary: 'Issue an API key' })
  issueApiKey(@Body() dto: IssueApiKeyDto) {
    return this.commandBus.execute(new IssueApiKeyCommand(dto));
  }

  @Get('api-keys/:id')
  @ApiOperation({ summary: 'Get an API key' })
  getApiKey(@Param('id') id: string) {
    return this.queryBus.execute(new GetApiKeyQuery(id));
  }

  @Post('api-keys/:id/rotate')
  @ApiOperation({ summary: 'Rotate an API key' })
  rotateApiKey(@Param('id') id: string, @Body() dto: RotateApiKeyDto) {
    return this.commandBus.execute(new RotateApiKeyCommand(id, dto.ttlDays ?? null));
  }

  @Post('api-keys/:id/revoke')
  @ApiOperation({ summary: 'Revoke an API key' })
  revokeApiKey(@Param('id') id: string) {
    return this.commandBus.execute(new RevokeApiKeyCommand(id));
  }
}
