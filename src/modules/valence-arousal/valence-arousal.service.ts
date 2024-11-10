import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { CreateValaroDto } from './dto/create-valaro.dto';

@Injectable()
export class ValenceArousalService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    // return await this.prisma.valenceArousal.findMany();
    const data = await this.prisma.valenceArousal.findMany({
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
    return {
      success: true,
      message: 'Get all valence arousal success',
      data,
    };
  }

  async getByUser(userId: string) {
    const data = await this.prisma.valenceArousal.findMany({
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
    return {
      success: true,
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
