import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class AuditLogMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuditLogMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now().toLocaleString();
    const indonesiaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
    const jakartaDate = new Date();
    // Add 7 hours (7 * 60 * 60 * 1000 milliseconds)
    jakartaDate.setTime(jakartaDate.getTime() + (7 * 60 * 60 * 1000));

    res.on('finish', async () => {
      // const duration = Date.now() - startTime;
      const duration = Date.now() - new Date(startTime).getTime();
      const { method, originalUrl, user } = req;
      const { statusCode } = res;

      const logData = {
        action: `${method} ${originalUrl}`,
        tableName: null,
        recordId: null,
        userId: user?.id || null,
        timestamp: jakartaDate,
        changes: null,
        errorMessages: statusCode >= 400 ? res.locals.errorMessage : null,
      };

      try {
        console.log('logData', logData);
        await this.prisma.auditLog.create({
          data: logData,
        });
      } catch (error) {
        this.logger.error('Failed to log audit data', error);
      }
    });

    next();
  }
}