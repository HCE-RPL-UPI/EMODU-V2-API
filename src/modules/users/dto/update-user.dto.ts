import { ApiProperty } from "@nestjs/swagger";
import {  IsEmail, IsString } from "class-validator";

export class UpdateUserDto {
    id: string;

    @ApiProperty()
    @IsString()

    name: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsString()
    avatar : string;
}

export class ResetPasswordDto {
    @ApiProperty()
    @IsEmail()
    email : string;

    @ApiProperty()
    @IsString()
    newPassword : string;
}