import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  UnauthorizedException,
  Param,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatbotService } from './chatbot.service';
import { JwtService } from '@nestjs/jwt';
import { Response as ExpressResponse } from 'express';
import { Res } from '@nestjs/common';

@Controller('chatbot')
export class ChatbotController {
  constructor(
    private chatbotService: ChatbotService,
    private jwtService: JwtService,
  ) { }

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

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('audio'))
  async transcribe(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }
    const text = await this.chatbotService.transcribeAudio(file);
    return { text };
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

  // ------------------ VOICE QUERY ------------------
  @Post('voice-query')
  @UseInterceptors(FileInterceptor('audio'))
  async voiceQuery(
    @Headers('authorization') authHeader: string,
    @Body('agentId') agentId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = this.getUserIdFromToken(authHeader);
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }
    if (!agentId) {
      throw new BadRequestException('Agent ID is required');
    }
    return this.chatbotService.voiceQuery(userId, agentId, file);
  }

  // ------------------ STREAM QUERY ------------------
  @Post('stream-query')
  async streamChat(
    @Headers('authorization') authHeader: string,
    @Body('agentId') agentId: string,
    @Body('question') question: string,
    @Res() res: ExpressResponse,
  ) {
    const userId = this.getUserIdFromToken(authHeader);

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const { stream, saveData } = await this.chatbotService.streamQuery(userId, agentId, question);

      let fullAnswer = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullAnswer += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Save history after stream finishes
      await saveData(fullAnswer);

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err) {
      console.error('Streaming Error:', err);
      res.status(500).write(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`);
      res.end();
    }
  }

  // ------------------ TTS ------------------
  @Post('tts')
  async generateTTS(
    @Body('text') text: string,
    @Res() res: ExpressResponse,
  ) {
    if (!text) {
      throw new BadRequestException('Text is required');
    }
    try {
      const buffer = await this.chatbotService.generateSpeech(text);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(buffer);
    } catch (err) {
      console.error('TTS Error:', err);
      res.status(500).send('Failed to generate speech');
    }
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

  // ------------------ PUBLIC API (No Authentication Required) ------------------
  @Post('public/chat/:agentId')
  async publicChat(
    @Param('agentId') agentId: string,
    @Body('question') question: string,
  ) {
    if (!question || !question.trim()) {
      throw new BadRequestException('Question is required');
    }
    return this.chatbotService.publicQueryChat(agentId, question);
  }
}
