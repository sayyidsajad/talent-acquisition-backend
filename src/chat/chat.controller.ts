import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { Express } from 'express';
import { multerConfig } from 'src/config/multer.config';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history/:jobId')
  async getChatHistory(@Req() req: Request, @Param('jobId') jobId: string) {
    const { id } = req['user'];
    const history = await this.chatService.getChatHistory(id, jobId);
    return { success: true, data: history };
  }

  @Post('message')
  async processMessage(
    @Body() body: { message: string; jobId: string },
    @Req() req: Request,
  ) {
    const { id } = req['user'];
    const response = await this.chatService.processMessage(
      id,
      body.jobId,
      body.message,
    );
    return { success: true, message: response };
  }

  @Get('initialize-interview/:jobId')
  async initializeInterview(
    @Param('jobId') jobId: string,
    @Req() req: Request,
  ) {
    const { id } = req['user'];
    const initialMessage = await this.chatService.initializeInterview(
      id,
      jobId,
    );
    return { success: true, message: initialMessage };
  }

  @Post('upload-pdf')
  @UseInterceptors(FileInterceptor('pdf', multerConfig))
  async uploadPdf(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const { id } = req['user'];
    const firstQuestion = await this.chatService.processJobDescription(
      id,
      file.path,
    );

    return { success: true, message: 'Interview started', firstQuestion };
  }
}
