import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}
  async create(createClassDto: CreateClassDto) {
    // return 'This action adds a new class';
    const generateClassCode = uuidv4();
    const createClass = await this.prisma.class.create({
      data: {
        ...createClassDto,
        classCode: generateClassCode,
      },
    });

    // automatically join member to the class as a teacher
    await this.prisma.member.create({
      data: {
        role: 'TEACHER',
        joinAt: new Date(),
        userId: createClass.userId,
        classId: createClass.id,
      },
    });

    return {
      message: 'Class created successfully',
      data: createClass,
    };
  }

  async joinClass(payload: any) {
    const { classCode } = payload;
    const findClass = await this.prisma.class.findFirst({
      where: {
        classCode,
      },
    });

    if (!findClass) {
      throw new NotFoundException('Class not found');
    }

    
    const checkMember = await this.prisma.member.findFirst({
      where: {
        userId: payload.userId,
        classId: findClass.id,
      },
    });

    if (checkMember) {
      throw new BadRequestException('You already join the class');
    }

    const joinClass = await this.prisma.member.create({
      data: {
        role: 'STUDENT',
        joinAt: new Date(),
        userId: payload.userId,
        classId: findClass.id,
      },
    });

    return {
      status: 'success',
      message: 'You successfully join the class',
      data: joinClass,
    };
    // return `This action joins a class`;
  }

  findAll() {
    return `This action returns all class`;
  }

  findOne(id: number) {
    return `This action returns a #${id} class`;
  }

  update(id: number, updateClassDto: UpdateClassDto) {
    return `This action updates a #${id} class`;
  }

  remove(id: number) {
    return `This action removes a #${id} class`;
  }
}
