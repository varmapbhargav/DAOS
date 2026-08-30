export interface AccessTokenClaims {
  sub: string;
  tenantId: string;
  roleIds: string[];
  platform: boolean;
  type: 'access';
  jti: string;
}

export interface RefreshTokenClaims {
  sub: string;
  tenantId: string;
  type: 'refresh';
  jti: string;
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IdentityProvider {
  hashPassword(plain: string): Promise<string>;
  verifyPassword(plain: string, hash: string): Promise<boolean>;
  issueTokens(input: { userId: string; tenantId: string; roleIds: string[]; platform: boolean }): IssuedTokens;
  verifyAccessToken(token: string): AccessTokenClaims | null;
  verifyRefreshToken(token: string): RefreshTokenClaims | null;
}
