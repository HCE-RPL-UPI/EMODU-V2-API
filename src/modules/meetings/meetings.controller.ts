import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { SelectRecognitionModelDto, UpdateMeetingDto } from './dto/update-meeting.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AddParticipantDto } from './dto/add-participant.dto';

@ApiTags('Meetings Service')
@ApiBearerAuth()
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  // CREATE MEETING
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req, @Body() createMeetingDto: CreateMeetingDto) {
    const user = req.user;
    console.log('user', user);
    return this.meetingsService.create(user.userId, createMeetingDto);
  }

  // GET ALL MEETINGS
  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all meetings owned by authenticated user',
    description:
      'This will return all meetings that have been created by the authenticated user',
  })
  findAll(@Request() req) {
    const user = req.user;
    return this.meetingsService.findAll(user);
  }

  // ADD PARTICIPANT
  @Patch('add-participant')
  @UseGuards(AuthGuard('jwt'))
  addParticipant(@Body() data: AddParticipantDto) {
    return this.meetingsService.addParticipant(data);
  }

  // START MEETING
  @Patch('start/:meetingCode')
  @UseGuards(AuthGuard('jwt'))
  startMeeting(@Param('meetingCode') meetingCode: string) {
    return this.meetingsService.startMeeting(meetingCode);
  }

  // TOGGLE START MEETING
  @Patch('toggle-start/:meetingCode')
  @UseGuards(AuthGuard('jwt'))
  toggleStartMeeting(@Param('meetingCode') meetingCode: string) {
    return this.meetingsService.toggleMeetingStart(meetingCode);
  }

  @Patch('toggle-recognition/:meetingCode')
  @UseGuards(AuthGuard('jwt'))
  toggleRecognition(@Param('meetingCode') meetingCode: string) {
    return this.meetingsService.toggleRecognition(meetingCode);
  }

  @Patch('start-recognition/:meetingCode')
  @UseGuards(AuthGuard('jwt'))
  startRecognition(@Param('meetingCode') meetingCode: string) {
    return this.meetingsService.startRecognition(meetingCode);
  }

  @Patch('stop-recognition/:meetingCode')
  @UseGuards(AuthGuard('jwt'))
  stopRecognition(@Param('meetingCode') meetingCode: string) {
    return this.meetingsService.stopRecognition(meetingCode);
  }

  @Patch('select-recognition-model/:meetingCode')
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'meetingCode', required: true })
  @ApiBody({ type: SelectRecognitionModelDto })
  selectRecognitionModel(
    @Param('meetingCode') meetingCode: string,
    @Body() data: SelectRecognitionModelDto,
  ) {
    return this.meetingsService.selectRecognitionModel(meetingCode, data);
  }

  // GET MEETING BY ID
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get a meeting by id',
    description: 'This will return a meeting with the provided id',
  })
  findOne(@Param('id') id: string) {
    return this.meetingsService.findMeetingById(id);
  }

  // UPDATE MEETING
  // @Patch(':id')
  @Patch('update/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Update a meeting',
    description: 'This will update a meeting with the provided id',
  })
  update(@Param('id') id: string, @Body() updateMeetingDto: UpdateMeetingDto) {
    return this.meetingsService.update(id, updateMeetingDto);
  }

  // DELETE MEETING
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.meetingsService.remove(id);
  }

  // GET MEETING BY MEET CODE
  @Get('/meet-code/:meetCode')
  @UseGuards(AuthGuard('jwt'))
  findByMeetCode(@Param('meetCode') meetCode: string) {
    return this.meetingsService.findMeetingByMeetCode(meetCode);
  }

  // GET MEETING BY USER ID
  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all meetings by user id',
    description:
      'Get all meetings by user id. This will return all meetings that the user is a participant of',
  })
  findByUserId(@Param('userId') userId: string) {
    return this.meetingsService.getMeetingsByUserId(userId);
  }
}
