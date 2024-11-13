import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { CreateValaroDto } from './dto/create-valaro.dto';

@Injectable()
export class ValenceArousalService {
  constructor(private prisma: PrismaService) {}

  async getAll(page: number, limit: number) {
    const offset = (page - 1) * limit;

    const data = await this.prisma.valenceArousal.findMany({
      skip: offset,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
          },
        },
      },
    });

    const totalCount = await this.prisma.valenceArousal.count();

    return {
      success: true,
      pagination: {
        totalItems: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      },
      message: 'Get all valence arousal success',
      data,
      
    };
  }

  async getByUser(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const data = await this.prisma.valenceArousal.findMany({
      skip: offset,
      take: limit,
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
          },
        },
      },
    });

    const totalCount = await this.prisma.valenceArousal.count({
      where: {
        userId,
      },
    });
    return {
      success: true,
      pagination: {
        totalItems: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        pageLeft: Math.ceil(totalCount / limit) - page > 0 ? Math.ceil(totalCount / limit) - page : 0,
      },
      message: 'Get valence arousal by user success',
      data,
    };
  }

  async create(data: CreateValaroDto) {
    const checkUser = await this.prisma.user.findUnique({
      where: {
        id: data.userId,
      },
    });
    if (!checkUser) {
      throw new NotFoundException('User not found');
    }

    const checkMeeting = await this.prisma.meeting.findUnique({
      where: {
        meetingCode: data.meetingCode,
      },
    });

    if (!checkMeeting) {
      throw new NotFoundException('Meeting not found');
    }

    const createData = await this.prisma.valenceArousal.create({
      data,
    });
    return {
      success: true,
      message: 'Create valence arousal success',
      data: createData,
    };
  }
}
