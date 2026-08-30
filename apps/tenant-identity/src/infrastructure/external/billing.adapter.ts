import { Injectable, Logger } from '@nestjs/common';

export interface BillingAdapter {
  notifyTenantProvisioned(tenantId: string): Promise<void>;
}

@Injectable()
export class StubBillingAdapter implements BillingAdapter {
  private readonly logger = new Logger(StubBillingAdapter.name);

  async notifyTenantProvisioned(tenantId: string): Promise<void> {
    this.logger.log(`[billing-stub] tenant provisioned: ${tenantId}`);
  }
}
