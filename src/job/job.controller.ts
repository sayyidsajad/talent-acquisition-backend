import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  async create(@Body() createJobDto: CreateJobDto) {
    const job = await this.jobService.create(createJobDto);
    return { success: true, message: 'Job created successfully', data: job };
  }

  @Get()
  async findAll(@Req() req: Request) {
    const { id, role } = req['user'];
    const jobs = await this.jobService.findAll(id, role);
    return { success: true, data: jobs };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const job = await this.jobService.findOne(id);
    return { success: true, data: job };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    const updatedJob = await this.jobService.update(id, updateJobDto);
    return {
      success: true,
      message: 'Job updated successfully',
      data: updatedJob,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.jobService.remove(id);
    return { success: true, message: 'Job deleted successfully' };
  }
}
