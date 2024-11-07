import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { WebsocketGateway } from 'src/services/websocket/websocket.gateway';
import { createRecognitionDto } from './dto/create-recognition.dto';

@Injectable()
export class RecognitionsService {
  private recognitionInterval: Record<string, NodeJS.Timeout> = {};

  constructor(
    private readonly prisma: PrismaService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  // async getRecognitionsByMeetingCode(meetingCode: string, limit: number) {
  //   const meeting = await this.prisma.meeting.findUnique({
  //     where: {
  //       meetingCode,
  //     },
  //   });

  //   if (!meeting) {
  //     throw new NotFoundException({
  //       error: true,
  //       status: 404,
  //       message: 'Meeting not found',
  //     });
  //   }

  //   // Get recognition details with limit and averaging
  //   const recognitionDetails = await this.prisma.recognition.findMany({
  //     where: { meetingCode },
  //     orderBy: { createdAt: 'desc' },
  //     take: limit,
  //   });

  //   const recognitionsOverview =
  //     await this.calculateEmotionsAverage(meetingCode);
  //   const recognitionsSummary =
  //     await this.calculatePositiveNegative(meetingCode);

  //   const labelsOverview = [
  //     'Neutral',
  //     'Happy',
  //     'Sad',
  //     'Angry',
  //     'Fearful',
  //     'Disgusted',
  //     'Surprised',
  //   ];
  //   const labelsSummary = ['Positive', 'Negative'];

  //   const responseData = {
  //     recognitionStream: recognitionDetails,
  //     recognitionsOverview: {
  //       labels: labelsOverview,
  //       datas: Object.values(recognitionsOverview || {}),
  //     },
  //     recognitionsSummary: {
  //       labels: labelsSummary,
  //       datas: Object.values(recognitionsSummary || {}),
  //     },
  //     recognitionsDetail: {
  //       labels: recognitionDetails.map((detail) => detail.createdAt),
  //       neutral: recognitionDetails.map((detail) => detail.neutral),
  //       happy: recognitionDetails.map((detail) => detail.happy),
  //       sad: recognitionDetails.map((detail) => detail.sad),
  //       angry: recognitionDetails.map((detail) => detail.angry),
  //       fearful: recognitionDetails.map((detail) => detail.fearful),
  //       disgusted: recognitionDetails.map((detail) => detail.disgusted),
  //       surprised: recognitionDetails.map((detail) => detail.surprised),
  //     },
  //   };
  //   return {
  //     success: true,
  //     message: 'Recognition data fetched successfully',
  //     data: responseData,
  //   };
  // }

  async getRecognitionsByMeetingCode(meetingCode: string, limit: number) {
    const meeting = await this.prisma.meeting.findUnique({
      where: {
        meetingCode,
      },
    });

    if (!meeting) {
      throw new NotFoundException({
        error: true,
        status: 404,
        message: 'Meeting not found',
      });
    }

    // Get recognition details with limit and averaging
    const recognitionDetails = await this.prisma.recognition.findMany({
      where: { meetingCode },
      orderBy: { createdAt: 'asc' },
      // take: limit,
    });

    const recognitionsOverview = await this.calculateEmotionsAverage(meetingCode);
    const recognitionsSummary = await this.calculatePositiveNegative(meetingCode);

    const responseData = {
      recognitionStream: recognitionDetails,
      recognitionsOverview,  // This will now be in the desired format
      recognitionsSummary: {
        labels: ['Positive', 'Negative'],
        datas: Object.values(recognitionsSummary || {}),
      },
      recognitionsDetail: {
        labels: recognitionDetails.map((detail) => detail.createdAt),
        neutral: recognitionDetails.map((detail) => detail.neutral),
        happy: recognitionDetails.map((detail) => detail.happy),
        sad: recognitionDetails.map((detail) => detail.sad),
        angry: recognitionDetails.map((detail) => detail.angry),
        fearful: recognitionDetails.map((detail) => detail.fearful),
        disgusted: recognitionDetails.map((detail) => detail.disgusted),
        surprised: recognitionDetails.map((detail) => detail.surprised),
      },
    };
    return {
      success: true,
      message: 'Recognition data fetched successfully',
      data: responseData,
    };
}

private async calculateEmotionsAverage(meetingCode: string) {
    const emotions = await this.prisma.recognition.groupBy({
      by: ['meetingCode'],
      where: { meetingCode },
      _avg: {
        neutral: true,
        happy: true,
        sad: true,
        angry: true,
        fearful: true,
        disgusted: true,
        surprised: true,
      },
    });

    const averages = emotions[0]?._avg || {
      neutral: 0,
      happy: 0,
      sad: 0,
      angry: 0,
      fearful: 0,
      disgusted: 0,
      surprised: 0,
    };

    // Format into the desired structure
    return {
      labels: [
        'Neutral',
        'Happy',
        'Sad',
        'Angry',
        'Fearful',
        'Disgusted',
        'Surprised'
      ],
      datas: [
        Math.round(averages.neutral * 100),
        Math.round(averages.happy * 100),
        Math.round(averages.sad * 100),
        Math.round(averages.angry * 100),
        Math.round(averages.fearful * 100),
        Math.round(averages.disgusted * 100),
        Math.round(averages.surprised * 100),
      ]
    };
}
  

  // private async calculateEmotionsAverage(meetingCode: string) {
  //   const emotions = await this.prisma.recognition.groupBy({
  //     by: ['meetingCode'],
  //     where: { meetingCode },
  //     _avg: {
  //       neutral: true,
  //       happy: true,
  //       sad: true,
  //       angry: true,
  //       fearful: true,
  //       disgusted: true,
  //       surprised: true,
  //     },
  //   });

  //   return emotions.length > 0 ? emotions[0] : null;
  // }

  private async calculatePositiveNegative(meetingCode: string) {
    const data = await this.prisma.recognition.findMany({
      where: { meetingCode },
    });

    const summary = data.reduce(
      (acc, curr) => {
        acc.positive += curr.happy + curr.surprised;
        acc.negative += curr.sad + curr.angry + curr.fearful + curr.disgusted;
        acc.count +=
          curr.happy +
          curr.sad +
          curr.angry +
          curr.fearful +
          curr.disgusted +
          curr.surprised;
        return acc;
      },
      { positive: 0, negative: 0, count: 0 },
    );

    return {
      positive: summary.count
        ? Math.round((summary.positive / summary.count) * 100)
        : 0,
      negative: summary.count
        ? Math.round((summary.negative / summary.count) * 100)
        : 0,
    };
  }

  async getRecognitionOverview(userId: string) {
    const meetingCodes = await this.prisma.meeting
      .findMany({
        // where: !role.includes('superadmin') ? { createdBy } : undefined,
        where: {
          createdBy: userId,
        },
        select: { meetingCode: true },
        distinct: ['meetingCode'],
      })
      .then((meetings) => meetings.map((m) => m.meetingCode));

    // Melakukan agregasi pada Recognition
    const data = await this.prisma.recognition.aggregate({
      _avg: {
        neutral: true,
        happy: true,
        sad: true,
        angry: true,
        fearful: true,
        disgusted: true,
        surprised: true,
      },
      where: {
        meetingCode: {
          in: meetingCodes,
        },
      },
    });

    // Mengonversi hasil rata-rata ke format persentase
    const formattedData = {
      neutral: data._avg.neutral ? Math.round(data._avg.neutral * 100) : 0,
      happy: data._avg.happy ? Math.round(data._avg.happy * 100) : 0,
      sad: data._avg.sad ? Math.round(data._avg.sad * 100) : 0,
      angry: data._avg.angry ? Math.round(data._avg.angry * 100) : 0,
      fearful: data._avg.fearful ? Math.round(data._avg.fearful * 100) : 0,
      disgusted: data._avg.disgusted
        ? Math.round(data._avg.disgusted * 100)
        : 0,
      surprised: data._avg.surprised
        ? Math.round(data._avg.surprised * 100)
        : 0,
    };

    console.log('formattedData', formattedData);

    const labels = [
      'Neutral',
      'Happy',
      'Sad',
      'Angry',
      'Fearful',
      'Disgusted',
      'Surprised',
    ];

    // return { labels, datas: Object.values(formattedData) };

    return {
      success: true,
      message: 'Recognition overview fetched successfully',
      data: {
        labels,
        datas: Object.values(formattedData),
      },
    };
  }

  async createRecognition(data: createRecognitionDto) {
    // const { userId,  } = data;

    const recognition = await this.prisma.recognition.create({
      data: data,
    });

    // socket io logic
    if (recognition) {
      this.websocketGateway.emitRecognitionDataAdded(
        data.meetingCode,
        data.userId,
      );
      // const socket = io();
      // this.socketService.emitRecognition(recognition);
    }

    return {
      message: 'Recognition created successfully',
      data: recognition,
    };
  }

  async getOverallByUserId(userId: string) {
    // Fetch all recognition data by userId
    const data = await this.prisma.recognition.findMany({
      where: { userId },
      select: {
        neutral: true,
        happy: true,
        sad: true,
        angry: true,
        fearful: true,
        disgusted: true,
        surprised: true,
      },
    });

    // Calculate averages
    const emotionSums = data.reduce(
      (sums, entry) => {
        sums.neutral += entry.neutral;
        sums.happy += entry.happy;
        sums.sad += entry.sad;
        sums.angry += entry.angry;
        sums.fearful += entry.fearful;
        sums.disgusted += entry.disgusted;
        sums.surprised += entry.surprised;
        return sums;
      },
      {
        neutral: 0,
        happy: 0,
        sad: 0,
        angry: 0,
        fearful: 0,
        disgusted: 0,
        surprised: 0,
      },
    );

    const dataCount = data.length || 1; // Avoid division by zero
    const averages = {
      neutral: (emotionSums.neutral / dataCount) * 100,
      happy: (emotionSums.happy / dataCount) * 100,
      sad: (emotionSums.sad / dataCount) * 100,
      angry: (emotionSums.angry / dataCount) * 100,
      fearful: (emotionSums.fearful / dataCount) * 100,
      disgusted: (emotionSums.disgusted / dataCount) * 100,
      surprised: (emotionSums.surprised / dataCount) * 100,
    };

    // Calculate total positive and negative percentages
    const positive = averages.happy + averages.surprised;
    const negative =
      averages.sad + averages.angry + averages.fearful + averages.disgusted;
    const total = positive + negative;
    const positivePercentage = Math.round((positive / total) * 100);
    const negativePercentage = Math.round((negative / total) * 100);

    // Transform data into the desired format
    const formattedData = {
      recognitionsOverview: {
        labels: [
          'Neutral',
          'Happy',
          'Sad',
          'Angry',
          'Fearful',
          'Disgusted',
          'Surprised',
        ],
        datas: Object.values(averages).map((value) => Math.round(value)),
      },
      recognitionsSummary: {
        labels: ['Positive', 'Negative'],
        datas: [positivePercentage, negativePercentage],
      },
      recognitionsDetail: {},
      recognitionStream: [],
    };

    return formattedData;
  }
}
