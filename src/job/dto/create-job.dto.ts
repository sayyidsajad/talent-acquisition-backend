import { IsString, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  company: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsString()
  experience: string;

  @IsString()
  description: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  requirements: string[];
}
