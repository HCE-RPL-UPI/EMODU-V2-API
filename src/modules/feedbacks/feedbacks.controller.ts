import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@ApiTags('Feedbacks Service')
@ApiBearerAuth()
@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create feedback' })
  @UseGuards(AuthGuard('jwt'))
  create(@Body() data: CreateFeedbackDto) {
    return this.feedbacksService.createFeedback(data);
  }

  @Get('')
  @ApiOperation({ summary: 'Get all feedbacks' })
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.feedbacksService.findAll();
  }

  @Get('aggregate')
  @ApiOperation({ summary: 'Aggregate feedbacks' })
  @UseGuards(AuthGuard('jwt'))
  aggregateFeedbacks() {
    return this.feedbacksService.aggregateFeedbacks();
  }
}
