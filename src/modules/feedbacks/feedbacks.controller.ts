import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@ApiTags('Feedbacks Service')
@ApiBearerAuth()
@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  create(@Body() data: CreateFeedbackDto) {
    return this.feedbacksService.createFeedback(data);
  }

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.feedbacksService.findAll();
  }

  @Get('aggregate')
  @UseGuards(AuthGuard('jwt'))
  aggregateFeedbacks() {
    return this.feedbacksService.aggregateFeedbacks();
  }
}
