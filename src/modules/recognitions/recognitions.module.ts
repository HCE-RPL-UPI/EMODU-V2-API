import { Module } from '@nestjs/common';
import { RecognitionsService } from './recognitions.service';
import { RecognitionsController } from './recognitions.controller';
import { WebsocketGateway } from 'src/services/websocket/websocket.gateway';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Module({
  controllers: [RecognitionsController],
  providers: [RecognitionsService, PrismaService, WebsocketGateway],
})
export class RecognitionsModule {}
