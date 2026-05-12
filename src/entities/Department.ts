import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsNotEmpty, Matches } from "class-validator";

@Entity("departments")
export class Department {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 10 })
  @IsNotEmpty({ message: "Department name is required" })
  @Matches(/\S/, { message: "Department name cannot be empty or whitespace" })
  department!: string;
}
