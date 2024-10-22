import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class JoinClassDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    classCode: string;

    userId: string;
}