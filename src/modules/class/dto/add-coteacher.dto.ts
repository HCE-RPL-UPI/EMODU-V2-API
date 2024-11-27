import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AddCoteacherDto {
  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // classId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;
}