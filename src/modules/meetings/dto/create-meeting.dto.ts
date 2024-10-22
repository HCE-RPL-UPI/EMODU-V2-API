import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateMeetingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  meetingCode : string;

  @ApiProperty()
  @IsString()
  link: string;

  @ApiProperty()
  @IsString()
  classId: string;

  @IsString()
  createdBy: string;

}
