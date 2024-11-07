import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches } from "class-validator";

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

  meetingCode : string;

  // @ApiProperty()
  // @IsString()
  // @Matches(/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/i, {
  //   message: 'The link must be a valid Google Meet URL format: https://meet.google.com/{3-letter}/{4-letter}/{3-letter}',
  // }) 
  link: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  classId: string;

  // @IsString()
  // createdBy: string;

}
