import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { CreateValaroDto } from './dto/create-valaro.dto';
export interface Root {
  success: boolean;
  message: string;
  data: Data;
}

export interface Data {
  emotions: Emotion[];
  totalRecords: number;
  uniqueParticipants: number;
}

export interface Emotion {
  emotion: string;
  percentage: number;
  emotionPercentage: number;
  valence: number;
  arousal: number;
}
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
      orderBy:{
        createdAt: 'desc',
      },
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

  private async calculateValenceArousalAverage(meetingCode: string) {
    
  }

  async getAnalyticsByMeetingCode(meetingCode: string) {
    console.log('meetingCode', meetingCode);
    // Get all data for the meeting
    const data = await this.prisma.valenceArousal.findMany({
      where: {
        meetingCode,
      },
      select: {
        valence: true,
        arousal: true,
        emotion: true,
        emotionPercentages: true,
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
          },
        },
      },
    });
    

    if (!data.length) {
      return {
        success: false,
        message: 'No data found for this meeting code',
        data: null,
      };
    }

    // Calculate averages
    const averages = data.reduce(
      (acc, curr) => {
        return {
          valence: acc.valence + (curr.valence || 0),
          arousal: acc.arousal + (curr.arousal || 0),
          emotionPercentage: acc.emotionPercentage + (curr.emotionPercentages || 0),
        };
      },
      { valence: 0, arousal: 0, emotionPercentage: 0 }
    );

    // Calculate final averages
    const totalRecords = data.length;
    const avgValence = averages.valence / totalRecords;
    const avgArousal = averages.arousal / totalRecords;
    const avgEmotionPercentage = averages.emotionPercentage / totalRecords;

    // Count emotions (similar to your frontend processData function)
    const emotionCounts = data.reduce((acc, item) => {
      acc[item.emotion] = (acc[item.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert emotion counts to percentages
    const emotions = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      percentage: (count / totalRecords) * 100,
    }));

    // Get unique users who participated
    const uniqueUsers = [...new Set(data.map(item => item.user.id))];

    return {
      success: true,
      message: 'Analytics retrieved successfully',
      data: {
        averages: {
          valence: Number(avgValence.toFixed(2)),
          arousal: Number(avgArousal.toFixed(2)),
          emotionPercentage: Number(avgEmotionPercentage.toFixed(2)),
        },
        emotions,
        totalRecords,
        uniqueParticipants: uniqueUsers.length,
        // timeframe: {
        //   start: data[data.length - 1].createdAt,
        //   end: data[0].createdAt,
        // },
      },
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

  async getAnalytics(meetingCode?: string): Promise<Root> {
    console.log('meetingCode', meetingCode);
    try {
      // Base query to get all records
      const baseQuery = meetingCode 
        ? { where: { meetingCode } }
        : {};

      // Get all records
      // const records = await this.prisma.valenceArousal.findMany({
      //   ...baseQuery,
      //   include: {
      //     user: true,
      //   },
      // });
      const records = await this.prisma.valenceArousal.findMany({
        where:{
          meetingCode: meetingCode,
        },
        include:{
          user: true,
        }
      })

      // Get total records count
      const totalRecords = records.length;

      // Get unique participants count
      const uniqueParticipants = new Set(records.map(record => record.userId)).size;

      // Group records by emotion
      const emotionGroups = records.reduce((acc, record) => {
        if (!acc[record.emotion]) {
          acc[record.emotion] = {
            count: 0,
            totalValence: 0,
            totalArousal: 0,
            totalEmotionPercentage: 0,
          };
        }
        
        acc[record.emotion].count += 1;
        acc[record.emotion].totalValence += record.valence;
        acc[record.emotion].totalArousal += record.arousal;
        acc[record.emotion].totalEmotionPercentage += record.emotionPercentages;
        
        return acc;
      }, {} as Record<string, {
        count: number;
        totalValence: number;
        totalArousal: number;
        totalEmotionPercentage: number;
      }>);

      // Calculate averages and percentages for each emotion
      const emotions: Emotion[] = Object.entries(emotionGroups).map(([emotion, data]) => ({
        emotion,
        percentage: (data.count / totalRecords) * 100,
        emotionPercentage: data.totalEmotionPercentage / data.count,
        valence: data.totalValence / data.count,
        arousal: data.totalArousal / data.count,
      }));

      // Sort emotions by percentage in descending order
      emotions.sort((a, b) => b.percentage - a.percentage);

      return {
        success: true,
        message: 'Analytics retrieved successfully',
        data: {
          emotions,
          totalRecords,
          uniqueParticipants,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve analytics: ${error.message}`,
        data: {
          emotions: [],
          totalRecords: 0,
          uniqueParticipants: 0,
        },
      };
    }
  }

  async getAnalyticsByTimeRange(
    startDate: Date,
    endDate: Date,
    meetingCode?: string,
  ): Promise<Root> {
    try {
      const whereClause = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(meetingCode && { meetingCode }),
      };

      const records = await this.prisma.valenceArousal.findMany({
        where: whereClause,
        include: {
          user: true,
        },
      });

      // Reuse the same logic as getAnalytics
      const totalRecords = records.length;
      const uniqueParticipants = new Set(records.map(record => record.userId)).size;

      const emotionGroups = records.reduce((acc, record) => {
        if (!acc[record.emotion]) {
          acc[record.emotion] = {
            count: 0,
            totalValence: 0,
            totalArousal: 0,
            totalEmotionPercentage: 0,
          };
        }
        
        acc[record.emotion].count += 1;
        acc[record.emotion].totalValence += record.valence;
        acc[record.emotion].totalArousal += record.arousal;
        acc[record.emotion].totalEmotionPercentage += record.emotionPercentages;
        
        return acc;
      }, {} as Record<string, {
        count: number;
        totalValence: number;
        totalArousal: number;
        totalEmotionPercentage: number;
      }>);

      const emotions: Emotion[] = Object.entries(emotionGroups).map(([emotion, data]) => ({
        emotion,
        percentage: (data.count / totalRecords) * 100,
        emotionPercentage: data.totalEmotionPercentage / data.count,
        valence: data.totalValence / data.count,
        arousal: data.totalArousal / data.count,
      })).sort((a, b) => b.percentage - a.percentage);

      return {
        success: true,
        message: 'Analytics retrieved successfully',
        data: {
          emotions,
          totalRecords,
          uniqueParticipants,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to retrieve analytics: ${error.message}`,
        data: {
          emotions: [],
          totalRecords: 0,
          uniqueParticipants: 0,
        },
      };
    }
  }
}
