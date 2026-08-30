import { createHash, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiKeyService {
  generate(ttlDays: number | null): { rawKey: string; keyHash: string; prefix: string; expiresAt: string | null } {
    const raw = `org_${randomBytes(24).toString('hex')}`;
    const keyHash = this.hash(raw);
    const prefix = raw.slice(0, 12);
    const expiresAt = ttlDays !== null ? new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString() : null;
    return { rawKey: raw, keyHash, prefix, expiresAt };
  }

  hash(rawKey: string): string {
    return createHash('sha256').update(rawKey).digest('hex');
  }

  verify(rawKey: string, keyHash: string): boolean {
    return this.hash(rawKey) === keyHash;
  }
}
