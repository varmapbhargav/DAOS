import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';

import {
  AccessTokenClaims,
  IdentityProvider,
  IssuedTokens,
  RefreshTokenClaims,
} from '../../domain/ports/identity-provider.port';

@Injectable()
export class JwtIdentityAdapter implements IdentityProvider {
  private readonly secret: string;
  private readonly accessTtlSeconds: number;
  private readonly refreshTtlSeconds: number;

  constructor(config: ConfigService) {
    this.secret = config.get<string>('JWT_SECRET') ?? 'dev-secret-change-me';
    this.accessTtlSeconds = Number(config.get<string>('JWT_ACCESS_TTL_SECONDS') ?? 900);
    this.refreshTtlSeconds = Number(config.get<string>('JWT_REFRESH_TTL_SECONDS') ?? 604800);
  }

  async hashPassword(plain: string): Promise<string> {
    return argon2.hash(plain);
  }

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  issueTokens(input: { userId: string; tenantId: string; roleIds: string[]; platform: boolean }): IssuedTokens {
    const access: AccessTokenClaims = {
      sub: input.userId,
      tenantId: input.tenantId,
      roleIds: input.roleIds,
      platform: input.platform,
      type: 'access',
      jti: randomUUID(),
    };
    const refresh: RefreshTokenClaims = {
      sub: input.userId,
      tenantId: input.tenantId,
      type: 'refresh',
      jti: randomUUID(),
    };
    return {
      accessToken: jwt.sign({ ...access }, this.secret, { expiresIn: this.accessTtlSeconds }),
      refreshToken: jwt.sign({ ...refresh }, this.secret, { expiresIn: this.refreshTtlSeconds }),
    };
  }

  verifyAccessToken(token: string): AccessTokenClaims | null {
    const claims = this.verify(token);
    return claims && claims.type === 'access' ? claims : null;
  }

  verifyRefreshToken(token: string): RefreshTokenClaims | null {
    const claims = this.verify(token);
    return claims && claims.type === 'refresh' ? claims : null;
  }

  private verify(token: string): (AccessTokenClaims | RefreshTokenClaims) | null {
    try {
      const decoded = jwt.verify(token, this.secret) as Record<string, unknown>;
      if (decoded.type === 'access' || decoded.type === 'refresh') {
        return decoded as unknown as AccessTokenClaims | RefreshTokenClaims;
      }
      return null;
    } catch {
      return null;
    }
  }
}
