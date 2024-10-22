import { Module } from '@nestjs/common';
import { ArcsService } from './arcs.service';
import { ArcsController } from './arcs.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [ArcsController],
  providers: [ArcsService, ConfigService],
})
export class ArcsModule {}
