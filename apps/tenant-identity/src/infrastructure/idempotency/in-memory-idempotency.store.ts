import { IdempotencyStore } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly seenKeys = new Set<string>();

  async seen(key: string): Promise<boolean> {
    return this.seenKeys.has(key);
  }

  async mark(key: string): Promise<void> {
    this.seenKeys.add(key);
  }
}
