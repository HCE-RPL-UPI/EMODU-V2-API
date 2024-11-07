import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMeetingDto } from './create-meeting.dto';
import { IsString } from 'class-validator';

// export class UpdateMeetingDto extends PartialType(CreateMeetingDto) {}
export class UpdateMeetingDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;
}
