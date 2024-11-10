import { ApiProperty } from "@nestjs/swagger";

export class GetValaroByUserDto {
    @ApiProperty()
    userId: string;
}