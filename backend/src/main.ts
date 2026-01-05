import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Sequelize } from 'sequelize-typescript';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import serverless from 'serverless-http';

let cachedApp: any;
let cachedHandler: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  const configService = app.get(ConfigService);
  // Default: production frontend domain - fallback if env var not set
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || 'https://chatbot-builder-virid.vercel.app';
  
  // Support multiple origins (comma-separated) or single origin
  const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());
  
  console.log('🌐 CORS Origins:', allowedOrigins);
  
  // Global CORS middleware - MUST be first middleware
  app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    
    // Always set CORS headers
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else if (origin) {
      // For debugging - log unallowed origins
      console.log('⚠️ Blocked origin:', origin);
      console.log('✅ Allowed origins:', allowedOrigins);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Handle preflight OPTIONS requests - MUST return early
    if (req.method === 'OPTIONS') {
      return res.status(204).send();
    }
    
    next();
  });

  // Also enable CORS using NestJS built-in (backup)
  app.enableCors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Explicit body parsers
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  const sequelize = app.get(Sequelize);
  await sequelize.sync({ alter: true });

  await app.init();
  return app;
}

async function getApp() {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  return cachedApp;
}

// For Vercel serverless
export const handler = async (event: any, context: any) => {
  if (!cachedHandler) {
    const app = await getApp();
    const expressApp = app.getHttpAdapter().getInstance();
    cachedHandler = serverless(expressApp);
  }
  return cachedHandler(event, context);
};

// For local development
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  bootstrap().then(async (app) => {
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 4000;
    await app.listen(port);
    console.log(`Backend server is running on port ${port}`);
    console.log(`API Base URL: http://localhost:${port}/api/v1`);
  });
}
