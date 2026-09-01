import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'sponsor_references' })
export class SponsorReferenceOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'entity_id', type: 'uuid' })
  entityId!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'name', type: 'text' })
  name!: string;

  @Column({ name: 'jurisdiction', type: 'text' })
  jurisdiction!: string;

  @Column({ name: 'relationship_status', type: 'text' })
  relationshipStatus!: string;

  @Column({ name: 'risk_rating', type: 'text' })
  riskRating!: string;

  @Column({ name: 'verification_status', type: 'text' })
  verificationStatus!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}