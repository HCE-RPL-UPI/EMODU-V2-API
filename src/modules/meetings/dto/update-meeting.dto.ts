import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMeetingDto } from './create-meeting.dto';
import { IsEnum, IsInt, IsString, Max, Min } from 'class-validator';
import { AvailableRecognitionModel } from '@prisma/client';

// export class UpdateMeetingDto extends PartialType(CreateMeetingDto) {}
export class UpdateMeetingDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;
}

export class SelectRecognitionModelDto {
  @ApiProperty({ enum: [0, 1, 2], description: 'Recognition model: 0 = NONE, 1 = FACE_API, 2 = EMOVALARO' })
  @IsInt()
  @Min(0)
  @Max(2)
  RecognitionModel: number;
}
