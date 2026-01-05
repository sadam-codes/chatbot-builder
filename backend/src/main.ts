import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Sequelize } from 'sequelize-typescript';
import { ConfigService } from '@nestjs/config';
import serverless from 'serverless-http';

let cachedApp: any;
let cachedHandler: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  const configService = app.get(ConfigService);

  const corsOrigin =
    configService.get<string>('CORS_ORIGIN') ||
    'https://chatbot-builder-virid.vercel.app';

  const allowedOrigins = corsOrigin
    .split(',')
    .map(origin => origin.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const sequelize = app.get(Sequelize);

  // ⚠️ Never auto-sync DB in production on Vercel
  if (process.env.NODE_ENV !== 'production') {
    await sequelize.sync({ alter: true });
  }

  await app.init();
  return app;
}

async function getApp() {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  return cachedApp;
}

async function createHandler() {
  if (!cachedHandler) {
    const app = await getApp();
    const expressApp = app.getHttpAdapter().getInstance();
    cachedHandler = serverless(expressApp);
  }
  return cachedHandler;
}

const handler = async (event: any, context: any) => {
  const server = await createHandler();
  return server(event, context);
};

export default handler;
export { handler };
