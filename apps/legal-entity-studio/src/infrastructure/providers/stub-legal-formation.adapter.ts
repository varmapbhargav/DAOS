import { EntityType, LegalFormationProvider } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StubLegalFormationAdapter implements LegalFormationProvider {
  async formEntity(params: { entityType: EntityType; jurisdiction: string }): Promise<{ entityRef: string; type: EntityType }> {
    const entityRef = `formation-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    return { entityRef, type: params.entityType };
  }
}
