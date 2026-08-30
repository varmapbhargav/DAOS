import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';

import { GatewayModule } from './gateway.module';

const SERVICES: Record<string, string> = {
  investors: process.env.INVESTOR_URL ?? 'http://localhost:3002',
  assets: process.env.ASSET_URL ?? 'localhost:3003',
  opportunities: process.env.OPPORTUNITY_URL ?? 'http://localhost:3004',
  deals: process.env.DEAL_URL ?? 'http://localhost:3005',
  entities: process.env.ENTITY_URL ?? 'http://localhost:3006',
  products: process.env.PRODUCT_URL ?? 'http://localhost:3007',
  issuances: process.env.ISSUANCE_URL ?? 'http://localhost:3008',
  subscriptions: process.env.DISTRIBUTION_URL ?? 'http://localhost:3009',
  'capital-calls': process.env.DISTRIBUTION_URL ?? 'http://localhost:3009',
  closings: process.env.DISTRIBUTION_URL ?? 'http://localhost:3009',
  listings: process.env.MARKETPLACE_URL ?? 'http://localhost:3010',
  orders: process.env.MARKETPLACE_URL ?? 'http://localhost:3010',
  trades: process.env.MARKETPLACE_URL ?? 'http://localhost:3010',
  settlements: process.env.SETTLEMENT_URL ?? 'http://localhost:3012',
  distributions: process.env.WATERFALL_URL ?? 'http://localhost:3011',
  corporateActions: process.env.WATERFALL_URL ?? 'http://localhost:3011',
  compliance: process.env.COMPLIANCE_URL ?? 'http://localhost:3013',
  reports: process.env.REPORTING_URL ?? 'http://localhost:3014',
  statements: process.env.REPORTING_URL ?? 'http://localhost:3014',
  documents: process.env.DOCUMENT_URL ?? 'http://localhost:3015',
  capTables: process.env.CAP_TABLE_URL ?? 'http://localhost:3021',
  notifications: process.env.NOTIFICATION_URL ?? 'http://localhost:3016',
  wallets: process.env.WALLET_URL ?? 'http://localhost:3017',
  prices: process.env.PRICING_URL ?? 'http://localhost:3018',
  valuations: process.env.PRICING_URL ?? 'http://localhost:3018',
  risks: process.env.RISK_URL ?? 'http://localhost:3019',
  proposals: process.env.GOVERNANCE_URL ?? 'http://localhost:3020',
  votes: process.env.GOVERNANCE_URL ?? 'http://localhost:3020',
  meetings: process.env.GOVERNANCE_URL ?? 'http://localhost:3020',
};

function proxyToIdentity(prefixes: string[]) {
  const baseUrl = process.env.IDENTITY_URL ?? 'http://localhost:3001';
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const isProxied = prefixes.some((p) => req.path === `/${p}` || req.path.startsWith(`/${p}/`));
    if (!isProxied) {
      next();
      return;
    }
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    const auth = req.headers.authorization;
    if (typeof auth === 'string') headers.authorization = auth;
    const body =
      req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE'
        ? undefined
        : JSON.stringify(req.body ?? {});
    try {
      const upstream = await fetch(`${baseUrl}${req.originalUrl}`, { method: req.method, headers, body });
      const text = await upstream.text();
      res.status(upstream.status);
      res.setHeader('content-type', 'application/json');
      res.send(text.length > 0 ? text : '{}');
    } catch {
      res.status(502).json({ statusCode: 502, message: 'Identity service unavailable' });
    }
  };
}

function proxyToService(prefixes: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    for (const prefix of prefixes) {
      if (req.path === `/${prefix}` || req.path.startsWith(`/${prefix}/`)) {
        const baseUrl = SERVICES[prefix];
        if (!baseUrl) {
          res.status(503).json({ statusCode: 503, message: `Service ${prefix} not configured` });
          return;
        }
        const headers: Record<string, string> = { 'content-type': 'application/json' };
        const auth = req.headers.authorization;
        if (typeof auth === 'string') headers.authorization = auth;
        const body =
          req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE'
            ? undefined
            : JSON.stringify(req.body ?? {});
        try {
          const upstream = await fetch(`${baseUrl}${req.originalUrl}`, { method: req.method, headers, body });
          const text = await upstream.text();
          res.status(upstream.status);
          res.setHeader('content-type', 'application/json');
          res.send(text.length > 0 ? text : '{}');
        } catch {
          res.status(502).json({ statusCode: 502, message: `Service ${prefix} unavailable` });
        }
        return;
      }
    }
    next();
  };
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(GatewayModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Passthrough proxy for identity routes not owned by the gateway itself.
  app.use(proxyToIdentity(['auth', 'tenants', 'users', 'roles']));

  // Proxy for all bounded-context services
  app.use(
    proxyToService([
      'investors',
      'assets',
      'opportunities',
      'deals',
      'entities',
      'products',
      'issuances',
      'subscriptions',
      'capital-calls',
      'closings',
      'listings',
      'orders',
      'trades',
      'settlements',
      'distributions',
      'corporateActions',
      'compliance',
      'reports',
      'statements',
      'documents',
      'cap-tables',
      'notifications',
      'wallets',
      'prices',
      'valuations',
      'risks',
      'proposals',
      'votes',
      'meetings',
    ]),
  );

  const config = new DocumentBuilder()
    .setTitle('DAOS API Gateway')
    .setDescription('Edge: tenant resolution, rate limiting, routing, composition')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.GATEWAY_PORT ?? 3000);
  await app.listen(port);
  console.log(`api-gateway listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();