import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class IdentityHttpClient {
  private readonly baseUrl = process.env.IDENTITY_URL ?? 'http://localhost:3001';

  async getJson<T>(path: string, authorization?: string): Promise<T> {
    const headers: Record<string, string> = {};
    if (authorization) headers.authorization = authorization;
    const response = await fetch(`${this.baseUrl}${path}`, { headers });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      throw new HttpException(payload.message ?? 'Upstream error', response.status);
    }
    return (await response.json()) as T;
  }
}
