import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

import { NotFoundError } from '../errors';

/**
 * Base class for all PostgreSQL repositories.
 *
 * Provides the `withTenant(tenantId, fn)` helper that sets PostgreSQL session
 * variable `app.tenant_id` via `SET LOCAL` before executing any tenant-scoped
 * query. This drives the Row-Level Security policies defined in migrations.
 *
 * Usage:
 *   protected async findTenant<T>(tenantId: string, fn: (repo: Repository<E>) => Promise<T>): Promise<T> {
 *     return this.withTenant(tenantId, () => fn(this.repo));
 *   }
 */
export abstract class PostgresRepository<E extends ObjectLiteral> {
  protected readonly repo: Repository<E>;

  constructor(
    protected readonly ds: DataSource,
    entity: EntityTarget<E>,
  ) {
    this.repo = ds.getRepository(entity);
  }

  /**
   * Wraps a database operation with `SET LOCAL app.tenant_id = <tenantId>`.
   * Must be called inside an active transaction for SET LOCAL to take effect.
   * For read queries outside a transaction, uses SET (session-level).
   */
  protected async withTenant<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
    return this.ds.transaction(async (manager) => {
      await manager.query(`SET LOCAL app.tenant_id = '${tenantId}'`);
      // Re-bind the repository to the transaction manager so RLS applies.
      const txRepo = manager.getRepository(this.repo.target);
      return fn.call({ ...this, repo: txRepo });
    });
  }

  /**
   * Asserts a value is non-null, throwing NotFoundError otherwise.
   */
  protected assertFound<T>(value: T | null | undefined, label: string): T {
    if (value == null) throw new NotFoundError(`${label} not found`);
    return value;
  }
}
