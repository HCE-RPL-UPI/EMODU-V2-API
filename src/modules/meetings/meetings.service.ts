import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { createSuccessResponse } from 'src/utils/response.utils';
import { AddParticipantDto } from './dto/add-participant.dto';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebsocketGateway } from 'src/services/websocket/websocket.gateway';

@Injectable()
export class MeetingsService {
  @WebSocketServer()
  server: Server;

  private recognitionIntervals: { [key: string]: NodeJS.Timeout } = {};
  constructor(
    private readonly prisma: PrismaService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}
  
  async create(userId: string, createMeetingDto: CreateMeetingDto) {
    // this.websocketGateway.ser
    console.log('userId', userId);
    const timestamp = new Date(Date.now()).toISOString();
    const generatedMeetingCode = timestamp
      .replace(/[-:]/g, '')
      .replace('.', '')
      .replace('T', '')
      .replace('Z', '');
    const getClass = await this.prisma.class.findUnique({
      where: {
        id: createMeetingDto.classId,
      },
    });

    console.log('getClass', getClass);

    if (!getClass) {
      throw new NotFoundException('Class not found');
    }

    const meeting = await this.prisma.meeting.create({
      data: {
        ...createMeetingDto,
        link:
          !createMeetingDto.link || createMeetingDto.link.trim() === ''
            ? getClass.defaultMeetingLink
            : createMeetingDto.link,
        meetingCode: generatedMeetingCode,
        isStarted: false,
        isEnded: false,
        classId: createMeetingDto.classId,
        createdBy: userId,
      },
    });

    return createSuccessResponse({
      data: meeting,
      message: 'Meeting created successfully',
    });
  }

  async findAll(user: { userId: string }) {
    const meetings = await this.prisma.meeting.findMany({
      where: {
        createdBy: user.userId,
      },
    });

    if (meetings.length === 0) {
      throw new NotFoundException('No meetings found');
    }

    return {
      data: meetings,
      message: 'All meetings fetched successfully',
    };
    // return `This action returns all meetings`;
  }

  async addParticipant(data: AddParticipantDto) {
    const meeting = await this.prisma.meeting.findUnique({
      where: {
        // id: data.meetingId,
        meetingCode: data.meetingCode,
      },
      include: {
        class: true,
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: data.participantId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // join class if not already joined
    const checkMember = await this.prisma.member.findFirst({
      where: {
        userId: data.participantId,
        classId: meeting.classId,
      },
    });

    if (!checkMember) {
      if (meeting.createdBy === data.participantId) {
        await this.prisma.member.create({
          data: {
            role: 'TEACHER',
            joinAt: new Date(),
            userId: data.participantId,
            classId: meeting.classId,
          },
        });
      }
      await this.prisma.member.create({
        data: {
          role: 'STUDENT',
          joinAt: new Date(),
          userId: data.participantId,
          classId: meeting.classId,
        },
      });
    }

    const participant = await this.prisma.meetingParticipant.upsert({
      where: {
        userId_meetingId: {
          userId: data.participantId, // User (participant) ID
          meetingId: meeting.id, // Meeting ID
        },
      },
      update: {
        // Update fields when participant exists
        joinAt: new Date(), // Optionally update 'joinAt' to current time, or any other field
        leftAt: null, // Optionally reset 'leftAt' when rejoining the meeting
      },
      create: {
        userId: data.participantId, // User (participant) ID
        // meetingId: data.meetingId, // Meeting ID
        meetingId: meeting.id, // Meeting ID
        joinAt: new Date(), // Set 'joinAt' to current time on creation
      },
    });

    return createSuccessResponse({
      data: participant,
      message: 'Participant added successfully',
    });
  }

  async startMeeting(meetingCode: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: {
        meetingCode,
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const updatedMeeting = await this.prisma.meeting.update({
      where: {
        meetingCode,
      },
      data: {
        isStarted: true,
        startedAt: new Date(),
      },
    });

    return createSuccessResponse({
      data: updatedMeeting,
      message: 'Meeting started',
    });
  }
  async toggleMeetingStart(meetingCode: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: {
        meetingCode,
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const updatedMeeting = await this.prisma.meeting.update({
      where: {
        meetingCode,
      },
      data: {
        isStarted: !meeting.isStarted,
        startedAt: !meeting.isStarted ? new Date() : meeting.startedAt,
        isEnded: meeting.isStarted ? true : false,
      },
    });

    return createSuccessResponse({
      data: updatedMeeting,
      message: updatedMeeting.isStarted ? 'Meeting started' : 'Meeting stopped',
    });
  }

  // async toggleRecognition(meetingCode: string) {
  //   const meeting = await this.prisma.meeting.findUnique({
  //     where: {
  //       meetingCode,
  //     },
  //   });

  //   if (!meeting) {
  //     throw new NotFoundException('Meeting not found');
  //   }

  //   const updatedMeeting = await this.prisma.meeting.update({
  //     where: {
  //       meetingCode,
  //     },
  //     data: {
  //       // isRecognitionEnabled: !meeting.isRecognitionEnabled,
  //       isRecognitionStarted: !meeting.isRecognitionStarted,
  //       isRecognitionEnded: meeting.isRecognitionStarted ? true : false,
  //     },
  //   });

  //   return createSuccessResponse({
  //     data: updatedMeeting,
  //     message: updatedMeeting.isRecognitionStarted
  //       ? 'Recognition enabled'
  //       : 'Recognition disabled',
  //   });
  // }
  async toggleRecognition(meetingCode: string) {
    // Find the meeting
    const meeting = await this.prisma.meeting.findUnique({
      where: { meetingCode },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const newStatus = !meeting.isRecognitionStarted;

    // Update meeting status in database
    const updatedMeeting = await this.prisma.meeting.update({
      where: { meetingCode },
      data: {
        isRecognitionStarted: newStatus,
        isRecognitionEnded: newStatus ? false : true,
      },
    });

    // Handle interval based on new status
    if (newStatus) {
      // Start the recognition interval
      this.recognitionIntervals[meetingCode] = setInterval(() => {
        if(this.websocketGateway.server){

          this.websocketGateway.server
            .to(`student-${meetingCode}`)
            .emit('RECOGNITION_STATUS', 'started');
        }
      }, 5000);
    } else {
      // Clear the interval if it exists
      if (this.recognitionIntervals[meetingCode]) {
        clearInterval(this.recognitionIntervals[meetingCode]);
        delete this.recognitionIntervals[meetingCode];

        if(this.websocketGateway.server){
          this.websocketGateway.server
            .to(`student-${meetingCode}`)
            .emit('RECOGNITION_STATUS', 'stopped');
        }
      }
    }

    return createSuccessResponse({
      data: updatedMeeting,
      message: newStatus ? 'Recognition enabled' : 'Recognition disabled',
    });
  }
  async startRecognition(meetingCode: string) {
    // Find the meeting
    const meeting = await this.prisma.meeting.findUnique({
      where: { meetingCode },
    });
  
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
  
    // Check if recognition is already started
    if (meeting.isRecognitionStarted) {
      throw new BadRequestException('Recognition is already started');
    }
  
    // Update meeting status in the database
    const updatedMeeting = await this.prisma.meeting.update({
      where: { meetingCode },
      data: {
        isRecognitionStarted: true,
        isRecognitionEnded: false,
      },
    });
  
    // Start the recognition interval
    this.recognitionIntervals[meetingCode] = setInterval(() => {
      console.log(`Emitting RECOGNITION_STATUS at ${new Date().toISOString()}`);

      if (this.websocketGateway.server) {
        this.websocketGateway.server
          .to(`student-${meetingCode}`)
          .emit('RECOGNITION_STATUS', 'started');
      }
    }, 5000);
  
    return createSuccessResponse({
      data: updatedMeeting,
      message: 'Recognition enabled',
    });
  }
  async stopRecognition(meetingCode: string) {
    // Find the meeting
    const meeting = await this.prisma.meeting.findUnique({
      where: { meetingCode },
    });
  
    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }
  
    // Check if recognition is already stopped
    if (!meeting.isRecognitionStarted) {
      throw new BadRequestException('Recognition is already stopped');
    }
  
    // Update meeting status in the database
    const updatedMeeting = await this.prisma.meeting.update({
      where: { meetingCode },
      data: {
        isRecognitionStarted: false,
        isRecognitionEnded: true,
      },
    });
  
    // Clear the interval if it exists
    if (this.recognitionIntervals[meetingCode]) {
      clearInterval(this.recognitionIntervals[meetingCode]);
      delete this.recognitionIntervals[meetingCode];
  
      if (this.websocketGateway.server) {
        this.websocketGateway.server
          .to(`student-${meetingCode}`)
          .emit('RECOGNITION_STATUS', 'stopped');
      }
    }
  
    return createSuccessResponse({
      data: updatedMeeting,
      message: 'Recognition disabled',
    });
  }

  // Clean up method for when the service is destroyed
  onModuleDestroy() {
    // Clear all intervals
    Object.keys(this.recognitionIntervals).forEach((key) => {
      clearInterval(this.recognitionIntervals[key]);
    });
    this.recognitionIntervals = {};
  }

  async findMeetingByMeetCode(meetCode: string) {
    // return `This action returns a #${id} meeting`;
    console.log('meetCode', meetCode);
    const meeting = await this.prisma.meeting.findUnique({
      where: {
        meetingCode: meetCode,
      },
      // include: {
      //   participants: true,
      // },
      include: {
        participants: {
          select: {
            joinAt: true,
            leftAt: true,
            user: {
              select: {
                id: true,
                fullname: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
    console.log('meeting', meeting);

    if (!meeting) {
      throw new NotFoundException('Meeting not foundsss');
    }

    return {
      success: true,
      message: 'Meeting fetched successfully',
      data: meeting,
    };
    // return this.prisma.meeting.findUnique({
    //   where: {
    //     id: id
    //   }
    // })
  }

  async findMeetingById(id: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: {
        id: id,
      },
      include: {
        participants: {
          select: {
            joinAt: true,
            leftAt: true,
            user: {
              select: {
                id: true,
                fullname: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    return {
      success: true,
      message: 'Meeting fetched successfully',
      data: meeting,
    };
  }

  async update(id: string, updateMeetingDto: UpdateMeetingDto) {
    // return `This action updates a #${id} meeting`;

    const findMeeting = await this.prisma.meeting.findUnique({
      where: {
        id: id,
      },
    });

    if (!findMeeting) {
      throw new NotFoundException('Meeting not found');
    }

    const updateMeeting = await this.prisma.meeting.update({
      where: {
        id: id,
      },
      data: updateMeetingDto,
    });

    return {
      success: true,
      message: 'Meeting updated successfully',
      data: updateMeeting,
    };
  }

  remove(id: number) {
    return `This action removes a #${id} meeting`;
  }

  async getMeetingsByUserId(userId: string) {
    const meetings = await this.prisma.meetingParticipant.findMany({
      where: {
        userId: userId,
      },
      include: {
        meeting: true,
      },
    });

    const formattedMeetings = meetings.map(
      (participant) => participant.meeting,
    );

    return {
      message: 'Meetings fetched successfully',
      data: formattedMeetings,
    };
  }
}
