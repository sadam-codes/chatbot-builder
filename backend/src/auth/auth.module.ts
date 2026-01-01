import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../models/user.model';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { SupabaseModule } from 'src/supabase.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    SupabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), 
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'sadam@1234',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], 
  exports: [AuthService],
})
export class AuthModule {}
