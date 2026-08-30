import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AllocateSubscriptionsCommand } from '../../../application/commands/allocate-subscriptions.command';
import { CompleteClosingCommand } from '../../../application/commands/complete-closing.command';
import { ExecuteSubscriptionDocumentsCommand } from '../../../application/commands/execute-subscription-documents.command';
import { FundCapitalCallCommand } from '../../../application/commands/fund-capital-call.command';
import { FundSubscriptionCommand } from '../../../application/commands/fund-subscription.command';
import { IssueCapitalCallCommand } from '../../../application/commands/issue-capital-call.command';
import { ReceiveSubscriptionCommand } from '../../../application/commands/receive-subscription.command';
import { RejectSubscriptionCommand } from '../../../application/commands/reject-subscription.command';
import { SendSubscriptionDocumentsCommand } from '../../../application/commands/send-subscription-documents.command';
import {
  AllocateSubscriptionsDto,
  FundCapitalCallDto,
  IssueCapitalCallDto,
  ReceiveSubscriptionDto,
  RejectSubscriptionDto,
} from '../../../application/dto/distribution.dto';
import { GetAllocationQuery } from '../../../application/queries/get-allocation.query';
import { GetCapitalCallQuery } from '../../../application/queries/get-capital-call.query';
import { GetClosingQuery } from '../../../application/queries/get-closing.query';
import { GetFundraisingProgressQuery } from '../../../application/queries/get-fundraising-progress.query';
import { GetSubscriptionQuery } from '../../../application/queries/get-subscription.query';
import { ListSubscriptionsQuery } from '../../../application/queries/list-subscriptions.query';

@ApiTags('distribution')
@Controller()
export class DistributionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('subscriptions')
  @ApiOperation({ summary: 'Receive a subscription' })
  receive(@Body() dto: ReceiveSubscriptionDto) {
    return this.commandBus.execute(new ReceiveSubscriptionCommand(dto));
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'List subscriptions' })
  list(@Query('productId') productId?: string, @Query('investorId') investorId?: string) {
    return this.queryBus.execute(new ListSubscriptionsQuery(productId, investorId));
  }

  @Get('subscriptions/:id')
  @ApiOperation({ summary: 'Get a subscription by id' })
  getSubscription(@Param('id') id: string) {
    return this.queryBus.execute(new GetSubscriptionQuery(id));
  }

  @Post('subscriptions/:id/documents/send')
  @ApiOperation({ summary: 'Send subscription documents' })
  sendDocuments(@Param('id') id: string) {
    return this.commandBus.execute(new SendSubscriptionDocumentsCommand(id));
  }

  @Post('subscriptions/:id/documents/execute')
  @ApiOperation({ summary: 'Execute subscription documents' })
  executeDocuments(@Param('id') id: string) {
    return this.commandBus.execute(new ExecuteSubscriptionDocumentsCommand(id));
  }

  @Post('subscriptions/:id/fund')
  @ApiOperation({ summary: 'Fund a subscription' })
  fundSubscription(@Param('id') id: string) {
    return this.commandBus.execute(new FundSubscriptionCommand(id));
  }

  @Post('subscriptions/:id/reject')
  @ApiOperation({ summary: 'Reject a subscription' })
  reject(@Param('id') id: string, @Body() dto: RejectSubscriptionDto) {
    return this.commandBus.execute(new RejectSubscriptionCommand(id, dto));
  }

  @Post('allocations')
  @ApiOperation({ summary: 'Allocate subscriptions for a raising' })
  allocate(@Body() dto: AllocateSubscriptionsDto) {
    return this.commandBus.execute(new AllocateSubscriptionsCommand(dto));
  }

  @Get('allocations/:id')
  @ApiOperation({ summary: 'Get an allocation by id' })
  getAllocation(@Param('id') id: string) {
    return this.queryBus.execute(new GetAllocationQuery(id));
  }

  @Post('capital-calls')
  @ApiOperation({ summary: 'Issue a capital call' })
  issueCapitalCall(@Body() dto: IssueCapitalCallDto) {
    return this.commandBus.execute(new IssueCapitalCallCommand(dto));
  }

  @Get('capital-calls/:id')
  @ApiOperation({ summary: 'Get a capital call by id' })
  getCapitalCall(@Param('id') id: string) {
    return this.queryBus.execute(new GetCapitalCallQuery(id));
  }

  @Post('capital-calls/:id/fund')
  @ApiOperation({ summary: 'Fund a capital call' })
  fundCapitalCall(@Param('id') id: string, @Body() dto: FundCapitalCallDto) {
    return this.commandBus.execute(new FundCapitalCallCommand(id, dto));
  }

  @Post('closings/:id/complete')
  @ApiOperation({ summary: 'Complete a closing' })
  completeClosing(@Param('id') id: string) {
    return this.commandBus.execute(new CompleteClosingCommand(id));
  }

  @Get('closings/:id')
  @ApiOperation({ summary: 'Get a closing by id' })
  getClosing(@Param('id') id: string) {
    return this.queryBus.execute(new GetClosingQuery(id));
  }

  @Get('fundraising/progress/:productId')
  @ApiOperation({ summary: 'Get fundraising progress for a product' })
  progress(@Param('productId') productId: string) {
    return this.queryBus.execute(new GetFundraisingProgressQuery(productId));
  }
}
