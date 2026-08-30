import { CorporateDocType, ESignatureProvider, Signatory } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StubDocuSignAdapter implements ESignatureProvider {
  async sendForSignature(params: {
    docType: CorporateDocType;
    fileRef: string;
    signatories: Signatory[];
  }): Promise<{ envelopeRef: string; status: string }> {
    return { envelopeRef: `env-${Date.now()}-${Math.floor(Math.random() * 100000)}`, status: 'sent' };
  }

  async getSignatureStatus(envelopeRef: string): Promise<{ status: string; signatories: Signatory[] }> {
    return { status: 'sent', signatories: [] };
  }
}
