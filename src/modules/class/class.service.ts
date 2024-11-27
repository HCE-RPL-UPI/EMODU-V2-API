import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { createSuccessFetchResponse } from 'src/utils/response.utils';
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

  async findAll(userId: string, filter?: string) {
    // filter by all, owned, joined
    if (filter === 'owned') {
      const ownedClasses = await this.prisma.class.findMany({
        where: {
          userId,
        },
        include: {
          user: {
            select: {
              fullname: true,
              email: true,
              avatar: true,
            },
          },
          meetings: {
            select: {
              _count: true,
            },
          },
        },
      });

      return createSuccessFetchResponse({
        message: 'Owned classes fetched successfully',
        totalCount: ownedClasses.length,
        data: ownedClasses,
      });
    }

    if (filter === 'joined') {
      const joinedClasses = await this.prisma.member.findMany({
        where: {
          userId,
        },
        include: {
          class: {
            include: {
              user: {
                select: {
                  fullname: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      return createSuccessFetchResponse({
        message: 'Joined classes fetched successfully',
        totalCount: joinedClasses.length,
        data: joinedClasses,
      });
    }
    // return `This action returns all class`;
    const classes = await this.prisma.class.findMany({
      where: {
        // userId,
        members: {
          some: {
            userId,
          },
        },
      },
      orderBy:{
        createdAt : 'desc'
      },
      include: {
        user: {
          select: {
            fullname: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          select: {
            id: true,
            role: true,
            userId: true,
            joinAt: true,
            user: {
              select: {
                fullname: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        meetings: {
          select: {
            name: true,
            meetingCode: true,
          }
        },
      },
    });

    if (!classes) {
      throw new NotFoundException('No class found');
    }

    return createSuccessFetchResponse({
      message: 'All classes fetched successfully',
      totalCount: classes.length,
      data: classes,
    });
  }

  async findOne(id: string) {
    const findClass = await this.prisma.class.findUnique({
      where: {
        id,
      },
      include: {
        meetings: true,
        members: {
          select: {
            role: true,
            userId: true,
            joinAt: true,
            user: {
              select: {
                fullname: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!findClass) {
      throw new NotFoundException('Class not found');
    }

    return {
      success: true,
      message: 'Class fetched successfully',
      data: findClass,
    };
    // return `This action returns a #${id} class`;
  }

  async update(id: string, updateClassDto: UpdateClassDto) {
    const findClass = await this.prisma.class.findUnique({
      where: {
        id,
      },
    });

    if (!findClass) {
      throw new NotFoundException('Class not found');
    }

    const updateClass = await this.prisma.class.update({
      where: {
        id,
      },
      data: updateClassDto,
    });

    return {
      message: 'Class updated successfully',
      data: updateClass,
    };
  }

  async remove(id: string) {
    // return `This action removes a #${id} class`;
    const findClass = await this.prisma.class.findUnique({
      where: {
        id,
      },
    });

    if (!findClass) {
      throw new NotFoundException('Class not found');
    }

    await this.prisma.class.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: 'Class deleted successfully',
      // data: deleteClass,
    };
  }

  async addCoteacher(classId: string, userId: string) {
    const findClass = await this.prisma.class.findUnique({
      where: {
        id: classId,
      },
    });

    if (!findClass) {
      throw new NotFoundException('Class not found');
    }

    const findUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!findUser) {
      throw new NotFoundException('User not found');
    }

    const checkMember = await this.prisma.member.findFirst({
      where: {
        userId,
        classId,
      },
    });

    if (!checkMember) {
      throw new BadRequestException('User not joined the class');
    }

    const checkCoteacher = await this.prisma.member.findFirst({
      where: {
        userId,
        classId,
        role: 'TEACHER',
      },
    });

    if (checkCoteacher) {
      throw new BadRequestException('User already a co-teacher');
    }

    const addCoteacher = await this.prisma.member.update({
      where: {
        id: checkMember.id,
      },
      data: {
        role: 'TEACHER',
      },
    });
 

    return {
      message: 'Co-teacher added successfully',
      data: addCoteacher,
    };
  }

  async removeCoteacher(classId: string, userId: string) {
    const findClass = await this.prisma.class.findUnique({
      where: {
        id: classId,
      },
    });

    if (!findClass) {
      throw new NotFoundException('Class not found');
    }

    const findUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!findUser) {
      throw new NotFoundException('User not found');
    }

    const checkMember = await this.prisma.member.findFirst({
      where: {
        userId,
        classId,
      },
    });

    if (!checkMember) {
      throw new BadRequestException('User not joined the class');
    }

    const checkCoteacher = await this.prisma.member.findFirst({
      where: {
        userId,
        classId,
        role: 'TEACHER',
      },
    });

    if (!checkCoteacher) {
      throw new BadRequestException('User not a co-teacher');
    }

    const removeCoteacher = await this.prisma.member.update({
      where: {
        id: checkMember.id,
      },
      data: {
        role: 'STUDENT',
      },
    });

    return {
      message: 'Co-teacher removed successfully',
      data: removeCoteacher,
    };
  }
}
