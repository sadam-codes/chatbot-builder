import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './models/user.model';
import { ChatbotModule } from './chatbot/chatbot.module';
import { ChatHistory } from './models/chat-history.model';
import { Agent } from './models/agent.model';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Try Supabase connection pooler first (recommended for ORMs)
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        let supabaseDbPassword = configService.get<string>('SUPABASE_DB_PASSWORD');
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        // If SUPABASE_DB_PASSWORD not provided, try to extract from DATABASE_URL
        if (!supabaseDbPassword && databaseUrl) {
          try {
            const url = new URL(databaseUrl);
            supabaseDbPassword = decodeURIComponent(url.password); // Decode URL-encoded password
          } catch (e) {
            // Ignore if DATABASE_URL parsing fails
          }
        }
        
        let connectionConfig: any;

        if (databaseUrl) {
          // Use DATABASE_URL directly (most reliable)
          let url: URL;
          try {
            url = new URL(databaseUrl);
          } catch (error) {
            throw new Error(`Invalid DATABASE_URL format: ${error.message}. Expected format: postgresql://user:password@host:port/database`);
          }
          
          console.log(`🔌 Connecting to database: ${url.hostname}:${url.port || 5432}/${url.pathname.slice(1)}`);
          
          connectionConfig = {
            dialect: 'postgres' as const,
            host: url.hostname,
            port: Number(url.port || 5432),
            username: url.username,
            password: decodeURIComponent(url.password), // Decode URL-encoded password
            database: url.pathname.slice(1),
            autoLoadModels: true,
            synchronize: true,
            models: [User, ChatHistory, Agent],
            logging: false,
            retry: {
              max: 1,
            },
            dialectOptions: {
              connectTimeout: 5000,
              ssl: url.hostname.includes('supabase') ? {
                require: true,
                rejectUnauthorized: false,
              } : undefined,
            },
            pool: {
              max: 5,
              min: 0,
              acquire: 30000,
              idle: 10000,
            },
          };
        } else if (supabaseUrl && supabaseDbPassword) {
          // Fallback: Try Supabase connection pooler (port 6543)
          // Extract project ref from Supabase URL: https://xxxxx.supabase.co
          const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
          // Try different pooler hostname formats
          const poolerHosts = [
            `aws-0-${projectRef}.pooler.supabase.com`,
            `${projectRef}.pooler.supabase.com`,
          ];
          
          console.log(`🔌 Attempting Supabase pooler connection...`);
          console.log(`   Project: ${projectRef}`);
          console.log(`   Username: postgres.${projectRef}`);
          
          connectionConfig = {
            dialect: 'postgres' as const,
            host: poolerHosts[0], // Try first format
            port: 6543,
            username: `postgres.${projectRef}`,
            password: supabaseDbPassword,
            database: 'postgres',
            autoLoadModels: true,
            synchronize: true,
            models: [User, ChatHistory, Agent],
            logging: false,
            dialectOptions: {
              ssl: {
                require: true,
                rejectUnauthorized: false,
              },
            },
            retry: {
              max: 1,
            },
            pool: {
              max: 5,
              min: 0,
              acquire: 30000,
              idle: 10000,
            },
          };
        } else {
          throw new Error('Either SUPABASE_URL + SUPABASE_DB_PASSWORD or DATABASE_URL environment variable is required');
        }

        return connectionConfig;
      },
    }),
    ChatbotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
