import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ValenceArousalService } from './valence-arousal.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateValaroDto } from './dto/create-valaro.dto';

@ApiTags('Valence Arousal Services')
@ApiBearerAuth()
@Controller('valence-arousal')
export class ValenceArousalController {
  constructor(private readonly valenceArousalService: ValenceArousalService) {}

  @Get('all')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Get valence arousal',
    description: 'Get all valence arousal data',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getValenceArousal(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',  
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);   
     return this.valenceArousalService.getAll(pageNumber, limitNumber);
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Get valence arousal by user',
    description: 'Get all valence arousal data by user',
   })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getValenceArousalByUser(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.valenceArousalService.getByUser(userId, pageNumber, limitNumber);
  }

  @Get('export-csv-all/user')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Export valence arousal data by user to CSV',
   })
  exportCsvAllByUser() {
    // return this.valenceArousalService.exportCsvAllByUser();
  }

  

  // @Get(':meetingCode')
  // @UseGuards(AuthGuard('jwt'))
  // @ApiOperation({ 
  //   summary: 'Get valence arousal by meeting code',
  //   description: 'Get all valence arousal data by meeting code',
  //  })
  // @ApiQuery({ name: 'page', required: false, type: Number })
  // @ApiQuery({ name: 'limit', required: false, type: Number })
  // getValenceArousalByMeetingCode(
  //   @Param('meetingCode') meetingCode: string,
  //   @Query('page') page: string = '1',
  //   @Query('limit') limit: string = '10',
  // ) {
  //   console.log(meetingCode);
  //   // const pageNumber = parseInt(page, 10);
  //   // const limitNumber = parseInt(limit, 10);
  //   return this.valenceArousalService.getAnalyticsByMeetingCode(meetingCode);
  // }

  @Get('analytics')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get valence arousal analytics by meeting code',
    description: 'Get all valence arousal analytics data by meeting code',
  })
  getAnalytics(@Query('meetingCode') meetingCode?: string) {
    console.log(meetingCode);
    return this.valenceArousalService.getAnalytics(meetingCode);
  }

  // get analytics by user
  @Get('analytics/user')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get valence arousal analytics by user in a meeting',
  })
  getAnalyticsByUser(
    @Query('userId') userId?: string,
    @Query('meetingCode') meetingCode?: string
  ) {
    console.log(userId);
    return this.valenceArousalService.getAnalyticsByUserAndMeetingCode(userId, meetingCode);
  }



  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Create valence arousal',
    description: 'Create valence arousal data',
   })
  createValenceArousal(@Body() body: CreateValaroDto) {
    return this.valenceArousalService.create(body);
  }
}
