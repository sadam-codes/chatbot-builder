import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Sequelize } from 'sequelize-typescript';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: true, // Allow all origins for public API access
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Explicit body parsers
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  const sequelize = app.get(Sequelize);
  await sequelize.sync({ alter: true });

  await app.listen(5000);
}
bootstrap();
