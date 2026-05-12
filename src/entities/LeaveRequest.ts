import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, BeforeInsert } from "typeorm";
import { IsInt, IsNotEmpty } from "class-validator";
import { LeaveStatus } from "./LeaveStatus";
import { LeaveType } from "./LeaveType";
import { User } from "./User";

@Entity("leave_requests")
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsNotEmpty()
  user_id!: number;

  @Column()
  @IsNotEmpty()
  @IsInt()
  type_id!: number;

  @Column()
  @IsInt()
  status_id: number = 1;

  @Column()
  raised_date!: Date;

  @Column()
  @IsNotEmpty()
  start_date!: Date;

  @Column()
  @IsNotEmpty()
  end_date!: Date;

  @Column()
  comment!: string;

  @Column()
  reviewed_by!: number;

  @Column()
  reviewed_date!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "reviewed_by" })
  reviewer!: User;

  @ManyToOne(() => LeaveType)
  @JoinColumn({ name: "type_id" })
  leaveType!: LeaveType;

  @ManyToOne(() => LeaveStatus)
  @JoinColumn({ name: "status_id" })
  leaveStatus!: LeaveStatus;

  @BeforeInsert()
  setRaisedDate() {
    this.raised_date = new Date();
  }
}
