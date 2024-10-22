import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { createSuccessResponse } from 'src/utils/response.utils';
import { AddParticipantDto } from './dto/add-participant.dto';

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createMeetingDto: CreateMeetingDto) {
    const timestamp = new Date(Date.now()).toISOString();
    const generatedMeetingCode = timestamp.replace(/[-:]/g, '').replace('.', '').replace('T', '').replace('Z', '')
    const getClass = await this.prisma.class.findUnique({
      where: {
        id: createMeetingDto.classId
      }
    })

    if (!getClass) {
      throw new NotFoundException('Class not found')
    }

    const meeting = await this.prisma.meeting.create({
      data: {
        ...createMeetingDto,
        meetingCode: generatedMeetingCode,
        isStarted: false,
        isEnded: false,
        classId: createMeetingDto.classId,
      }
    })

    return createSuccessResponse({
      data: meeting,
      message: 'Meeting created successfully'
    })
  }

  async findAll() {
    const meetings =await this.prisma.meeting.findMany();

    if (meetings.length === 0) {
      throw new NotFoundException('No meetings found');
    }

    return {
      data: meetings,
      message: 'All meetings fetched successfully'
    }
    // return `This action returns all meetings`;
  }

  async addParticipant(data:AddParticipantDto) {
    const meeting = await this.prisma.meeting.findUnique({
      where: {
        id: data.meetingId
      }
    })

    if (!meeting) {
      throw new NotFoundException('Meeting not found')
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: data.participantId
      }
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }


    const participant = await this.prisma.meetingParticipant.upsert({
      where: {
        userId_meetingId: {
          userId: data.participantId,    // User (participant) ID
          meetingId: data.meetingId,     // Meeting ID
        },
      },
      update: {
        // Update fields when participant exists
        joinAt: new Date(),              // Optionally update 'joinAt' to current time, or any other field
        leftAt: null,                    // Optionally reset 'leftAt' when rejoining the meeting
      },
      create: {
        userId: data.participantId,      // User (participant) ID
        meetingId: data.meetingId,       // Meeting ID
        joinAt: new Date(),              // Set 'joinAt' to current time on creation
      },
    });
  
    return createSuccessResponse({
      data: participant,
      message: 'Participant added successfully'
    })
  }

  findOne(id: number) {
    return `This action returns a #${id} meeting`;
  }

  update(id: number, updateMeetingDto: UpdateMeetingDto) {
    return `This action updates a #${id} meeting`;
  }

  remove(id: number) {
    return `This action removes a #${id} meeting`;
  }

  async getMeetingsByUserId(userId: string) {
    const meetings = await this.prisma.meetingParticipant.findMany({
      where: {
        userId: userId
      },
      include:{
        meeting: true
      }
    })

    const formattedMeetings = meetings.map((participant) => participant.meeting)

    return {
      message: 'Meetings fetched successfully',
      data: formattedMeetings
    }
  }
}
