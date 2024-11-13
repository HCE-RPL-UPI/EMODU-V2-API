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
