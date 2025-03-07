import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}
  async create(createJobDto: CreateJobDto) {
    return await this.prisma.job.create({
      data: createJobDto,
    });
  }

  findAll() {
    return this.prisma.job.findMany();
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    const existingJob = await this.prisma.job.findUnique({ where: { id } });
    if (!existingJob) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return await this.prisma.job.update({
      where: { id },
      data: updateJobDto,
    });
  }

  async remove(id: string) {
    const existingJob = await this.prisma.job.findUnique({ where: { id } });
    if (!existingJob) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    await this.prisma.job.delete({
      where: { id },
    });
  }
}
