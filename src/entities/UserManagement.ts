import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { User } from "./User";
import { IsNotEmpty, IsNumber } from "class-validator";

@Entity("user_management")
export class UserManagement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsNumber()
  user_id!: number;

  @Column()
  @IsNumber()
  manager_id!: number;

  @Column()
  @IsNotEmpty()
  start_date!: Date;

  @Column()
  @IsNotEmpty()
  end_date!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  employee!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "manager_id" })
  manager!: User;
}
