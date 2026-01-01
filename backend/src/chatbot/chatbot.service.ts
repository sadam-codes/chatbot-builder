import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ChatHistory } from '../models/chat-history.model';
import { Agent } from '../models/agent.model';
import OpenAI from 'openai';

@Injectable()
export class ChatbotService {
  private openai: OpenAI;

  constructor(
    @InjectModel(ChatHistory) private chatHistoryModel: typeof ChatHistory,
    @InjectModel(Agent) private agentModel: typeof Agent,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  // ------------------ Agent Management ------------------
  async createAgent(userId: number, data: { name: string; model: string; role: string; instructions: string }) {
    return this.agentModel.create({
      ...data,
      userId,
    });
  }

  async getAgents(userId: number) {
    return this.agentModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  async getAgent(agentId: string, userId: number) {
    const agent = await this.agentModel.findOne({
      where: { id: agentId, userId },
    });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  async deleteAgent(agentId: string, userId: number) {
    const agent = await this.getAgent(agentId, userId);
    await agent.destroy();
    return { message: 'Agent deleted successfully' };
  }

  // ------------------ Query Chat with OpenAI API ------------------
  async queryChat(userId: number, agentId: string, question: string) {
    // 1. Get agent configuration
    const agent = await this.getAgent(agentId, userId);
    
    // 2. Build system prompt from agent role and instructions
    const systemPrompt = `You are ${agent.role}. ${agent.instructions}`;

    // 3. Fetch recent chat history for this agent
    const chatHistory = await this.chatHistoryModel.findAll({
      where: { userId, agentId },
      order: [['createdAt', 'ASC']],
    });
    const recentHistory = chatHistory.slice(-10);
    const historyMessages = recentHistory.flatMap((h) => [
      { role: 'user' as const, content: h.question },
      { role: 'assistant' as const, content: h.answer },
    ]);

    // 4. Build messages array
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...historyMessages,
      { role: 'user' as const, content: question },
    ];

    // 5. Call OpenAI Chat API with agent's selected model
    try {
      const completion = await this.openai.chat.completions.create({
        model: agent.model,
        messages: messages,
        max_tokens: 1000,
      });

      const answer = completion.choices?.[0]?.message?.content || 'No answer found';

      // 6. Save chat history with agentId
      await this.chatHistoryModel.create({ userId, agentId, question, answer });

      return { question, answer };
    } catch (err: any) {
      console.error('OpenAI API Error:', err.message || err);
      return {
        question,
        answer:
          'The AI service is currently unavailable. Please try again later.',
      };
    }
  }

  async getChatHistory(userId: number, agentId: string) {
    return this.chatHistoryModel.findAll({
      where: { userId, agentId },
      order: [['createdAt', 'DESC']],
    });
  }

  async clearChatHistory(userId: number, agentId: string) {
    await this.chatHistoryModel.destroy({ where: { userId, agentId } });
    return { message: 'Chat history cleared successfully' };
  }
}
