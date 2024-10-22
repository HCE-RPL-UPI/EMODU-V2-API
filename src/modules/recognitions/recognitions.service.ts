import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { WebsocketGateway } from 'src/services/websocket/websocket.gateway';

@Injectable()
export class RecognitionsService {
  private recognitionInterval: Record<string, NodeJS.Timeout> = {};

  constructor(
    private readonly prisma: PrismaService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async getRecognitionsOverview(createdBy: string) {
    // return await this.prisma.recognition.findMany();
    const meetingCodes = await this.prisma.meeting.findMany({
      where: {
        createdBy,
      },
      select: {
        meetingCode: true,
      },
    });

    const meetingCodeList = meetingCodes.map((meeting) => meeting.meetingCode);

    // if not meeting are found, return an empty result
    if (meetingCodeList.length === 0) {
      return {
        data: [],
        message: 'No recognitions found',
      };
    }

    const recognitions = await this.prisma.recognition.findMany({
      where: {
        meetingCode: {
          in: meetingCodeList,
        },
      },
    });

    if (recognitions.length === 0) {
      return {
        data: [],
        message: 'No recognitions found',
      };
    }

    const emotions = [
      'neutral',
      'happy',
      'sad',
      'angry',
      'fearful',
      'disgusted',
      'surprised',
    ];
    const emotionSums = emotions.reduce(
      (acc, emotion) => {
        acc[emotion] = 0;
        return acc;
      },
      {} as Record<string, number>,
    );

    recognitions.forEach((recognition) => {
      emotions.forEach((emotion) => {
        emotionSums[emotion] += recognition[emotion];
      });
    });

    const averages = emotions.reduce(
      (acc, emotion) => {
        acc[emotion] = (emotionSums[emotion] / recognitions.length) * 100;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Step 4: Prepare the response data
    const labels = [
      'Neutral',
      'Happy',
      'Sad',
      'Angry',
      'Fearful',
      'Disgusted',
      'Surprised',
    ];
    const datas = labels.map((label) => averages[label.toLowerCase()]);

    return { labels, datas };
  }

  async createRecognition(data:{userId: string, image: string, rest: any}){
    const { userId, image, rest } = data;

    const recognition = await this.prisma.recognition.create({
      data:{
        ...rest,
        image: "",
        userId,
      }
    })

    // socket io logic
    if(recognition){
      this.websocketGateway.emitRecognitionDataAdded(rest.meetingCode, userId)
      // const socket = io();
      // this.socketService.emitRecognition(recognition);
    }
  }

  // async 
}
