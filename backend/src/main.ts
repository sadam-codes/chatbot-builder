import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Sequelize } from 'sequelize-typescript';
import * as bodyParser from 'body-parser';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';

let cachedApp: any;
let cachedHandler: any;

async function createApp() {
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  
  const app = await NestFactory.create(AppModule, adapter);
  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: [
      'https://chatbot-builder-virid.vercel.app',
      'http://localhost:5173', // Local development
    ],
    credentials: true,
  });

  // Explicit body parsers
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  const sequelize = app.get(Sequelize);
  await sequelize.sync({ alter: true });

  await app.init();
  return expressApp;
}

// Export handler for Vercel
export const handler = async (event: any, context: any) => {
  if (!cachedApp) {
    cachedApp = await createApp();
    cachedHandler = serverless(cachedApp);
  }
  return cachedHandler(event, context);
};

// For local development
if (require.main === module) {
  createApp().then(async (expressApp) => {
    expressApp.listen(4000, () => {
      console.log('Application is running on: http://localhost:4000');
    });
  });
}
