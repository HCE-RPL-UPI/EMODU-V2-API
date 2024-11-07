import { ApiOperation, ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateMeetingDto } from "./create-meeting.dto";
import { IsNotEmpty } from "class-validator";

export class AddParticipantDto  {

  meetingId: string;

  @ApiProperty()
  @IsNotEmpty()
  meetingCode: string

  @ApiProperty()
  @IsNotEmpty()
  participantId: string;
}
