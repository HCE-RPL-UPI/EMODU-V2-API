import { ApiProperty } from "@nestjs/swagger";

export class createRecognitionDto{
  @ApiProperty()
  meetingCode: string;

  // @ApiProperty()
  userId: string;
  
  @ApiProperty()
  neutral: number;

  @ApiProperty()
  happy: number;

  @ApiProperty()
  sad: number;

  @ApiProperty()
  angry: number;

  @ApiProperty()
  fearful: number;

  @ApiProperty()
  disgusted: number;

  @ApiProperty()
  surprised: number;

  @ApiProperty()
  predict: string;

  // @ApiProperty()
  // image: string;
}