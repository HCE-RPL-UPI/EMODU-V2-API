import {
  Body,
  Controller,
  Get,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ResetPasswordDto, UpdateReinforcementTypeDto, UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

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

  // @Delete('delete')
  // @UseGuards(AuthGuard('jwt'))
  // deleteUser(@Request() req) {
  //   const userId = req.user.userId;
  //   return this.usersService.deleteUser(userId);
  // }

  @Get('reinforcement-type')
  @ApiOperation({ 
    summary: 'Get reinforcement type by current user',
    description: 'Reinforcement type is a type to define user preference for text intervention feature. The value is either "positive" or "negative".'
   })
  @UseGuards(AuthGuard('jwt'))
  getReinforcementTypeCurrentUser(@Request() req) {
    const userId = req.user.userId;
    // console.log('userId', userId);
    return this.usersService.getReinforcementType(userId);
  }

  @Patch('reinforcement-type')
  @ApiOperation({ 
    summary: 'Update reinforcement type by current user',
    description: 'Reinforcement type is a type to define user preference for text intervention feature. The value is either "positive" or "negative".'
   })
  @UseGuards(AuthGuard('jwt'))
  updateReinforcementTypeCurrentUser(@Request() req, @Body() data: UpdateReinforcementTypeDto) {
    const userId = req.user.userId;
    // console.log('userId', userId);
    return this.usersService.updateReinforcementType(userId, data);
  }
}
