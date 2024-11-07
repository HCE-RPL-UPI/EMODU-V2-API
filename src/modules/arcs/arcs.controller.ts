import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ArcsService } from './arcs.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('ARCS Service')
@ApiBearerAuth()
@Controller('arcs')
export class ArcsController {
  constructor(private readonly arcsService: ArcsService) {}

  @Get('scores/:email')
  @ApiOperation({ summary: 'Get ARCS scores by email' })
  // @UseGuards(AuthGuard('jwt'))
  getArcsScoreByEmail(@Param('email') email: string) {
    // return this.arcsService.getArcsData();
    return this.arcsService.getScoreByEmailFormatted(email);
  }
}
