import { Injectable } from '@nestjs/common';
import { AvailableRecognitionModel } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { createSuccessListResponse } from 'src/utils/response.utils';

@Injectable()
export class DashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  async getDashboardData(userId: string) {
    // return 'This action returns all dashboard data';
    const totalClassCurrentUser = await this.prismaService.class.count({
      where: {
        userId,
      },
    });
    const totalMeetingCurrentUser = await this.prismaService.meeting.count({
      where: {
        user: {
          id: userId,
        },
      },
    });

    const totalMembersOfCurrentUserClass = await this.prismaService.member.count({
      where: {
        class: {
          userId,
        },
      },
    });

    const totalParticipantsOfCurrentUserMeeting = await this.prismaService.meetingParticipant.count({
      where: {
        meeting: {
          user: {
            id: userId,
          },
        },
      },
    });
    // const totalUser = await this.prismaService.user.count();
    const totalMember = await this.prismaService.member.count();

    return {
      success: true,
      message: 'Dashboard data fetched successfully',
      data: {
        totalClassCurrentUser,
        totalMeetingCurrentUser,
        totalMembersOfCurrentUserClass,
        totalParticipantsOfCurrentUserMeeting,
      },
    };
  }

  async getRecentMeetings(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const recentMeetings = await this.prismaService.meeting.findMany({
      skip: offset,
      take: limit,
      where: {
        user: {
          id: userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
     
    });

    const totalCount = await this.prismaService.meeting.count({
      where: {
        user: {
          id: userId,
        },
      },
    });

    return createSuccessListResponse({
      message: 'Recent meetings fetched successfully',
      pagination: {
        totalItems: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        pageLeft:
          Math.ceil(totalCount / limit) - page > 0
            ? Math.ceil(totalCount / limit) - page
            : 0,
      },
      data: recentMeetings,
    });
  }

  async getEmotionDistribution(userId: string, modelName: string) {
    if(modelName === AvailableRecognitionModel.FACE_API){
      const getAllMeetingOwnedByCurrentUser = await this.prismaService.meeting.findMany({
        where: {
          user: {
            id: userId,
          },
        },
        select: {
          id: true,
        },
      });

      const getAllMeetingParticipant = await this.prismaService.meetingParticipant.findMany({
        where: {
          meetingId: {
            in: getAllMeetingOwnedByCurrentUser.map((meeting) => meeting.id),
          },
        },
        select: {
          userId: true,
        },
      });

      const result = await this.prismaService.recognition.findMany({
        where: {
          userId: {
            in: getAllMeetingParticipant.map((participant) => participant.userId),
          },
        },
        select: {
          angry: true,
          disgusted: true,
          fearful: true,
          happy: true,
          neutral: true,
          sad: true,
          surprised: true,
        },
      });

      const averageEmotion = {
        angry: 0,
        disgusted: 0,
        fearful: 0,
        happy: 0,
        neutral: 0,
        sad: 0,
        surprised: 0,
      };

      result.forEach((emotion) => {
        averageEmotion.angry += emotion.angry;
        averageEmotion.disgusted += emotion.disgusted;
        averageEmotion.fearful += emotion.fearful;
        averageEmotion.happy += emotion.happy;
        averageEmotion.neutral += emotion.neutral;
        averageEmotion.sad += emotion.sad;
        averageEmotion.surprised += emotion.surprised;
      });
      
      const convertToPercentage = (value: number) => {
        return value * 100;
      }
      

      return {
        success: true,
        message: 'Emotion distribution fetched successfully',
        data: {
          // participants : getAllMeetingParticipant,
          angry: convertToPercentage(averageEmotion.angry/result.length),
          disgusted: convertToPercentage(averageEmotion.disgusted/result.length),
          fearful: convertToPercentage(averageEmotion.fearful/result.length),
          happy: convertToPercentage(averageEmotion.happy/result.length),
          neutral: convertToPercentage(averageEmotion.neutral/result.length),
          sad: convertToPercentage(averageEmotion.sad/result.length),
          surprised: convertToPercentage(averageEmotion.surprised/result.length),
        },
      }
    }
  }
}
