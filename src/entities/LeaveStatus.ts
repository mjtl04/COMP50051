import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("leave_status")
export class LeaveStatus {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 10 })
  status!: string;
}
