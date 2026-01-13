import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Sequelize } from 'sequelize-typescript';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  try {
    const sequelize = app.get(Sequelize);
    await sequelize.authenticate();
    console.log('DB connected');
  } catch (e) {
    console.log('DB skipped');
  }

  await app.listen(5000);
  console.log('Server running on http://localhost:5000');
}

bootstrap();
