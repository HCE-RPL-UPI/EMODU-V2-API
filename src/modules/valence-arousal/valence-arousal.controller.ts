import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ValenceArousalService } from './valence-arousal.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  getValenceArousal() {
    return this.valenceArousalService.getAll();
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ 
    summary: 'Get valence arousal by user',
    description: 'Get all valence arousal data by user',
   })
  getValenceArousalByUser(@Param('userId') userId: string) {

    return this.valenceArousalService.getByUser(userId);
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
