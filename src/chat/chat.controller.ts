import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':userId/history')
  async getHistory(@Param('userId') userId: string) {
    const history = await this.chatService.getChatHistory(userId);
    return { history };
  }

  @Post()
  async chat(@Body() body: { userId: string; message: string }) {
    const { userId, message } = body;
    const response = await this.chatService.processMessage(userId, message);
    return { message: response };
  }
}
