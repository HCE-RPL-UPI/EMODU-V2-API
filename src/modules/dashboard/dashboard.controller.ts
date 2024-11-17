import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AvailableRecognitionModel } from '@prisma/client';

enum ModelName {
  'face-api',
  'emovalaro'
}

@ApiTags('Dashboard Services')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('count')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Get dashboard data',
    description: 'Get number of students that joined your class, number of current user classes, number of meetings, and number of students that participated in the meeting',
   })
  getDashboardData(@Request() req) {
    const userId = req.user.userId;
    return this.dashboardService.getDashboardData(userId);
  }

  @Get('recent-meetings')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get recent meetings by current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRecentMeetings(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const userId = req.user.userId;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.dashboardService.getRecentMeetings(userId, pageNumber, limitNumber);
  }

  @Get('emotion-distribution')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Get emotion distribution',
    description: 'Get emotion distribution data from all models based on current user',
   })
  @ApiQuery({ 
    name: 'modelName', 
    required: false, 
    enum : AvailableRecognitionModel,
    type: String,
  })
  getEmotionDistribution(@Request() req, @Query('modelName') modelName?: string) {
    const userId = req.user.userId;
    return this.dashboardService.getEmotionDistribution(userId, modelName);
  }

}
