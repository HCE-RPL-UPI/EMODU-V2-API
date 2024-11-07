import { Body, Controller, Get, Param, Post, Req, Request, UseGuards } from '@nestjs/common';
import { RecognitionsService } from './recognitions.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { createRecognitionDto } from './dto/create-recognition.dto';

@ApiTags('Recognitions Service')
@ApiBearerAuth()
@Controller('recognition')
export class RecognitionsController {
  constructor(private readonly recognitionsService: RecognitionsService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Post recogntion data' })
  createRecognition(@Request() req, @Body() data: createRecognitionDto) {
    const userId = req.user.userId;
    const payload = {
      ...data,
      userId,
    }
    return this.recognitionsService.createRecognition(payload);
  }

  @Get('overview')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get Recognitions overview from authenticated user' })
  getRecognitionsOverview(@Req() req) {
    const authedUserId = req.user.userId;
    // const payload = {
    //   userId,
    //   createdBy,
    // }
    return this.recognitionsService.getRecognitionOverview(authedUserId);
  }

  @Get('overall/:userId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get Recognitions overall from authenticated user' })
  getRecognitionsOverallByUserId(@Param('userId') userId: string) {
    // return this.recognitionsService.getRecognitionsOverall();
    return this.recognitionsService.getOverallByUserId(userId);
  }

  @Get('summary')
  @UseGuards(AuthGuard('jwt'))
  getRecognitionsSummary() {
    // return this.recognitionsService.getRecognitionsSummary();
  }

  @Get(':meetingCode')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'get recognitions data from meeting instance',
    description: 'get recognitions data from meeting instance by meeting code',
   })
  getRecognitionsByMeetingCode(@Param('meetingCode') meetingCode: string, @Param('limit') limit: number) {
    return this.recognitionsService.getRecognitionsByMeetingCode(meetingCode, limit);
  }

  // @Get('reports')
}
