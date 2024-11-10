import { ApiProperty } from "@nestjs/swagger";

export class CreateValaroDto {
  @ApiProperty()
  valence: number;

  @ApiProperty()
  arousal: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  emotionPercentages: number

  @ApiProperty()
  emotion: string;

  @ApiProperty()
  meetingCode: string;
}