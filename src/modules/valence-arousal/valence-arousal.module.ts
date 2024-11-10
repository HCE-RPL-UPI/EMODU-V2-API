import { Module } from '@nestjs/common';
import { ValenceArousalService } from './valence-arousal.service';
import { ValenceArousalController } from './valence-arousal.controller';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Module({
  controllers: [ValenceArousalController],
  providers: [ValenceArousalService, PrismaService],
})
export class ValenceArousalModule {}
