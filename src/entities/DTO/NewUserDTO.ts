
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsNumber } from "class-validator";

export class NewUserDTO {
    @IsNotEmpty({ message: "First Name is required" })
    @MaxLength(30, { message: "First Name must be 30 characters or less" })
    @Matches(/\S/, { message: "First Name cannot be empty or whitespace" })
    @Matches(/^[a-zA-Z\s]+$/, { message: 'First Name can only contain letters' })
    first_name!: string;

    @IsNotEmpty({ message: "Last Name is required" })
    @MaxLength(30, { message: "Last Name must be 30 characters or less" })
    @Matches(/\S/, { message: "Last Name cannot be empty or whitespace" })
    @Matches(/^[a-zA-Z\s]+$/, { message: 'Last Name can only contain letters' })
    last_name!: string;

    @IsEmail({}, { message: "Must be a valid email address" })
    @Matches(/\S/, { message: "Email cannot be empty or whitespace" })
    email!: string;

    @IsString({ message: "password must be a string" })
    @IsNotEmpty({ message: "password should not be empty" })
    @MinLength(10, { message: "Password must be at least 10 characters long" })
    @Matches(/\S/, { message: "Password cannot be empty or whitespace" })
    password!: string;

    @IsNumber({}, { message: "role_id must be a number" })
    @IsNotEmpty({ message: "role_id is required" })
    role_id!: number;

    @IsNumber({}, { message: "department_id must be a number" })
    @IsNotEmpty({ message: "department_id is required" })
    department_id!: number;
}