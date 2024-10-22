import { Body, Controller, Get, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthDto, LoginDto } from './dto/auth.dto';

@ApiTags('Auth Services')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService){}

  @Post('register')
  @ApiResponse({ status: 201, description: 'The record has been successfully created.'})
  async register(@Body() registerPayloadDto: AuthDto) {
    // return await this.authService.register();
    return await this.authService.register(registerPayloadDto);
  }

  @Post('login')
  async login(@Body() loginPayloadDto: LoginDto) {
    const user = await this.authService.validateUser(loginPayloadDto.email, loginPayloadDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async profile(@Request() req) {
    // return this.authService.;
    const userId = req.user.userId;

    return this.authService.getProfile(userId);
  }
 

  
}
