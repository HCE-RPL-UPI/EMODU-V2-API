import { Body, Controller, Get, Param, Post, Query, Req, Request, Res, UseGuards } from '@nestjs/common';
import { RecognitionsService } from './recognitions.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { createRecognitionDto } from './dto/create-recognition.dto';
import { Response } from 'express';

@ApiTags('Recognitions Service(Face-Api.js)')
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

  @Get('export/csv')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Export recognitions data to CSV' })
  async exportRecognitionsToCSV(@Res() res: Response): Promise<void> {
    try {
      const filePath =  (await this.recognitionsService.exportRecognitionsToCSV()).filePath;
      const fileName =  (await this.recognitionsService.exportRecognitionsToCSV()).fileName;

      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });

      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
          // Only send error response if headers haven't been sent
          if (!res.headersSent) {
            res.status(500).send('Error downloading file');
          }
        }
        // Clean up: delete the temporary file
        require('fs').unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting temporary file:', unlinkErr);
          }
        });
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      if (!res.headersSent) {
        res.status(500).send('Error generating CSV file');
      }
    }
  }

  @Get('export/csv/:meetingCode')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Export recognitions data to CSV by meeting code' })
  async exportRecogntionsByMeetingCodeToCSV(@Query('meetingCode') meetingCode: string, @Res() res: Response): Promise<void> {
    
  }

  // @Get('reports')
}
