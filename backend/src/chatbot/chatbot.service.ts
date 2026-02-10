import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
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

  // ------------------ Voice Features ------------------

  async transcribeAudio(file: Express.Multer.File): Promise<string> {
    const tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}_${file.originalname}`);
    fs.writeFileSync(tempFilePath, file.buffer);

    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
      });
      return transcription.text;
    } finally {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  }

  async generateSpeech(text: string): Promise<Buffer> {
    const mp3 = await this.openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer;
  }

  async voiceQuery(userId: number, agentId: string, audioFile: Express.Multer.File) {
    // 1. Transcribe the audio
    const question = await this.transcribeAudio(audioFile);
    if (!question || !question.trim()) {
      throw new BadRequestException('Could not transcribe audio');
    }

    // 2. Query the agent (reuse existing logic)
    const result = await this.queryChat(userId, agentId, question);

    // 3. Generate speech for the answer
    const audioBuffer = await this.generateSpeech(result.answer);

    return {
      ...result,
      audioBase64: audioBuffer.toString('base64'),
    };
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
    const systemPrompt = `You are ${agent.role}. 

${agent.instructions}

CRITICAL RULES:
- You MUST ONLY respond to requests that are directly related to your specific role and purpose as ${agent.role}.
- If a user asks you something outside your role (like general knowledge questions, math problems, history, etc.), you MUST politely decline and redirect them back to your purpose.
- You are NOT a general-purpose assistant. You are a specialized agent focused ONLY on: ${agent.role}.
- Always stay in character and within your defined role. Never answer questions that are unrelated to your purpose.
- If asked something outside your role, respond with: "I'm sorry, but I'm specifically designed to help with [your role]. I can only assist with matters related to that. How can I help you with [your role] instead?"`;

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

  // ------------------ Public Query Chat (No Authentication Required) ------------------
  async publicQueryChat(agentId: string, question: string) {
    // 1. Get agent configuration (no userId check for public access)
    const agent = await this.agentModel.findOne({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // 2. Build system prompt from agent role and instructions
    const systemPrompt = `You are ${agent.role}. 

${agent.instructions}

CRITICAL RULES:
- You MUST ONLY respond to requests that are directly related to your specific role and purpose as ${agent.role}.
- If a user asks you something outside your role (like general knowledge questions, math problems, history, etc.), you MUST politely decline and redirect them back to your purpose.
- You are NOT a general-purpose assistant. You are a specialized agent focused ONLY on: ${agent.role}.
- Always stay in character and within your defined role. Never answer questions that are unrelated to your purpose.
- If asked something outside your role, respond with: "I'm sorry, but I'm specifically designed to help with [your role]. I can only assist with matters related to that. How can I help you with [your role] instead?"`;

    // 3. Fetch recent chat history for this agent (public chats, userId = null or 0)
    const chatHistory = await this.chatHistoryModel.findAll({
      where: { agentId },
      order: [['createdAt', 'ASC']],
      limit: 10,
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

      // 6. Save chat history with agentId (userId = 0 for public chats)
      await this.chatHistoryModel.create({
        userId: 0, // Public chat identifier
        agentId,
        question,
        answer
      });

      return { question, answer, agentName: agent.name };
    } catch (err: any) {
      console.error('OpenAI API Error:', err.message || err);
      return {
        question,
        answer: 'The AI service is currently unavailable. Please try again later.',
        agentName: agent.name,
      };
    }
  }

  async streamQuery(userId: number, agentId: string, question: string) {
    // 1. Get agent configuration
    const agent = await this.getAgent(agentId, userId);

    // 2. Build system prompt (reusing same logic)
    const systemPrompt = `You are ${agent.role}. 

${agent.instructions}

CRITICAL RULES:
- You MUST ONLY respond to requests that are directly related to your specific role and purpose as ${agent.role}.
- If a user asks you something outside your role, you MUST politely decline.
- You are NOT a general-purpose assistant. 
- Always stay in character.`;

    // 3. Fetch history
    const chatHistory = await this.chatHistoryModel.findAll({
      where: { userId, agentId },
      order: [['createdAt', 'ASC']],
    });
    const recentHistory = chatHistory.slice(-10);
    const historyMessages = recentHistory.flatMap((h) => [
      { role: 'user' as const, content: h.question },
      { role: 'assistant' as const, content: h.answer },
    ]);

    // 4. Build messages
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...historyMessages,
      { role: 'user' as const, content: question },
    ];

    // 5. Call OpenAI with stream: true
    try {
      const stream = await this.openai.chat.completions.create({
        model: agent.model,
        messages: messages,
        stream: true,
      });

      return {
        stream,
        agent,
        saveData: async (fullAnswer: string) => {
          await this.chatHistoryModel.create({ userId, agentId, question, answer: fullAnswer });
        }
      };
    } catch (err: any) {
      console.error('OpenAI Streaming Error:', err);
      throw err;
    }
  }
}
