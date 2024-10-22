import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateFeedbackDto {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  rating: number;
}
