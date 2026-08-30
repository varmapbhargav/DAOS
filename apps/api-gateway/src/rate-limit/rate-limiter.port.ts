export const RATE_LIMITER = 'RATE_LIMITER';

export interface RateLimiter {
  allow(key: string): Promise<boolean>;
}
