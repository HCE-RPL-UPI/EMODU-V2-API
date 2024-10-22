import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host : 'smtp.gmail.com',
      }
    })
  ]
})
export class MailerConfigModule {}
