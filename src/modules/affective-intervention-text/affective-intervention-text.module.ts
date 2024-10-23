import { Module } from '@nestjs/common';
import { AffectiveInterventionTextService } from './affective-intervention-text.service';
import { AffectiveInterventionTextController } from './affective-intervention-text.controller';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Module({
  controllers: [AffectiveInterventionTextController],
  providers: [AffectiveInterventionTextService, PrismaService],
})
export class AffectiveInterventionTextModule {}
