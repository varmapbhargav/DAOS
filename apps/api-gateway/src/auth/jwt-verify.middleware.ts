import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtVerifyMiddleware implements NestMiddleware {
  private readonly secret = process.env.JWT_SECRET ?? 'dev-secret-change-me';

  use(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      res.status(401).json({ statusCode: 401, message: 'Missing bearer token' });
      return;
    }
    try {
      const claims = jwt.verify(token, this.secret) as { type?: string };
      if (claims.type !== 'access') {
        res.status(401).json({ statusCode: 401, message: 'Invalid token type' });
        return;
      }
      next();
    } catch {
      res.status(401).json({ statusCode: 401, message: 'Invalid or expired token' });
    }
  }
}
