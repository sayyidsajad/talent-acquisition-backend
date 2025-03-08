import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { Express } from 'express';
import { multerConfig } from 'src/config/multer.config';
import { ChatMessageDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':userId/history')
  async getChatHistory(@Param('userId') userId: string) {
    const history = await this.chatService.getChatHistory(userId);
    return { success: true, data: history };
  }

  @Post()
  async chat(@Body() chatMessageDto: ChatMessageDto) {
    const { userId, message } = chatMessageDto;
    const response = await this.chatService.processMessage(userId, message);
    return { success: true, message: response };
  }

  @Get('generate-question/:jobId')
  async interview(@Param('jobId') jobId: string) {
    const response = await this.chatService.getAIResponse('user123', jobId);
    return { success: true, message: response };
  }

  @Post(':userId/upload-pdf')
  @UseInterceptors(FileInterceptor('pdf', multerConfig))
  async uploadPdf(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const firstQuestion = await this.chatService.processJobDescription(
      userId,
      file.path,
    );

    return { success: true, message: 'Interview started', firstQuestion };
  }
}
