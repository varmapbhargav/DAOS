import {
  AggregateRoot,
  Benchmark,
  FeeStructure,
  InvestmentProductId,
  InvestmentRestriction,
  LiquidityTerms,
  ProductStatus,
  ProductStrategy,
  ProductType,
  TenantId,
} from '@daos/shared-kernel';

import { FeeStructureApproved } from '../events/fee-structure-approved.event';
import { ProductApproved } from '../events/product-approved.event';
import { ProductClosed } from '../events/product-closed.event';
import { ProductDesigned } from '../events/product-designed.event';

export class InvestmentProduct extends AggregateRoot {
  private constructor(
    public readonly id: InvestmentProductId,
    public readonly tenantId: TenantId,
    private _name: string,
    private _productType: ProductType,
    private _strategy: ProductStrategy,
    private _benchmark: Benchmark | null,
    private _liquidityTerms: LiquidityTerms,
    private _feeStructure: FeeStructure,
    private _status: ProductStatus,
    private _shareClassIds: string[],
    private _approvedBy: string | null,
    private _rejectionReason: string | null,
  ) {
    super();
  }

  static design(params: {
    tenantId: TenantId;
    name: string;
    productType: ProductType;
    strategy: ProductStrategy;
    benchmark?: Benchmark | null;
    liquidityTerms: LiquidityTerms;
    feeStructure: FeeStructure;
    investmentRestrictions?: InvestmentRestriction[];
  }): InvestmentProduct {
    if (!params.name.trim()) throw new Error('Product name is required');
    const product = new InvestmentProduct(
      InvestmentProductId.create(),
      params.tenantId,
      params.name.trim(),
      params.productType,
      params.strategy,
      params.benchmark ?? null,
      params.liquidityTerms,
      params.feeStructure,
      'design',
      [],
      null,
      null,
    );
    product.raise(new ProductDesigned(product.id.value, product.tenantId.value, product._productType));
    product.incrementVersion();
    return product;
  }

  static reconstruct(params: {
    id: InvestmentProductId;
    tenantId: TenantId;
    name: string;
    productType: ProductType;
    strategy: ProductStrategy;
    benchmark: Benchmark | null;
    liquidityTerms: LiquidityTerms;
    feeStructure: FeeStructure;
    status: ProductStatus;
    shareClassIds: string[];
    approvedBy: string | null;
    rejectionReason: string | null;
    version: number;
  }): InvestmentProduct {
    const product = new InvestmentProduct(
      params.id,
      params.tenantId,
      params.name,
      params.productType,
      params.strategy,
      params.benchmark,
      params.liquidityTerms,
      params.feeStructure,
      params.status,
      params.shareClassIds,
      params.approvedBy,
      params.rejectionReason,
    );
    product._version = params.version;
    return product;
  }

  get name(): string {
    return this._name;
  }

  get productType(): ProductType {
    return this._productType;
  }

  get strategy(): ProductStrategy {
    return this._strategy;
  }

  get benchmark(): Benchmark | null {
    return this._benchmark;
  }

  get liquidityTerms(): LiquidityTerms {
    return this._liquidityTerms;
  }

  get feeStructure(): FeeStructure {
    return this._feeStructure;
  }

  get status(): ProductStatus {
    return this._status;
  }

  get shareClassIds(): string[] {
    return [...this._shareClassIds];
  }

  get approvedBy(): string | null {
    return this._approvedBy;
  }

  get rejectionReason(): string | null {
    return this._rejectionReason;
  }

  addShareClass(shareClassId: string): void {
    if (this._status === 'active') throw new Error('Active products cannot add share classes');
    if (this._status === 'closed') throw new Error('Closed products cannot add share classes');
    if (this._shareClassIds.includes(shareClassId)) throw new Error('Share class already added');
    this._shareClassIds.push(shareClassId);
    this.incrementVersion();
  }

  approveFeeStructure(): void {
    if (this._status === 'active') throw new Error('Fee structure already approved');
    if (this._status === 'closed') throw new Error('Closed products cannot approve fee structure');
    this.raise(
      new FeeStructureApproved(
        this.id.value,
        this.tenantId.value,
        this._feeStructure.managementFeeAnnual,
        this._feeStructure.performanceFee,
      ),
    );
    this.incrementVersion();
  }

  submitForApproval(): void {
    if (this._status !== 'design') throw new Error(`Only designed products can be submitted, was: ${this._status}`);
    this._status = 'internalReview';
    this.incrementVersion();
  }

  approve(approvedBy: string): void {
    if (this._status === 'active') throw new Error('Product is already active');
    if (this._status === 'closed') throw new Error('Closed products cannot be approved');
    if (this._status !== 'internalReview' && this._status !== 'complianceApproval' && this._status !== 'boardApproval') {
      throw new Error(`Product must be submitted for approval before it can be approved, was: ${this._status}`);
    }
    this._status = 'active';
    this._approvedBy = approvedBy;
    this.raise(new ProductApproved(this.id.value, this.tenantId.value, approvedBy));
    this.incrementVersion();
  }

  close(): void {
    if (this._status === 'closed') throw new Error('Product is already closed');
    if (this._status === 'design') throw new Error('Designed products cannot be closed');
    this._status = 'closed';
    this.raise(new ProductClosed(this.id.value, this.tenantId.value));
    this.incrementVersion();
  }

  reject(reason: string): void {
    if (this._status === 'active') throw new Error('Active products cannot be rejected');
    if (this._status === 'closed') throw new Error('Closed products cannot be rejected');
    if (this._status === 'design') throw new Error('Designed products cannot be rejected');
    this._status = 'design';
    this._rejectionReason = reason;
    this.incrementVersion();
  }

  updateFeeStructure(feeStructure: FeeStructure): void {
    if (this._status === 'active') throw new Error('Active products cannot change fee structure');
    this._feeStructure = feeStructure;
    this.incrementVersion();
  }
}
