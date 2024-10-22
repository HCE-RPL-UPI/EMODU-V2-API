import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AddParticipantDto } from './dto/add-participant.dto';

@ApiTags('Meetings Service')
@ApiBearerAuth()
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  // CREATE MEETING
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createMeetingDto: CreateMeetingDto) {
    return this.meetingsService.create(createMeetingDto);
  }

  // GET ALL MEETINGS
  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.meetingsService.findAll();
  }

  // ADD PARTICIPANT
  @Patch('add-participant')
  @UseGuards(AuthGuard('jwt'))
  addParticipant(@Body() data: AddParticipantDto) {
    return this.meetingsService.addParticipant(data);
  }

  // GET MEETING BY ID
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(+id);
  }

  // UPDATE MEETING
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateMeetingDto: UpdateMeetingDto) {
    return this.meetingsService.update(+id, updateMeetingDto);
  }

  // DELETE MEETING
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.meetingsService.remove(+id);
  }

  // GET MEETING BY MEET CODE
  @Get(':meetCode')
  @UseGuards(AuthGuard('jwt'))
  findByMeetCode(@Param('meetCode') meetCode: string) {
    // return this.meetingsService.findByMeetCode(meetCode);
  }

  // GET MEETING BY USER ID
  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  findByUserId(@Param('userId') userId: string) {
    return this.meetingsService.getMeetingsByUserId(userId);
  }
}
