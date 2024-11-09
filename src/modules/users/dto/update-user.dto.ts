import { ApiProperty } from "@nestjs/swagger";
import {  IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
    id: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    fullName: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    password: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
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