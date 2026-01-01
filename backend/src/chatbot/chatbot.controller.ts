import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  UnauthorizedException,
  Delete,
  Param,
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { JwtService } from '@nestjs/jwt';

@Controller('chatbot')
export class ChatbotController {
  constructor(
    private chatbotService: ChatbotService,
    private jwtService: JwtService,
  ) {}

  private getUserIdFromToken(authHeader: string): number {
    if (!authHeader) throw new UnauthorizedException('No auth token provided');

    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('Invalid auth header');

    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const userId = payload.sub;
    if (!userId)
      throw new UnauthorizedException('Token does not contain user ID');

    return userId;
  }

  // ------------------ AGENT MANAGEMENT ------------------
  @Post('agents')
  async createAgent(
    @Headers('authorization') authHeader: string,
    @Body() body: { name: string; model: string; role: string; instructions: string },
  ) {
    const userId = this.getUserIdFromToken(authHeader);
    return this.chatbotService.createAgent(userId, body);
  }

  @Get('agents')
  async getAgents(@Headers('authorization') authHeader: string) {
    const userId = this.getUserIdFromToken(authHeader);
    return this.chatbotService.getAgents(userId);
  }

  @Get('agents/:id')
  async getAgent(
    @Headers('authorization') authHeader: string,
    @Param('id') agentId: string,
  ) {
    const userId = this.getUserIdFromToken(authHeader);
    return this.chatbotService.getAgent(agentId, userId);
  }

  @Delete('agents/:id')
  async deleteAgent(
    @Headers('authorization') authHeader: string,
    @Param('id') agentId: string,
  ) {
    const userId = this.getUserIdFromToken(authHeader);
    return this.chatbotService.deleteAgent(agentId, userId);
  }

  // ------------------ QUERY ------------------
  @Post('query')
  async queryChat(
    @Headers('authorization') authHeader: string,
    @Body('agentId') agentId: string,
    @Body('question') question: string,
  ) {
    const userId = this.getUserIdFromToken(authHeader);
    return this.chatbotService.queryChat(userId, agentId, question);
  }

  // ------------------ HISTORY ------------------
  @Get('history/:agentId')
  async getChatHistory(
    @Headers('authorization') authHeader: string,
    @Param('agentId') agentId: string,
  ) {
    const userId = this.getUserIdFromToken(authHeader);
    return this.chatbotService.getChatHistory(userId, agentId);
  }

  @Delete('history/:agentId')
  async clearChatHistory(
    @Headers('authorization') authHeader: string,
    @Param('agentId') agentId: string,
  ) {
    const userId = this.getUserIdFromToken(authHeader);
    return this.chatbotService.clearChatHistory(userId, agentId);
  }
}
  