import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Module({
  controllers: [MeetingsController],
  providers: [MeetingsService, PrismaService],
})
export class MeetingsModule {}
