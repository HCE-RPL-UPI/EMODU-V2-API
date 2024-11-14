import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaService } from './services/prisma/prisma.service';
import { GoogleSheetService } from './services/google-sheet/google-sheet.service';
import { ClassModule } from './modules/class/class.module';
import { UsersModule } from './modules/users/users.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { RecognitionsModule } from './modules/recognitions/recognitions.module';
import { ArcsModule } from './modules/arcs/arcs.module';
import { FeedbacksModule } from './modules/feedbacks/feedbacks.module';
import { WebsocketGateway } from './services/websocket/websocket.gateway';
import { AffectiveInterventionTextModule } from './modules/affective-intervention-text/affective-intervention-text.module';
import { ValenceArousalModule } from './modules/valence-arousal/valence-arousal.module';
import { ConfigModule } from '@nestjs/config';
import { AuditLogMiddleware } from './middlewares/audit-log.middleware';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    AuthModule,
    ClassModule,
    UsersModule,
    MeetingsModule,
    RecognitionsModule,
    ArcsModule,
    FeedbacksModule,
    AffectiveInterventionTextModule,
    ValenceArousalModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    GoogleSheetService,
    WebsocketGateway,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuditLogMiddleware).forRoutes('*');
  }
}
