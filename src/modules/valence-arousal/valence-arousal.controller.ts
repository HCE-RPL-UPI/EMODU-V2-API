import { Controller } from '@nestjs/common';
import { ValenceArousalService } from './valence-arousal.service';

@Controller('valence-arousal')
export class ValenceArousalController {
  constructor(private readonly valenceArousalService: ValenceArousalService) {}
}
