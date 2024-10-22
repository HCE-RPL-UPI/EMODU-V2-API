import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JoinClassDto } from './dto/join-class.dto';

@ApiTags('Class Services')
@ApiBearerAuth()
@Controller('class')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req, @Body() createClassDto: CreateClassDto) {
    const userId = req.user.userId;
    console.log(userId);
    const payload = {
      ...createClassDto,
      userId
    }
    return this.classService.create(payload);
  }

  @Post('join')
  @UseGuards(AuthGuard('jwt'))
  joinClass(@Request() req, @Body() joinClassDto: JoinClassDto) {
    const userId: string = req.user.userId;
    const payload: JoinClassDto = {
      ...joinClassDto,
      userId
    }
    return this.classService.joinClass(payload);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.classService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.classService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classService.update(+id, updateClassDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.classService.remove(+id);
  }
}
