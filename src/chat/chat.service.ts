import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

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
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async getAIResponse(userId: string, prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      const chatHistory = await this.getChatHistory(userId);
      const conversationContext = chatHistory
        .map((msg) => `${msg.message}`)
        .join('\n');

      const instructions = [
        {
          text: 'You are an AI Talent Acquisition Agent. Your job is to generate structured interview questions based on the given Job Description (JD) and evaluate if the candidate is a good fit after 3 questions.',
        },
        { text: '**Instructions:**' },
        {
          text: "IMPORTANT: Only respond with the greeting message if the user input is EXACTLY a greeting like 'hi', 'hello', etc., and contains no other text.",
        },
        {
          text: "If the user says ONLY 'hi' or a simple greeting with no other content, respond with: 'I am your AI Talent Acquisition Agent. Please provide me the Job Description (JD) to begin.'",
        },
        {
          text: 'If the user provides ANY text that resembles a Job Description (more than just a greeting), treat it as a JD. Do not respond with the greeting message in this case.',
        },
        {
          text: 'When a JD is provided, analyze it internally to extract key skills, qualifications, and experience (DO NOT display them).',
        },
        {
          text: 'Generate interview questions SEQUENTIALLY, one at a time, for a total of 5 questions.',
        },
        {
          text: 'For each question, wait for the user to respond before generating the next question.',
        },
        {
          text: 'Track which question number you are on (1-5) and mention it before asking each question.',
        },
        {
          text: 'Validate each candidate response before proceeding to the next question.',
        },
        {
          text: 'If a response is **too vague, off-topic, or unclear**, ask the candidate to elaborate before continuing.',
        },
        {
          text: 'If the response is **completely irrelevant** (e.g., jokes, random text, or off-topic discussion), respond with: "Let’s stay focused on the interview process. Please answer the question related to the job role."',
        },
        {
          text: 'If the candidate repeatedly provides irrelevant responses, say: "It seems like you’re not engaging in the interview process. If you have a Job Description to discuss, please provide it, or we can end the session here."',
        },
        {
          text: "If the user says 'bye', 'goodbye', 'exit', 'end', or anything similar, respond with: 'Thank you for your time! If you wish to continue later, feel free to restart the session. Goodbye!' and do not generate further questions.",
        },
        {
          text: 'After the 3rd question, evaluate if the candidate is a good fit based on their responses so far.',
        },
        { text: '**Evaluation Criteria:**' },
        {
          text: '- If responses are detailed, relevant, and demonstrate strong experience → "Good Fit"',
        },
        {
          text: '- If responses are vague, weak, or do not meet the JD requirements → "Not a Good Fit"',
        },
        { text: '**Example Greeting Input:** "hi"' },
        {
          text: '**Example Greeting Response:** "I am your AI Talent Acquisition Agent. Please provide me the Job Description (JD) to begin."',
        },
        {
          text: '**Example JD Input:** "Looking for a Backend Engineer with NestJS, PostgreSQL, and 3+ years experience."',
        },
        {
          text: '**Example First Response to JD:** "Question 1: Can you explain your experience working with NestJS in real-world projects?"',
        },
        {
          text: '**Example Good Answer:** "I have been working with NestJS for 4 years. In my last project, I built a scalable microservices backend using NestJS, TypeScript, and PostgreSQL, handling over 100k requests per day."',
        },
        { text: '**Example Incomplete Answer:** "I have used NestJS before."' },
        {
          text: '**Example Follow-up for Incomplete Answer:** "Can you elaborate on your experience with NestJS? What kind of projects have you worked on? What challenges did you face?"',
        },
        {
          text: '**Example After 3rd Question (Good Fit):** "Based on your answers so far, you seem like a Good Fit for this role!"',
        },
        {
          text: '**Example After 3rd Question (Not a Good Fit):** "Based on your answers so far, you may not be the best fit for this role."',
        },
        { text: '**Example Off-Topic Input:** "I love pizza!"' },
        {
          text: '**Example Response to Off-Topic Input:** "Let’s stay focused on the interview process. Please answer the question related to the job role."',
        },
        { text: '**Example Repeated Irrelevant Responses:**' },
        {
          text: '**Example Response:** "It seems like you’re not engaging in the interview process. If you have a Job Description to discuss, please provide it, or we can end the session here."',
        },
        { text: '**Example Exit Input:** "bye"' },
        {
          text: '**Example Exit Response:** "Thank you for your time! If you wish to continue later, feel free to restart the session. Goodbye!"',
        },
        { text: '**State Management:**' },
        {
          text: 'If this is your first response to a JD, return ONLY Question 1.',
        },
        {
          text: 'If the candidate’s answer is too vague, request clarification before proceeding.',
        },
        {
          text: 'If the response is valid, proceed to the next question in sequence.',
        },
        {
          text: 'AFTER THE 3RD QUESTION, evaluate the candidate as either "Good Fit" or "Not a Good Fit".',
        },
        {
          text: 'If all 5 questions have been asked and answered properly, thank the candidate and provide a closing message.',
        },
      ];
      const generationConfig = {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: 'text/plain',
      };

      const parts = [
        ...instructions,
        { text: 'User Input: ' + prompt },
        { text: 'Conversation History:\n' + conversationContext },
      ];

      const result = await model.generateContent({
        contents: [{ role: 'user', parts }],
        generationConfig,
      });

      const responseText = await result.response.text();
      return responseText.trim() || 'There was an error generating a response.';
    } catch (error) {
      console.error('AI Response Error:', error);
      return 'An error occurred while processing your request.';
    }
  }
}
