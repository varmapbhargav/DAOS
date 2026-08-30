import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'users', schema: 'tenant_identity' })
export class UserOrmEntity {
  @Column('uuid', { primary: true })
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'email', type: 'text' })
  email!: string;

  @Column({ name: 'status', type: 'text', default: 'active' })
  status!: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash!: string;

  @Column({ name: 'role_ids', type: 'jsonb', default: '[]' })
  roleIds!: string[];

  @Column({ name: 'version', type: 'integer', default: 0 })
  version!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
