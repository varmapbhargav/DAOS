import { InteractionDirection, InteractionId, InteractionType, TenantId } from '@daos/shared-kernel';

import { Interaction } from '../../../domain/entities/interaction.entity';
import { InteractionOrmEntity } from '../entities/interaction.orm-entity';

export class InteractionMapper {
  static toOrm(interaction: Interaction): InteractionOrmEntity {
    const orm = new InteractionOrmEntity();
    orm.id = interaction.id.value;
    orm.tenantId = interaction.tenantId.value;
    orm.caseId = interaction.caseId;
    orm.assetId = interaction.assetId;
    orm.counterpartyId = interaction.counterpartyId;
    orm.type = interaction.type;
    orm.direction = interaction.direction;
    orm.subject = interaction.subject;
    orm.body = interaction.body;
    orm.participants = interaction.participants;
    orm.occurredAt = interaction.occurredAt;
    orm.recordedBy = interaction.recordedBy;
    orm.recordedAt = interaction.recordedAt;
    orm.metadata = interaction.metadata;
    orm.updatedAt = new Date();
    return orm;
  }

  static toDomain(orm: InteractionOrmEntity): Interaction {
    return Interaction.reconstruct({
      id: InteractionId.create(orm.id),
      tenantId: TenantId.create(orm.tenantId),
      caseId: orm.caseId,
      assetId: orm.assetId,
      counterpartyId: orm.counterpartyId,
      type: orm.type as InteractionType,
      direction: orm.direction as InteractionDirection,
      subject: orm.subject,
      body: orm.body,
      participants: orm.participants,
      occurredAt: orm.occurredAt,
      recordedBy: orm.recordedBy,
      recordedAt: orm.recordedAt,
      metadata: orm.metadata,
    });
  }
}