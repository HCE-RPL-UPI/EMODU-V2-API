import { Module } from '@nestjs/common';
import { ValenceArousalService } from './valence-arousal.service';
import { ValenceArousalController } from './valence-arousal.controller';

@Module({
  controllers: [ValenceArousalController],
  providers: [ValenceArousalService],
})
export class ValenceArousalModule {}
