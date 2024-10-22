import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(private prisma: PrismaService, private configService: ConfigService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       // secretOrKey: process.env.JWT_SECRET,
//       secretOrKey: configService.get<string>('JWT_SECRET'),
//       // secretOrKey:'BLOG_API_123FEOIVVSOI2sfmi3##49*^@&^%R&^%$#',
//       ignoreExpiration: false,
//     });
//   }

//   async validate(payload: any){
//     const user = await this.prisma.user.findUnique({
//       where: { id: payload.sub }
//     })

//     return user;
//   }
// }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Ini bisa mengembalikan informasi user dari payload JWT
    return { userId: payload.sub, email: payload.email };
  }
}