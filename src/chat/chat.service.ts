import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs-extra';
import * as pdfParse from 'pdf-parse';
@Injectable()
export class ChatService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }
  async processMessage(userId: string, message: string): Promise<string> {
    await this.prisma.chatMessage.create({
      data: { userId, sender: 'user', message },
    });
    const aiResponse = await this.getAIResponse(userId, message);
    await this.prisma.chatMessage.create({
      data: { userId, sender: 'ai', message: aiResponse },
    });

    return aiResponse;
  }

  async getChatHistory(userId: string) {
    return this.prisma.chatMessage.findMany({
      where: {
        userId,
        NOT: { sender: 'system' },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async storeJobDescription(userId: string, jdText: string): Promise<void> {
    await this.prisma.chatMessage.create({
      data: { userId, sender: 'system', message: jdText },
    });
  }

  async processJobDescription(
    userId: string,
    filePath: string,
  ): Promise<string> {
    const pdfText = await this.extractTextFromPdf(filePath);
    await this.storeJobDescription(userId, pdfText);
    const firstQuestion = await this.getAIResponse(userId, pdfText);
    await this.prisma.chatMessage.create({
      data: { userId, sender: 'ai', message: firstQuestion },
    });
    return firstQuestion;
  }

  async getAIResponse(userId: string, prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      const jdMessage = await this.prisma.chatMessage.findFirst({
        where: { userId, sender: 'system' },
        orderBy: { createdAt: 'desc' },
      });

      const chatHistory = await this.getChatHistory(userId);
      const conversationContext = chatHistory
        .filter((msg) => msg.sender !== 'system')
        .map((msg) => `${msg.message}`)
        .join('\n');

      const instructions = [
        {
          text: 'You are an AI Talent Acquisition Agent. Your job is to generate structured interview questions based on the given Job Description (JD) and evaluate if you are a good fit after 3 questions.',
        },
        { text: 'Job Description (JD) Provided:' },
        { text: jdMessage?.message || prompt },
        {
          text: 'Analyze the JD to extract key skills, qualifications, and experience. DO NOT display them explicitly.',
        },
        {
          text: 'Generate interview questions SEQUENTIALLY, one at a time, for a total of 5 questions.',
        },
        {
          text: 'For each question, wait for your response before generating the next question.',
        },
        {
          text: 'Track which question number you are on (1-5) and mention it before asking each question. Do not use asterisks or markdown formatting in the question numbering.',
        },
        {
          text: 'Your responses will be validated before proceeding to the next question.',
        },
        {
          text: 'If your response is too vague, off-topic, or unclear, you will be asked to elaborate before continuing.',
        },
        {
          text: 'If your response is completely irrelevant (e.g., jokes, random text, or off-topic discussion), you will receive a prompt saying: "Let\'s stay focused on the interview process. Please answer the question related to the job role."',
        },
        {
          text: 'If you repeatedly provide irrelevant responses, you will be informed: "It seems like you\'re not engaging in the interview process. Please provide proper answers or we can end the session here."',
        },
        {
          text: "If you say 'bye', 'goodbye', 'exit', or anything similar, the interview will end with: 'Thank you for your time! If you wish to continue later, feel free to restart the session. Goodbye!' No further questions will be generated.",
        },
        {
          text: "If you say 'thank you' or something similar, respond naturally with phrases like: 'You're welcome!', 'Glad to help!', or 'No problem!'. Do not restart the interview unless explicitly asked.",
        },
        {
          text: 'After the 3rd question, your responses so far will be evaluated to determine if you are a good fit for the role.',
        },
        { text: 'Evaluation Criteria:' },
        {
          text: '- If your responses are detailed, relevant, and demonstrate strong experience → "You are a good fit for the role." The interview will now restart with a new set of questions.',
        },
        {
          text: '- If your responses are vague, weak, or do not meet the JD requirements → "You are not a good fit for the role." The interview will now restart with a new set of questions.',
        },
        {
          text: 'If all 5 questions have been asked and answered properly, you will receive a closing message thanking you for your time. The interview will now restart with a new set of questions.',
        },
        {
          text: 'Do not use markdown formatting such as asterisks (*) in your responses, especially around the question numbers.',
        },
      ];
      const parts = [
        ...instructions,
        { text: 'User Input: ' + prompt },
        { text: 'Conversation History:\n' + conversationContext },
      ];
      const result = await model.generateContent({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: 'text/plain',
        },
      });

      const responseText = await result.response.text();
      return responseText.trim() || 'There was an error generating a response.';
    } catch (error) {
      return 'An error occurred while processing your request.';
    }
  }
  async extractTextFromPdf(filePath: string): Promise<string> {
    const dataBuffer = await fs.readFile(filePath);
    const parsedData = await pdfParse(dataBuffer);
    return parsedData.text;
  }
}
