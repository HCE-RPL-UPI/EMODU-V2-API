import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JoinClassDto } from './dto/join-class.dto';
import { AddCoteacherDto } from './dto/add-coteacher.dto';

@ApiTags('Class Services')
@ApiBearerAuth()
@Controller('class')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a class' })
  create(@Request() req, @Body() createClassDto: CreateClassDto) {
    const userId = req.user.userId;
    console.log(userId);
    const payload = {
      ...createClassDto,
      userId,
    };
    return this.classService.create(payload);
  }

  @Post('join')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Join a class' })
  joinClass(@Request() req, @Body() joinClassDto: JoinClassDto) {
    const userId: string = req.user.userId;
    const payload: JoinClassDto = {
      ...joinClassDto,
      userId,
    };
    return this.classService.joinClass(payload);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all classes by current user',
    description:
      'Get all classes by current user. If filter is provided, it will filter the classes by the given string. The filter consists of "joined" or "owned". If the filter is not provided, it will return all classes by current user.',
  })
  @ApiQuery({ name: 'filter', required: false })
  findAll(@Request() req, @Query('filter') filter?: string) {
    const userId = req.user.userId;
    return this.classService.findAll(userId, filter);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get a class by id',
    description: 'Get a class by id',
  })
  findOne(@Param('id') id: string) {
    return this.classService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update a class' })
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classService.update(id, updateClassDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Remove a class' })
  remove(@Param('id') id: string) {
    return this.classService.remove(id);
  }

  // add member as co-teacher/co-owner
  @Patch('add-coteacher/:classId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Add member of class as a co-teacher to a class' })
  addCoTeacher(@Param('classId') classId: string, @Body() addCoteacherDto: AddCoteacherDto) {
    // return this.classService.addCoTeacher(classId, userId);
    return this.classService.addCoteacher(classId, addCoteacherDto.userId);
  }

  // remove member as co-teacher/co-owner
  @Patch('remove-coteacher/:classId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Remove member of class as a co-teacher to a class' })
  removeCoTeacher(@Param('classId') classId: string, @Body() addCoteacherDto: AddCoteacherDto) {
    return this.classService.removeCoteacher(classId, addCoteacherDto.userId);
  }

}
