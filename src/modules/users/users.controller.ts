import {
  Body,
  Controller,
  Delete,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ResetPasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('User Services')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('update')
  @UseGuards(AuthGuard('jwt'))
  updateUser(@Body() data: UpdateUserDto) {
    return this.usersService.updateUser(data);
  }

  @Patch('reset-password')
  @UseGuards(AuthGuard('jwt'))
  forgotPassword(@Body() data: ResetPasswordDto) {
    return this.usersService.resetPassword(data);
  }

  @Delete('delete')
  @UseGuards(AuthGuard('jwt'))
  deleteUser(@Request() req) {
    const userId = req.user.userId;
    return this.usersService.deleteUser(userId);
  }
}
