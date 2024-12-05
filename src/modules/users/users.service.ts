import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { createSuccessResponse } from 'src/utils/response.utils';
import { ResetPasswordDto, UpdateReinforcementTypeDto, UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ReinforcementTypeEnum } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateUser(data: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateUser = await this.prisma.user.update({
      where: { id: data.id },
      data: {
        ...data,
      },
    });

    return createSuccessResponse({
      data: updateUser,
      message: 'User updated successfully',
    });
  }

  async resetPassword(data: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    const resetPassword = await this.prisma.user.update({
      where: { email: data.email },
      data: {
        password: hashedPassword,
      },
    });

    return createSuccessResponse({
      data: resetPassword,
      message: 'Password updated successfully',
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return createSuccessResponse({
      message: 'User deleted successfully',
      data: null,
    });
  }

  async getReinforcementType(userId: string) {
    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');  
    }

    const reinforcementType = currentUser.reinforcementType

    return {
      success: true,
      message: 'Success get reinforcement type',
      data: reinforcementType,
    }
    // return createSuccessResponse({
    //   su
    //   data: 'positive',
    //   message: 'Reinforcement type',
    // });
  }

  async updateReinforcementType(userId: string, reinforcementType: UpdateReinforcementTypeDto) {
    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        reinforcementType : reinforcementType.reinforcementType,
      },
    });

    // const { password, email,, ...user } = updatedUser;

    return createSuccessResponse({
      data: {
        reinforcementType: updatedUser.reinforcementType,
        email: updatedUser.email,
      },
      message: 'Reinforcement type updated successfully',
    });
  }
}
