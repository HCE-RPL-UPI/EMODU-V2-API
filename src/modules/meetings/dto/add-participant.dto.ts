import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateMeetingDto } from "./create-meeting.dto";
import { IsNotEmpty } from "class-validator";

export class AddParticipantDto  {

  @ApiProperty()
  @IsNotEmpty()
  meetingId: string;

  @ApiProperty()
  @IsNotEmpty()
  participantId: string;
}
