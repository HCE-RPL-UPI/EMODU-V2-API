import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbacksService {
  constructor(private readonly prisma: PrismaService) {}

  async createFeedback(data: CreateFeedbackDto) {
    return await this.prisma.feedback.create({
      data,
    });
  }

  async findAll() {
    const feedbacks = await this.prisma.feedback.findMany();

    if (feedbacks.length === 0) {
      throw new NotFoundException('No feedbacks found');
    }

    return await this.prisma.feedback.findMany();
  }

  async aggregateFeedbacks() {
    return await this.prisma.feedback.aggregate({
      _count: true,
      _sum: {
        rating: true,
      },
      _avg: {
        rating: true,
      },
    });
  }

}
