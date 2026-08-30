import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CancelOrderCommand } from '../../../application/commands/cancel-order.command';
import { DelistListingCommand } from '../../../application/commands/delist-listing.command';
import { ExecuteTradeCommand } from '../../../application/commands/execute-trade.command';
import { PlaceOrderCommand } from '../../../application/commands/place-order.command';
import { PublishListingCommand } from '../../../application/commands/publish-listing.command';
import { SuspendListingCommand } from '../../../application/commands/suspend-listing.command';
import {
  CancelOrderDto,
  DelistListingDto,
  PlaceOrderDto,
  PublishListingDto,
  SuspendListingDto,
} from '../../../application/dto/marketplace.dto';
import { GetListingQuery } from '../../../application/queries/get-listing.query';
import { GetOrderBookQuery } from '../../../application/queries/get-order-book.query';
import { GetOrderQuery } from '../../../application/queries/get-order.query';
import { GetTradeQuery } from '../../../application/queries/get-trade.query';
import { ListListingsQuery } from '../../../application/queries/list-listings.query';
import { ListOrdersQuery } from '../../../application/queries/list-orders.query';
import { ListTradesQuery } from '../../../application/queries/list-trades.query';

@ApiTags('marketplace')
@Controller()
export class MarketplaceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('listings')
  @ApiOperation({ summary: 'Publish a listing' })
  publishListing(@Body() dto: PublishListingDto) {
    return this.commandBus.execute(new PublishListingCommand(dto));
  }

  @Get('listings')
  @ApiOperation({ summary: 'List listings' })
  listListings(@Query('productId') productId?: string, @Query('activeOnly') activeOnly?: string) {
    return this.queryBus.execute(new ListListingsQuery(productId, activeOnly === 'true'));
  }

  @Get('listings/:id')
  @ApiOperation({ summary: 'Get a listing by id' })
  getListing(@Param('id') id: string) {
    return this.queryBus.execute(new GetListingQuery(id));
  }

  @Post('listings/:id/suspend')
  @ApiOperation({ summary: 'Suspend a listing' })
  suspendListing(@Param('id') id: string, @Body() dto: SuspendListingDto) {
    return this.commandBus.execute(new SuspendListingCommand(id, dto));
  }

  @Post('listings/:id/delist')
  @ApiOperation({ summary: 'Delist a listing' })
  delistListing(@Param('id') id: string, @Body() dto: DelistListingDto) {
    return this.commandBus.execute(new DelistListingCommand(id, dto));
  }

  @Get('listings/:id/book')
  @ApiOperation({ summary: 'Get the order book for a listing' })
  getOrderBook(@Param('id') id: string) {
    return this.queryBus.execute(new GetOrderBookQuery(id));
  }

  @Post('orders')
  @ApiOperation({ summary: 'Place an order' })
  placeOrder(@Body() dto: PlaceOrderDto) {
    return this.commandBus.execute(new PlaceOrderCommand(dto));
  }

  @Get('orders')
  @ApiOperation({ summary: 'List orders' })
  listOrders(@Query('listingId') listingId?: string, @Query('investorId') investorId?: string) {
    return this.queryBus.execute(new ListOrdersQuery(listingId, investorId));
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get an order by id' })
  getOrder(@Param('id') id: string) {
    return this.queryBus.execute(new GetOrderQuery(id));
  }

  @Post('orders/:id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  cancelOrder(@Param('id') id: string, @Body() dto: CancelOrderDto) {
    void dto;
    return this.commandBus.execute(new CancelOrderCommand(id));
  }

  @Post('orders/:id/execute')
  @ApiOperation({ summary: 'Execute an order against the order book' })
  executeOrder(@Param('id') id: string) {
    return this.commandBus.execute(new ExecuteTradeCommand(id));
  }

  @Get('trades')
  @ApiOperation({ summary: 'List trades' })
  listTrades(@Query('listingId') listingId?: string) {
    return this.queryBus.execute(new ListTradesQuery(listingId));
  }

  @Get('trades/:id')
  @ApiOperation({ summary: 'Get a trade by id' })
  getTrade(@Param('id') id: string) {
    return this.queryBus.execute(new GetTradeQuery(id));
  }
}
