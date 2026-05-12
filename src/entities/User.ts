import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert, } from "typeorm";
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches, } from "class-validator";
import { PasswordHandler } from "../utilities/PasswordHandler";
import { Role } from "./Role";
import { Department } from "./Department";
import { Exclude } from "class-transformer";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 30 })
  @IsNotEmpty({ message: "First Name is required" })
  @MaxLength(30, { message: "First Name must be 30 characters or less" })
  @Matches(/\S/, { message: "First Name cannot be empty or whitespace" })
  first_name!: string;

  @Column({ type: "varchar", length: 30 })
  @IsNotEmpty({ message: "Last Name is required" })
  @MaxLength(30, { message: "Last Name must be 30 characters or less" })
  @Matches(/\S/, { message: "Last Name cannot be empty or whitespace" })
  last_name!: string;

  @Column({ unique: true })
  @IsEmail({}, { message: "Must be a valid email address" })
  @Matches(/\S/, { message: "Email cannot be empty or whitespace" })
  email!: string;

  @Column()
  @IsString()
  // @Exclude()
  @MinLength(10, { message: "Password must be at least 10 characters long" })
  @Matches(/\S/, { message: "Password cannot be empty or whitespace" })
  password!: string;

  @Column()
  leave_balance: number = 25;

  @Column()
  role_id!: number;

  @Column()
  department_id!: number;

  @ManyToOne(() => Role, { nullable: false, eager: true })
  @JoinColumn({ name: "role_id" })
  role!: Role;

  @ManyToOne(() => Department, { nullable: false, eager: true })
  @JoinColumn({ name: "department_id" })
  department!: Department;

  @BeforeInsert()
  async hashPassword() {
    if (!this.password) {
      throw new Error("Password must be provided before inserting a user.");
    }
    this.password = await PasswordHandler.hashPassword(this.password)
  }
}
