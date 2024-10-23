import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as crypto from 'crypto';
// import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    // private mailerService: MailerService
  ) {}

  async register(payload: AuthDto): Promise<User> {
    const getInitial = payload.fullname
      .split(' ')
      .map((n) => n[0])
      .join('');
    const defaultAvatar = `https://ui-avatars.com/api/?name=${getInitial}&background=random&color=fff`;

    const registeredUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: payload.email }],
      },
    });

    if (registeredUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const verificationToken = crypto.randomBytes(32).toString('hex');

    // await 

    return this.prisma.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        fullname: payload.fullname,
        avatar: defaultAvatar,
        verificationToken,
      },
    });
  }

  private async sendVerificationEmail(email:string, token: string){
    const verificationUrl = `${this.configService.get<string>('CLIENT_URL')}/auth/verify-email?token=${token}`;

    // await this.mailerService.sendMail({
    //   to: email,
    //   subject: 'Verify your email',
    //   template: './verification',
    //   context: {
    //     verificationUrl
    //   }
    // })
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: email }],
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id };
    console.log('payload:', payload);
    // console.log(
    //   'JWT_SECRET in AuthService:',
    //   this.configService.get<string>('JWT_SECRET'),
    // );

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: string) {
    const userProfile = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const { password, ...user } = userProfile;

    if (!userProfile) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

 
}
