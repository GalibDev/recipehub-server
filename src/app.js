import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { toNodeHandler } from 'better-auth/node';
import { connectDatabase } from './config/db.js';
import { createBetterAuth } from './config/better-auth.js';
import { corsOrigins, env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFound } from './middleware/not-found.middleware.js';
import apiRoutes from './routes/index.js';

export async function createApp() {
  await connectDatabase();

  const betterAuth = createBetterAuth();
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(morgan('dev'));

  app.use(
    '/api/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.use((req, res, next) => {
    req.betterAuth = betterAuth;
    next();
  });

  app.all('/api/auth/better/*splat', toNodeHandler(betterAuth));
  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api', apiRoutes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
