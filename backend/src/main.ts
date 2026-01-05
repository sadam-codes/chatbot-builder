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
  // Default: production frontend domain
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || 'https://chatbot-builder-virid.vercel.app';
  
  // Support multiple origins (comma-separated) or single origin
  const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Explicit body parsers
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Add CORS middleware specifically for public API endpoints
  app.use((req: any, res: any, next: any) => {
    // Check if this is a public API endpoint
    if (req.path && req.path.includes('/chatbot/public/')) {
      // Allow all origins for public API
      const origin = req.headers.origin;
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
    }
    next();
  });

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
