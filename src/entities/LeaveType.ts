import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("leave_types")
export class LeaveType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 10 })
  type!: string;
}
