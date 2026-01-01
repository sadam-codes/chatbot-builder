import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { ChatHistory } from '../models/chat-history.model';
import { Agent } from '../models/agent.model';
import { AuthModule } from '../auth/auth.module'; 
@Module({
  imports: [
    AuthModule, 
    SequelizeModule.forFeature([ChatHistory, Agent]),
  ],
  providers: [ChatbotService],
  controllers: [ChatbotController],
  exports: [ChatbotService],
})
export class ChatbotModule {}
