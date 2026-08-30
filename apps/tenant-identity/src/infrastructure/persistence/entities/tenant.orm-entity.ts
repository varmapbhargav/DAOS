import { TenantScopedEntity } from '@daos/shared-kernel/infrastructure';
import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'tenants', schema: 'tenant_identity' })
export class TenantOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'subdomain', type: 'text' })
  subdomain!: string;

  @Column({ name: 'name', type: 'text' })
  name!: string;

  @Column({ name: 'status', type: 'text', default: 'provisioning' })
  status!: string;

  @Column({ name: 'white_label', type: 'jsonb', default: '{}' })
  whiteLabel!: object;

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
