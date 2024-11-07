import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { WebsocketGateway } from 'src/services/websocket/websocket.gateway';

@Module({
  controllers: [MeetingsController],
  providers: [MeetingsService, PrismaService, WebsocketGateway],
})
export class MeetingsModule {}
