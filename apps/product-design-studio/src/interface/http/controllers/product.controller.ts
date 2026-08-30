import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AddShareClassCommand } from '../../../application/commands/add-share-class.command';
import { ApproveProductCommand } from '../../../application/commands/approve-product.command';
import { CloseProductCommand } from '../../../application/commands/close-product.command';
import { DesignProductCommand } from '../../../application/commands/design-product.command';
import { SubmitProductForApprovalCommand } from '../../../application/commands/submit-product-for-approval.command';
import { UpdateFeeStructureCommand } from '../../../application/commands/update-fee-structure.command';
import { DesignProductDto } from '../../../application/dto/design-product.dto';
import {
  AddShareClassDto,
  ApproveProductDto,
  UpdateFeeStructureDto,
} from '../../../application/dto/product-action.dto';
import { CalculateFeeProjectionQuery } from '../../../application/queries/calculate-fee-projection.query';
import { GetProductQuery } from '../../../application/queries/get-product.query';
import { ListProductsQuery } from '../../../application/queries/list-products.query';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Design a new investment product' })
  design(@Body() dto: DesignProductDto) {
    return this.commandBus.execute(new DesignProductCommand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'List investment products (optionally by product type)' })
  list(@Query('productType') productType?: string) {
    return this.queryBus.execute(new ListProductsQuery(productType));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an investment product by id' })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetProductQuery(id));
  }

  @Post(':id/share-classes')
  @ApiOperation({ summary: 'Add a share class to a product' })
  addShareClass(@Param('id') id: string, @Body() dto: AddShareClassDto) {
    return this.commandBus.execute(new AddShareClassCommand(id, dto));
  }

  @Post(':id/fee-structure')
  @ApiOperation({ summary: 'Update and approve the fee structure of a product' })
  updateFeeStructure(@Param('id') id: string, @Body() dto: UpdateFeeStructureDto) {
    return this.commandBus.execute(new UpdateFeeStructureCommand(id, dto));
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit a product for approval' })
  submit(@Param('id') id: string) {
    return this.commandBus.execute(new SubmitProductForApprovalCommand(id));
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a product' })
  approve(@Param('id') id: string, @Body() dto: ApproveProductDto) {
    return this.commandBus.execute(new ApproveProductCommand(id, dto.approvedBy));
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close a product' })
  close(@Param('id') id: string) {
    return this.commandBus.execute(new CloseProductCommand(id));
  }

  @Get(':id/fee-projection')
  @ApiOperation({ summary: 'Calculate a fee projection for a product' })
  feeProjection(
    @Param('id') id: string,
    @Query('grossAmountMinorUnits') grossAmountMinorUnits: string,
    @Query('currency') currency: string,
  ) {
    return this.queryBus.execute(new CalculateFeeProjectionQuery(id, grossAmountMinorUnits, currency));
  }
}
