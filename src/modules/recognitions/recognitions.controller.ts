import { Controller, Get, UseGuards } from '@nestjs/common';
import { RecognitionsService } from './recognitions.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Recognitions Service')
@Controller('recognition')
export class RecognitionsController {
  constructor(private readonly recognitionsService: RecognitionsService) {}

  @Get('overview')
  @UseGuards(AuthGuard('jwt'))
  getRecognitionsOverview() {
    // return this.recognitionsService.getRecognitionsOverview();
  }

  // @Get('reports')
}
