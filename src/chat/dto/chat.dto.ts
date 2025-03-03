import { IsNotEmpty, IsString } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class UploadPdfDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
